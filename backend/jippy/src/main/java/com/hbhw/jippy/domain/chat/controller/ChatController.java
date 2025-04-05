package com.hbhw.jippy.domain.chat.controller;

import com.hbhw.jippy.domain.chat.dto.request.ChatMessageRequest;
import com.hbhw.jippy.domain.chat.dto.request.CreateChatRequest;
import com.hbhw.jippy.domain.chat.dto.response.ChatListResponse;
import com.hbhw.jippy.domain.chat.dto.response.ChatMessageResponse;
import com.hbhw.jippy.domain.chat.entity.StoreChat;
import com.hbhw.jippy.domain.chat.service.ChatService;
import com.hbhw.jippy.domain.storeuser.dto.response.staff.StaffResponse;
import com.hbhw.jippy.domain.storeuser.service.staff.StoreStaffService;
import com.hbhw.jippy.domain.user.entity.BaseUser;
import com.hbhw.jippy.global.fcm.FCMService;
import com.hbhw.jippy.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Tag(name = "ChatController", description = "채팅 관련 API")
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final StoreStaffService storeStaffService;
    private final SimpMessagingTemplate messagingTemplate;
    private final FCMService fcmService;


    @Operation(summary = "채팅방 목록 조회", description = "사용자가 가입된 채팅방 목록을 가져옵니다.")
    @GetMapping("/{userId}")
    public ApiResponse<List<ChatListResponse>> getList(@PathVariable Integer userId) {
        return ApiResponse.success(chatService.getChatList(userId));
    }

    @Operation(summary = "채팅 메시지 조회", description = "특정 채팅방의 메시지 목록을 가져옵니다.")
    @GetMapping("/{userId}/select/{storeId}")
    public ApiResponse<List<ChatMessageResponse>> getMessages(
            @PathVariable Integer userId,
            @PathVariable Integer storeId
    ) {
        List<ChatMessageResponse> messages = chatService.getMessages(storeId);
        return ApiResponse.success(messages);
    }

    @Operation(summary = "가장 최근 메시지 조회", description = "채팅창 미리보기를 위핸 최근 메시지 조회")
    @GetMapping("/select/recent/{storeId}")
    public ApiResponse<ChatMessageResponse> getRecentMessage(@PathVariable Integer storeId) {
        ChatMessageResponse message = chatService.getMessages(storeId).getLast();
        return ApiResponse.success(message);
    }

    @Operation(summary = "채팅창 인원수 조회", description = "특정 채팅방의 인원수를 가져옵니다.")
    @GetMapping("/count/{storeId}")
    public ApiResponse<Integer> getChatMemberCount(@PathVariable Integer storeId) {
        Integer memberCount = storeStaffService.getStaffList(storeId).size();
        return ApiResponse.success(memberCount);
    }

    @Operation(summary = "채팅방 생성", description = "새로운 채팅방을 생성합니다.")
    @PostMapping("/{storeId}")
    public void createChat(@RequestBody CreateChatRequest request) {
        chatService.createChat(request.getStoreId());
    }

    /**
     * WebSocket을 통해 메시지를 주고받음.
     * 메시지 저장 후 해당 채팅방에 참여 중인 직원과 사장님에게 FCM 알림 전송.
     */
    @MessageMapping("/chat/{storeId}/send")
    public void sendMessage(@DestinationVariable Integer storeId, @Payload ChatMessageRequest chatMessage) {
        // 1. 메시지 저장 및 WebSocket 구독자에게 전송
        ChatMessageResponse chatMessageResponse = chatService.saveMessage(storeId, chatMessage);
        messagingTemplate.convertAndSend("/topic/chat/" + storeId, chatMessageResponse);

        // 2. 해당 채팅방 멤버(직원 + 사장님)의 FCM 토큰 조회
        List<String> fcmTokens = storeStaffService.getAllChatMemberFcmTokens(storeId);

        // 3. 전달할 데이터 구성 (추가 정보가 필요하면 여기서 확장)
        Map<String, String> data = new HashMap<>();
        data.put("messageId", chatMessage.getMessageId());
        data.put("senderId", chatMessage.getSenderId());

        // 4. FCM 알림 전송 (데이터 메시지 전송)
        if (!fcmTokens.isEmpty()) {
            fcmService.sendGroupChatNotification(fcmTokens, "JIPPY Alert", chatMessage.getMessageContent(), data);
        }
    }

}
