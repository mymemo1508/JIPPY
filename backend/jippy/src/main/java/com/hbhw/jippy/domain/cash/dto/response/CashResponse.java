package com.hbhw.jippy.domain.cash.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "시재 정보 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashResponse {
    @Schema(description = "시재 ID")
    private Integer id;

    @Schema(description = "매장 ID")
    @JsonProperty("store_id")
    private Integer storeId;

    @Schema(description = "5만원권 수량")
    @JsonProperty("fifty_thousand_won")
    private Integer fiftyThousandWon;

    @Schema(description = "1만원권 수량")
    @JsonProperty("ten_thousand_won")
    private Integer tenThousandWon;

    @Schema(description = "5천원권 수량")
    @JsonProperty("five_thousand_won")
    private Integer fiveThousandWon;

    @Schema(description = "1천원권 수량")
    @JsonProperty("one_thousand_won")
    private Integer oneThousandWon;

    @Schema(description = "500원 동전 수량")
    @JsonProperty("five_hundred_won")
    private Integer fiveHundedWon;

    @Schema(description = "100원 동전 수량")
    @JsonProperty("one_hundred_won")
    private Integer oneHundredWon;

    @Schema(description = "50원 동전 수량")
    @JsonProperty("fifty_won")
    private Integer fiftyWon;

    @Schema(description = "10원 동전 수량")
    @JsonProperty("ten_won")
    private Integer tenWon;
}
