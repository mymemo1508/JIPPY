package com.hbhw.jippy.domain.feedback.entity;

import com.hbhw.jippy.domain.feedback.enums.Category;
import com.hbhw.jippy.utils.converter.CategoryConverter;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "store_feedback")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * @ManyToOne(fetch = FetchType.LAZY)
     * @JoinColumn(name = "store_id", nullable = false)
     * private Store store;
     */
    // 매장 아이디 (Store 엔티티와 연관관계를 맺을 수도 있지만, 예시에선 단순 int로 저장)
    @Column(name = "store_id", nullable = false)
    private int storeId;

    // Category enum → DB에 "1","2","3" 형태로 저장
    @Convert(converter = CategoryConverter.class)
    @Column(nullable = false, length = 2)
    private Category category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // "yyyy-MM-dd HH:mm:ss" 형태로 문자열 저장
    @Column(name = "created_at", nullable = false, length = 20)
    private String createdAt;
}
