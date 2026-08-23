package com.placementprep.repository;

import com.placementprep.entity.TestAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestAnswerRepository extends JpaRepository<TestAnswer, Long> {
    List<TestAnswer> findByTestAttemptIdOrderByQuestionOrderAsc(Long testAttemptId);

    /** True if any question in the given chapter has already been used in a student's test answer. */
    boolean existsByQuestionChapterId(Long chapterId);
}
