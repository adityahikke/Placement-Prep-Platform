package com.placementprep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Flat admin view of a chapter, with subject/section context and its question count. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminChapterResponse {
    private Long id;
    private Long subjectId;
    private String subjectName;
    private Long sectionId;
    private String sectionCode;
    private String sectionName;
    private String name;
    private String description;
    private Integer estimatedMinutes;
    private long totalQuestions;
}
