package com.hbhw.jippy.domain.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class SetMenuInfoResponse {
    private List<SetMenuResponse> setMenuList;
}
