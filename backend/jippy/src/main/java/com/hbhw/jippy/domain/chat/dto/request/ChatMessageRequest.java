package com.hbhw.jippy.domain.chat.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageRequest {
    private String senderId;
    private String messageId;
    private String messageContent;
    private String messageType;
}
