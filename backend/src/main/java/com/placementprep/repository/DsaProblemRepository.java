package com.placementprep.repository;

import com.placementprep.entity.Difficulty;
import com.placementprep.entity.DsaProblem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DsaProblemRepository extends JpaRepository<DsaProblem, Long> {

    List<DsaProblem> findByTopic(String topic);

    List<DsaProblem> findByDifficulty(Difficulty difficulty);

    @Query("SELECT DISTINCT p.topic FROM DsaProblem p ORDER BY p.topic ASC")
    List<String> findAllDistinctTopics();

    long countByDifficulty(Difficulty difficulty);

    /** Idempotent-seeder guard: a problem with this title (case-insensitive) already exists. */
    boolean existsByTitleIgnoreCase(String title);

    /**
     * Paginated problem listing for the admin DSA panel. Any filter may be omitted:
     * null/blank topic spans all topics, null difficulty spans all levels, and a
     * null/blank search matches everything. Search is a case-insensitive substring
     * match on the title OR the tags.
     */
    @Query("SELECT p FROM DsaProblem p WHERE " +
            "(:topic IS NULL OR :topic = '' OR LOWER(p.topic) = LOWER(:topic)) AND " +
            "(:difficulty IS NULL OR p.difficulty = :difficulty) AND " +
            "(:search IS NULL OR :search = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "   OR LOWER(p.tags) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<DsaProblem> searchProblems(@Param("topic") String topic,
                                    @Param("search") String search,
                                    @Param("difficulty") Difficulty difficulty,
                                    Pageable pageable);
}
