package com.hbhw.jippy.domain.chat.entity;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    @Field("sender_id")
    private String senderId;

    @Field("message_id")
    private String messageId;

    @Field("message_content")
    private String messageContent;

    @Field("timestamp")
    private String timestamp;

    @Field("message_type")
    private String messageType;
}
