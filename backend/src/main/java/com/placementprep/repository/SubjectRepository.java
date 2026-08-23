package com.placementprep.repository;

import com.placementprep.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findBySectionId(Long sectionId);
    List<Subject> findBySectionCode(String sectionCode);

    /** Find a subject by name within a section (case-insensitive) — used by the idempotent seeder. */
    Optional<Subject> findBySectionIdAndNameIgnoreCase(Long sectionId, String name);

    /** Duplicate-name guard when creating/renaming a subject within a section. */
    boolean existsBySectionIdAndNameIgnoreCase(Long sectionId, String name);
}
