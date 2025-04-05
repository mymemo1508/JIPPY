package com.hbhw.jippy.domain.chat.repository;

import com.hbhw.jippy.domain.chat.entity.StoreChat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface ChatRepository extends MongoRepository<StoreChat, Integer> {
    Optional<StoreChat> findByStoreId(Integer storeId);
    void deleteByStoreId(Integer storeId);

    // 최신 메시지를 가져올 때, 정렬만 수행하고 메시지 개수는 Java에서 처리
    @Query(value = "{ 'storeId': ?0 }", sort = "{ 'messages.timestamp': -1 }")
    Optional<StoreChat> findRecentMessages(Integer storeId);
}
