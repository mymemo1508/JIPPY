package com.hbhw.jippy.domain.store.dto.request;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 매장 수정 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreUpdateRequest {
    private String name;
    private String address;
    private String openingDate; // yyyy-MM-dd hh:ss:mm
    private Integer totalCash;
}
