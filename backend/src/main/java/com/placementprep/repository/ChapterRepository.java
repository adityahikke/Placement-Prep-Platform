package com.placementprep.repository;

import com.placementprep.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findBySubjectId(Long subjectId);
    List<Chapter> findBySubjectSectionCode(String sectionCode);

    /** Find a chapter by name within a subject (case-insensitive) — used by the idempotent seeder. */
    Optional<Chapter> findBySubjectIdAndNameIgnoreCase(Long subjectId, String name);

    /** Duplicate-name guard when creating/renaming a chapter within a subject. */
    boolean existsBySubjectIdAndNameIgnoreCase(Long subjectId, String name);

    long countBySubjectId(Long subjectId);
}
