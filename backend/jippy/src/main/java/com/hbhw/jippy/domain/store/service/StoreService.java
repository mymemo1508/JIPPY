package com.hbhw.jippy.domain.store.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbhw.jippy.domain.store.dto.request.StoreCreateRequest;
import com.hbhw.jippy.domain.store.dto.request.StoreUpdateRequest;
import com.hbhw.jippy.domain.store.dto.response.StoreResponse;
import com.hbhw.jippy.domain.store.entity.Store;
import com.hbhw.jippy.domain.store.entity.StoreCoordinates;
import com.hbhw.jippy.domain.store.repository.StoreCoordinatesRepository;
import com.hbhw.jippy.domain.store.repository.StoreRepository;
import com.hbhw.jippy.domain.user.entity.UserOwner;
import com.hbhw.jippy.domain.user.repository.UserOwnerRepository; // 예시
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Slf4j
@Service
public class StoreService {

    private final StoreCoordinatesRepository storeCoordinatesRepository;
    @Value("${kakao.api.key}")
    private String kakaoApiKey;
    @Value("${kakao.api.url}")
    private String kakaoApiUrl;
    private final StoreRepository storeRepository;
    private final UserOwnerRepository userOwnerRepository; // 점주 조회용 (예시)
    private final RestClient restClient;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CACHE_PREFIX = "store";

    @Builder
    public StoreService(StoreRepository storeRepository, UserOwnerRepository userOwnerRepository, StoreCoordinatesRepository storeCoordinatesRepository, RedisTemplate<String, String> redisTemplate, ObjectMapper objectMapper) {
        this.storeRepository = storeRepository;
        this.userOwnerRepository = userOwnerRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.create();
        this.storeCoordinatesRepository = storeCoordinatesRepository;
    }

    @Transactional
    public StoreResponse createStore(StoreCreateRequest request) {
        String key = CACHE_PREFIX +":list" + request.getUserOwnerId();

        // UserOwner 조회
        UserOwner userOwner = userOwnerRepository.findById(request.getUserOwnerId())
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 점주입니다."));

        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            log.info("store : {} → delete", key);
            redisTemplate.delete(key);
        }

        // 엔티티 빌드
        Store store = Store.builder()
                .userOwner(userOwner)
                .name(request.getName())
                .address(request.getAddress())
                .openingDate(request.getOpeningDate())
                .totalCash(request.getTotalCash())
                .businessRegistrationNumber(request.getBusinessRegistrationNumber())
                .build();
        // 저장
        Store saved = storeRepository.save(store);

        // mongoDB에 coordinates 저장
//        double[] coordinates = getCoordinates(request.getAddress());
        StoreCoordinates storeCoordinates = StoreCoordinates.builder()
                .storeId(saved.getId())
                .longitude(Double.parseDouble(request.getLongitude()))
                .latitude(Double.parseDouble(request.getLatitude()))
                .build();
        storeCoordinatesRepository.save(storeCoordinates);

        return toResponse(saved);
    }


    @Transactional
    public StoreResponse updateStore(Integer storeId, StoreUpdateRequest request) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "해당 매장은 존재하지 않습니다."));

        String key = CACHE_PREFIX +":detail" + storeId;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            log.info("store : {} → delete", key);
            redisTemplate.delete(key);
        }

        store.setName(request.getName());
        store.setAddress(request.getAddress());
        store.setOpeningDate(request.getOpeningDate());
        store.setTotalCash(request.getTotalCash());

        // 변경 사항 자동 감지(더티 체크)로 업데이트
        return toResponse(store);
    }

    @Transactional(readOnly = true)
    public List<StoreResponse> getStores() {
        List<Store> storeList = storeRepository.findAll();
        return storeList.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public StoreResponse getStore(Integer storeId) {
        String key = CACHE_PREFIX +":detail" + storeId;
        String cashJsonData = redisTemplate.opsForValue().get(key);

        try{
            if (cashJsonData != null) {
                log.info("store : cash hit!!");
                return objectMapper.readValue(cashJsonData, StoreResponse.class);
            }

            Store store = storeRepository.findById(storeId)
                    .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "해당 매장은 존재하지 않습니다."));
            StoreResponse storeResponse = toResponse(store);

            String jsonData = objectMapper.writeValueAsString(storeResponse); // 객체 → JSON 변환
            redisTemplate.opsForValue().set(key, jsonData, Duration.ofSeconds(60 * 30));
            log.info("store : db search");
            return storeResponse;
        } catch (Exception e){
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "매장 서버 에러 발생");
        }
    }

    public List<StoreResponse> getStoreListByOwnerId(Integer ownerId){

        String key = CACHE_PREFIX +":list"+ ownerId;
        String cashJsonData = redisTemplate.opsForValue().get(key);

        try{
            if (cashJsonData != null) {
                log.info("store : cash hit!!");
                return objectMapper.readValue(cashJsonData, new TypeReference<>() {
                });
            }

            List<Store> storeListByOwner = storeRepository.findByUserOwnerId(ownerId)
                    .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "해당 매장은 존재하지 않습니다."));

            List<StoreResponse> storeResponseList = storeListByOwner.stream()
                    .map(this::toResponse).toList();


            String jsonData = objectMapper.writeValueAsString(storeResponseList); // 객체 → JSON 변환
            redisTemplate.opsForValue().set(key, jsonData, Duration.ofSeconds(60 * 30));
            log.info("store : db search");
            return storeResponseList;
        }catch(Exception e) {
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "매장 서버 에러 발생");
        }
    }


    public Store getStoreEntity(Integer storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "해당 매장은 존재하지 않습니다."));
    }


    @Transactional
    public void deleteStore(Integer storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.NOT_FOUND, "해당 매장은 존재하지 않습니다."));
        storeRepository.delete(store);
    }

    /**
     * 엔티티 -> 응답 DTO 변환
     */
    private StoreResponse toResponse(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .userOwnerId(store.getUserOwner().getId()) // UserOwner의 PK
                .name(store.getName())
                .address(store.getAddress())
                .openingDate(store.getOpeningDate())
                .totalCash(store.getTotalCash())
                .businessRegistrationNumber(store.getBusinessRegistrationNumber())
                .build();
    }

    private double[] getCoordinates(String address) {
        double[] coordinates = new double[2];
        String apiUrl = kakaoApiUrl + "/v2/local/search/address.json?query=" + address;

        log.info("Kakao API 호출 URL: " + apiUrl);

        try {
            ResponseEntity<String> response = restClient.get()
                    .uri(apiUrl)
                    .header("Authorization", "KakaoAK " + kakaoApiKey.trim()) // 공백 제거
                    .retrieve()
                    .toEntity(String.class);

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(response.getBody());
            if (root.get("documents").size() > 0) {
                JsonNode location = root.get("documents").get(0);
                coordinates[0] = location.get("x").asDouble();  // 경도 (longitude)
                coordinates[1] = location.get("y").asDouble();  // 위도 (latitude)
            } else {
                throw new Exception("🚨 주소 정보를 찾을 수 없음");
            }

        } catch (HttpClientErrorException e) {
            log.error("🚨 HTTP 오류 발생: " + e.getStatusCode());
            log.error("🚨 오류 본문: " + e.getResponseBodyAsString());
            throw new BusinessException(CommonErrorCode.NOT_FOUND, "API 요청 실패: " + e.getMessage());
        } catch (Exception e) {
            log.error("🚨 예외 발생: " + e.getMessage());
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "API 호출 중 오류 발생: " + e.getMessage());
        }

        return coordinates;
    }

}
