package com.placementprep.repository;

import com.placementprep.entity.DsaStatus;
import com.placementprep.entity.UserDsaProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDsaProgressRepository extends JpaRepository<UserDsaProgress, Long> {

    List<UserDsaProgress> findByUserId(Long userId);

    Optional<UserDsaProgress> findByUserIdAndProblemId(Long userId, Long problemId);

    long countByUserIdAndStatus(Long userId, DsaStatus status);

    /**
     * Remove every student's progress row for a given problem. Called before an admin
     * deletes a DSA problem so the {@code user_dsa_progress -> dsa_problems} foreign key
     * is never violated.
     */
    void deleteByProblemId(Long problemId);

    @Query("SELECT COUNT(u) FROM UserDsaProgress u WHERE u.user.id = :userId AND u.status = 'SOLVED' AND u.problem.difficulty = :difficulty")
    long countSolvedByUserIdAndDifficulty(@Param("userId") Long userId, @Param("difficulty") com.placementprep.entity.Difficulty difficulty);
}
