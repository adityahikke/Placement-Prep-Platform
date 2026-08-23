package com.placementprep.repository;

import com.placementprep.entity.Difficulty;
import com.placementprep.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByChapterId(Long chapterId);

    List<Question> findByChapterIdAndDifficulty(Long chapterId, Difficulty difficulty);

    long countByChapterId(Long chapterId);

    long countByChapterIdAndDifficulty(Long chapterId, Difficulty difficulty);

    // ---- Admin question-bank management ----

    /**
     * Paginated question listing for the admin Question Bank. Any of the three filters
     * may be omitted: null chapterId spans all chapters, null difficulty spans all levels,
     * and a null/blank search matches everything. Search is a case-insensitive substring
     * match on the question text.
     */
    @Query("SELECT q FROM Question q WHERE " +
            "(:chapterId IS NULL OR q.chapter.id = :chapterId) AND " +
            "(:difficulty IS NULL OR q.difficulty = :difficulty) AND " +
            "(:search IS NULL OR :search = '' OR LOWER(q.questionText) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Question> searchQuestions(@Param("chapterId") Long chapterId,
                                   @Param("search") String search,
                                   @Param("difficulty") Difficulty difficulty,
                                   Pageable pageable);

    /** Total questions in a whole section (Aptitude / CS Fundamentals / DSA), addressed by section code. */
    @Query("SELECT COUNT(q) FROM Question q WHERE q.chapter.subject.section.code = :code")
    long countBySectionCode(@Param("code") String code);

    /** Section total broken down by a single difficulty level. */
    @Query("SELECT COUNT(q) FROM Question q WHERE q.chapter.subject.section.code = :code AND q.difficulty = :difficulty")
    long countBySectionCodeAndDifficulty(@Param("code") String code, @Param("difficulty") Difficulty difficulty);

    /** Duplicate guard for bulk upload: same question text already present in the same chapter. */
    boolean existsByChapterIdAndQuestionTextIgnoreCase(Long chapterId, String questionText);

    @Query(value = "SELECT * FROM questions WHERE chapter_id = :chapterId AND difficulty = :difficulty ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomByChapterIdAndDifficultyNative(
            @Param("chapterId") Long chapterId,
            @Param("difficulty") String difficulty,
            @Param("limit") int limit
    );

    @Query(value = "SELECT * FROM questions WHERE chapter_id = :chapterId ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomByChapterIdNative(
            @Param("chapterId") Long chapterId,
            @Param("limit") int limit
    );

    @Query(value = "SELECT q.* FROM questions q " +
            "JOIN chapters c ON q.chapter_id = c.id " +
            "JOIN subjects s ON c.subject_id = s.id " +
            "JOIN sections sec ON s.section_id = sec.id " +
            "WHERE sec.code = :sectionCode " +
            "ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomBySectionCodeNative(
            @Param("sectionCode") String sectionCode,
            @Param("limit") int limit
    );

    @Query(value = "SELECT q.* FROM questions q " +
            "JOIN chapters c ON q.chapter_id = c.id " +
            "JOIN subjects s ON c.subject_id = s.id " +
            "JOIN sections sec ON s.section_id = sec.id " +
            "WHERE sec.code = :sectionCode AND q.difficulty = :difficulty " +
            "ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomBySectionCodeAndDifficultyNative(
            @Param("sectionCode") String sectionCode,
            @Param("difficulty") String difficulty,
            @Param("limit") int limit
    );
}
