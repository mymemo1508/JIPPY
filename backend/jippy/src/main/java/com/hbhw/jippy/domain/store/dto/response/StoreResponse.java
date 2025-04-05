package com.hbhw.jippy.domain.store.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 매장 정보를 반환하기 위한 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreResponse {
    private Integer id;
    private Integer userOwnerId;
    private String name;
    private String address;
    private String openingDate; // yyyy-MM-dd hh:ss:mm
    private Integer totalCash;
    private String businessRegistrationNumber;
}
