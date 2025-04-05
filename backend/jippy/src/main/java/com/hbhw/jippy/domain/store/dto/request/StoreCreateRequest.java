package com.hbhw.jippy.domain.store.dto.request;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 매장 등록(생성) 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreCreateRequest {
    private Integer userOwnerId; // 점주의 ID
    private String name;
    private String address;
    private String openingDate; // yyyy-MM-dd hh:ss:mm
    @Builder.Default
    private Integer totalCash = 0; // default 값 0으로 설정
    private String businessRegistrationNumber;
    private String longitude;
    private String latitude;
}
