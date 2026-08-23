package com.placementprep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Flat admin view of a subject, with its section context and roll-up counts. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSubjectResponse {
    private Long id;
    private Long sectionId;
    private String sectionCode;
    private String sectionName;
    private String name;
    private String code;
    private long totalChapters;
    private long totalQuestions;
}
