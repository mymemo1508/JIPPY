package com.hbhw.jippy.domain.store.entity;

import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "StoreCoordinates")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreCoordinates {

    @Id
    @Indexed(unique = true)
    @Field("store_id")
    private Integer storeId;

    @Field("latitude")
    private double latitude;

    @Field("longitude")
    private double longitude;
}
