package com.hbhw.jippy.domain.chat.entity;

import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "store_chat_room")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreChat {
    @Id
    private String id;
    @Indexed(unique = true)
    @Field("store_id")
    private Integer storeId;

    @Field("messages")
    @Builder.Default
    private List<Message> messages = new ArrayList<>();
}
