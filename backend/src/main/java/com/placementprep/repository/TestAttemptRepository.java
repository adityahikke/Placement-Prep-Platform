package com.placementprep.repository;

import com.placementprep.entity.TestAttempt;
import com.placementprep.entity.TestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {

    List<TestAttempt> findByUserIdOrderByStartedAtDesc(Long userId);

    List<TestAttempt> findByUserIdAndStatusOrderByStartedAtDesc(Long userId, TestStatus status);

    List<TestAttempt> findByUserIdAndChapterIdOrderByStartedAtDesc(Long userId, Long chapterId);

    long countByUserIdAndStatus(Long userId, TestStatus status);

    /** Total tests a user has ever started, regardless of status — shown on the admin student detail. */
    long countByUserId(Long userId);

    @Query("SELECT AVG(t.accuracy) FROM TestAttempt t WHERE t.user.id = :userId AND t.status = 'COMPLETED'")
    Double findAverageAccuracyByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(t.correctAnswers) FROM TestAttempt t WHERE t.user.id = :userId AND t.status = 'COMPLETED'")
    Long findTotalCorrectAnswersByUserId(@Param("userId") Long userId);

    @Query("SELECT t FROM TestAttempt t WHERE t.user.id = :userId AND t.status = 'COMPLETED'")
    List<TestAttempt> findCompletedByUserId(@Param("userId") Long userId);
}
