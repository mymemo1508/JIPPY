package com.hbhw.jippy.domain.chat.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {
    private String senderId;
    private String messageId;
    private String messageContent;
    private String timestamp;
    private String messageType;
}

