package com.hbhw.jippy.domain.payment.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "payment_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@Builder
public class PaymentHistory {

    @Id
    @Indexed(unique = true)
    @Field("UUID")
    private String UUID;

    @Field("payment_key")
    private String paymentKey;

    @Field("store_id")
    private Integer storeId;

    @Field("total_cost")
    private Integer totalCost;

    @Field("updated_at")
    private String updatedAt;

    @Field("payment_status")
    private String paymentStatus;

    @Field("payment_type")
    private String paymentType;

    @Field("buyProduct")
    private List<BuyProduct> buyProductHistories;
}
