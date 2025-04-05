package com.hbhw.jippy.domain.chat.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbhw.jippy.domain.chat.dto.request.ChatMessageRequest;
import com.hbhw.jippy.domain.chat.dto.request.CreateChatRequest;
import com.hbhw.jippy.domain.chat.dto.response.ChatListResponse;
import com.hbhw.jippy.domain.chat.dto.response.ChatMessageResponse;
import com.hbhw.jippy.domain.chat.entity.Message;
import com.hbhw.jippy.domain.chat.entity.StoreChat;
import com.hbhw.jippy.domain.chat.repository.ChatListRepository;
import com.hbhw.jippy.domain.chat.repository.ChatRepository;
import com.hbhw.jippy.domain.dashboard.dto.response.staff.StoreSalaryResponse;
import com.hbhw.jippy.global.code.CommonErrorCode;
import com.hbhw.jippy.global.error.BusinessException;
import com.hbhw.jippy.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRepository chatRepository;
    private final ChatListRepository chatlistRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CACHE_PREFIX = "chat";

    // 채팅방 목록 조회
    public List<ChatListResponse> getChatList(Integer userId) {
        return chatlistRepository.findByUserStaffId(userId).stream()
                .map(storeUserStaff -> new ChatListResponse(storeUserStaff.getStore().getId()))
                .collect(Collectors.toList());
    }

    // 메시지 조회
    public List<ChatMessageResponse> getMessages(Integer storeId) {
        String key = CACHE_PREFIX + storeId;
        String cashJsonData = redisTemplate.opsForValue().get(key);

        try {

            if (cashJsonData != null) {
                log.info("chat : cash hit!!");
                return objectMapper.readValue(cashJsonData, new TypeReference<>() {
                });
            }
            Optional<StoreChat> storeChatOpt = chatRepository.findRecentMessages(storeId);

            StoreChat storeChat = storeChatOpt.orElseThrow(() ->
                    new NoSuchElementException("채팅방을 찾을 수 없습니다. storeId=" + storeId));

            // messages 리스트 가져오고, limit 개수만큼 제한
            List<Message> messages = storeChat.getMessages();
            List<ChatMessageResponse> chatMessageResponseList = messages.stream()
                    .map(msg -> new ChatMessageResponse(
                            msg.getSenderId(),
                            msg.getMessageId(),
                            msg.getMessageContent(),
                            msg.getTimestamp(),
                            msg.getMessageType()
                    ))
                    .toList();


            String jsonData = objectMapper.writeValueAsString(chatMessageResponseList); // 객체 → JSON 변환
            redisTemplate.opsForValue().set(key, jsonData, Duration.ofSeconds(60 * 60));
            log.info("chat : db search");
            return chatMessageResponseList;
        } catch (Exception e) {
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR, "채팅 서버 에러발생");
        }
    }

    // 채팅방 생성
    public void createChat(Integer storeId) {
        StoreChat chat = StoreChat.builder()
                .storeId(storeId)
                .messages(new ArrayList<>())
                .build();
        chatRepository.insert(chat);
    }


    // 채팅방 퇴장
    public void deleteChat(Integer storeId) {
        chatRepository.deleteByStoreId(storeId);
    }

    /**
     * 채팅 메시지를 저장하고 반환
     */
    public ChatMessageResponse saveMessage(Integer storeId, ChatMessageRequest request) {
        String key = CACHE_PREFIX + storeId;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            log.info("chat cashe: {} → delete", key);
            redisTemplate.delete(key);
        }

        // 1) 기존 storeChat 문서 조회
        StoreChat storeChat = chatRepository.findByStoreId(storeId)
                .orElseThrow(() -> new NoSuchElementException("채팅방을 찾을 수 없습니다. storeId=" + storeId));

        // 2) 새 메시지 생성
        // request.getSenderId()
        // 나중에 회원 정보 조회 생기면 senderId에 회원정보 이름 담기
        Message message = Message.builder()
                .senderId(request.getSenderId())
                .messageId(request.getMessageId())
                .messageContent(request.getMessageContent())
                .messageType(request.getMessageType())
                .timestamp(DateTimeUtils.nowString()) // yyyy-MM-dd HH:mm:ss 등 원하는 포맷
                .build();

        // 3) 기존 messages 리스트에 추가
        storeChat.getMessages().add(message);

        // 4) DB에 업데이트 (storeChat 전체 문서가 업데이트됨)
        chatRepository.save(storeChat);

        // 5) 응답 DTO 구성
        return ChatMessageResponse.builder()
                .senderId(request.getSenderId())
                .messageId(request.getMessageId())
                .messageContent(request.getMessageContent())
                .messageType(request.getMessageType())
                .timestamp(message.getTimestamp())
                .build();
    }


}
