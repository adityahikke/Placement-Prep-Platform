package com.placementprep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Per-section question counts, used by both the dashboard distribution and the statistics endpoint. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionDistributionResponse {
    private Long sectionId;
    private String sectionCode;
    private String sectionName;
    private long totalQuestions;
    private long easyQuestions;
    private long mediumQuestions;
    private long hardQuestions;
}
