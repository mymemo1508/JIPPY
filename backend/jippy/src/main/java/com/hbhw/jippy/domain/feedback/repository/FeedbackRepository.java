package com.hbhw.jippy.domain.feedback.repository;

import com.hbhw.jippy.domain.feedback.enums.Category;
import com.hbhw.jippy.domain.feedback.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByStoreId(int storeId);

    Feedback findByStoreIdAndId(int storeId, long id);

    List<Feedback> findByStoreIdAndCategory(int storeId, Category category);
}
