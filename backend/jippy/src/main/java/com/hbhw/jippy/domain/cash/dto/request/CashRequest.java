package com.hbhw.jippy.domain.cash.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hbhw.jippy.domain.cash.entity.Cash;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Schema(description = "시재 추가 요청")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashRequest {
    @Schema(description = "5만원권 수량", example = "1")
    @JsonProperty("fifty_thousand_won")
    private Integer fiftyThousandWon;

    @Schema(description = "1만원권 수량", example = "5")
    @JsonProperty("ten_thousand_won")
    private Integer tenThousandWon;

    @Schema(description = "5천원권 수량", example = "10")
    @JsonProperty("five_thousand_won")
    private Integer fiveThousandWon;

    @Schema(description = "1천원권 수량", example = "20")
    @JsonProperty("one_thousand_won")
    private Integer oneThousandWon;

    @Schema(description = "500원 동전 수량", example = "50")
    @JsonProperty("five_hundred_won")
    private Integer fiveHundredWon;

    @Schema(description = "100원 동전 수량", example = "100")
    @JsonProperty("one_hundred_won")
    private Integer oneHundredWon;

    @Schema(description = "50원 동전 수량", example = "10")
    @JsonProperty("fifty_won")
    private Integer fiftyWon;

    @Schema(description = "10원 동전 수량", example = "200")
    @JsonProperty("ten_won")
    private Integer tenWon;
}
