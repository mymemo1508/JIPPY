package com.hbhw.jippy.domain.ocr.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * OCR을 통해 추출된 사업자 등록 정보 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OcrExtractedData {
    private String businessNumber;     // 사업자등록번호 (하이픈 제거된 형식)
    private String corporateName;      // 법인명(단체명) 또는 상호
    private String representativeName; // 대표자명
    private String openDate;           // 개업연월일 (yyyy-MM-dd hh:mm:ss 형태)
}
