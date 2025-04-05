package com.hbhw.jippy.domain.payment.repository;

import com.hbhw.jippy.domain.payment.entity.PaymentHistory;
import com.hbhw.jippy.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
@Repository
public class PaymentHistoryCustomRepository {

    private final MongoTemplate mongoTemplate;

    /**
     * 특정 UUID를 가진 결제내역의 paymentStatus 값을 업데이트하는 메서드
     */
    public void updateStatusHistory(String UUID, String newStatus) {
        Query query = new Query(Criteria.where("UUID").is(UUID));
        Update update = new Update().set("paymentStatus", newStatus);
        mongoTemplate.updateFirst(query, update, PaymentHistory.class);
    }

    /**
     * 특정 UUID를 가진 결제내역의 paymentType 값을 업데이트하는 메서드
     */
    public void updateTypeHistory(String UUID, String newType) {
        Query query = new Query(Criteria.where("UUID").is(UUID));
        Update update = new Update()
                .set("paymentType", newType)
                .set("created_at", DateTimeUtils.nowString());
        mongoTemplate.updateFirst(query, update, PaymentHistory.class);
    }
}
