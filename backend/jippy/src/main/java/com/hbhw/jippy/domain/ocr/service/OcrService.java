package com.hbhw.jippy.domain.ocr.service;

import com.hbhw.jippy.domain.ocr.dto.response.OcrExtractedData;
import com.hbhw.jippy.domain.ocr.dto.response.OcrResponse;
import com.hbhw.jippy.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class OcrService {

    private final RestTemplate restTemplate;

    @Value("${api.upstage.key}")
    private String apiKey;

    @Value("${api.upstage.url}")
    private String upstageApiUrl;

    /**
     * 실제 OCR API 호출 및 응답 받는 메서드
     */
    public OcrResponse callOcrApi(MultipartFile file) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("Authorization", "Bearer " + apiKey);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };
        // API 스펙에 맞춰 "document" 필드로 전송
        body.add("document", fileResource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<OcrResponse> response = restTemplate.postForEntity(
                upstageApiUrl,
                requestEntity,
                OcrResponse.class
        );
        return response.getBody();
    }

    /**
     * OCR 수행 후, 필요한 사업자정보(등록번호, 법인명, 대표자, 개업연월일)를 추출해서 리턴
     */
    public OcrExtractedData performOcr(MultipartFile file) {
        OcrResponse ocrResponse;
        try {
            ocrResponse = callOcrApi(file);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        String combinedText = String.join(
                " ",
                ocrResponse.getPages().stream()
                        .flatMap(page -> page.getWords().stream())
                        .map(word -> word.getText())
                        .toList()
        );

        return OcrExtractedData.builder()
                .businessNumber(Optional.ofNullable(extractBusinessNumber(combinedText)).orElse(""))
                .corporateName(Optional.ofNullable(extractStoreName(combinedText)).orElse(""))
                .representativeName(Optional.ofNullable(extractRepresentativeName(combinedText)).orElse(""))
                .openDate(Optional.ofNullable(extractOpenDate(combinedText)).orElse(""))
                .build();
    }

    /**
     * 사업자등록번호 추출 (예: 109-81-72945)
     * 추출 후에는 하이픈 제거 (1098172945)
     */
    private String extractBusinessNumber(String text) {
        // "등록번호 : 109-81-72945" 형태에서 추출
        // OCR 결과마다 표현이 달라질 수 있으므로 상황에 맞춰 보정
        Pattern pattern = Pattern.compile("등록번호\\s*:\\s*(\\d{3}-\\d{2}-\\d{5})");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            // 하이픈 제거
            return matcher.group(1).replaceAll("-", "");
        }
        return null;
    }

    /**
     * 상호 & 법인명(단체명)에 대한 중복 처리
     * 어떤 게 나오든 우선 매칭되는 것을 추출
     */
    private String extractStoreName(String text) {
        // 두 가지 패턴을 하나의 Regex로 합치거나, 순차적으로 검사 가능
        // 여기서는 순차적 검사 예시

        // 1) "상 호 :"
        Pattern pattern1 = Pattern.compile("상\\s*호\\s*:\\s*(.*?)\\s*(?=성\\s*명|대\\s*표\\s*자|개\\s*업|$)");
        Matcher matcher1 = pattern1.matcher(text);
        if (matcher1.find()) {
            return matcher1.group(1).trim();
        }

        // 2) "법인명(단체명) :"
        Pattern pattern2 = Pattern.compile("법인명\\(단체명\\)\\s*:\\s*(.*?)\\s*(?=성\\s*명|대\\s*표\\s*자|개\\s*업|$)");
        Matcher matcher2 = pattern2.matcher(text);
        if (matcher2.find()) {
            return matcher2.group(1).trim();
        }

        // 둘 다 없으면 null
        return null;
    }

    /**
     * 대표자 & 성명에 대한 중복 처리
     * 어떤 게 나오든 우선 매칭되는 것을 추출
     */
    private String extractRepresentativeName(String text) {
        // 1) "성 명 :"
        Pattern pattern1 = Pattern.compile("성\\s*명\\s*:\\s*(.*?)\\s*(?=생\\s*년\\s*월\\s*일|개\\s*업|$)");
        Matcher matcher1 = pattern1.matcher(text);
        if (matcher1.find()) {
            return matcher1.group(1).trim();
        }

        // 2) "대 표 자 :"
        Pattern pattern2 = Pattern.compile("대\\s*표\\s*자\\s*:\\s*(.*?)\\s*(?=개\\s*업|등록번호|법인명|상\\s*호|$)");
        Matcher matcher2 = pattern2.matcher(text);
        if (matcher2.find()) {
            return matcher2.group(1).trim();
        }

        return null;
    }

    /**
     * "개 업 연 월 일 : 2019 년 12 월 16 일" 형태
     * => "2019-12-16 00:00:00"
     */
    private String extractOpenDate(String text) {
        Pattern fieldPattern = Pattern.compile("개\\s*업\\s*연\\s*월\\s*일\\s*:\\s*(\\d{4}\\s*년\\s*\\d{1,2}\\s*월\\s*\\d{1,2}\\s*일)");
        Matcher matcher = fieldPattern.matcher(text);
        if (matcher.find()) {
            String dateRaw = matcher.group(1).trim();
            return DateTimeUtils.convertDateFormat(dateRaw);
        }
        return null;
    }

}
