package com.placementprep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterResponse {
    private Long id;
    private Long subjectId;
    private String subjectName;
    private String name;
    private String description;
    private Integer estimatedMinutes;
    private Long totalQuestions;
    private Long easyQuestions;
    private Long mediumQuestions;
    private Long hardQuestions;
    // Student specific stats
    private Boolean isAttempted;
    private Double bestScore;
    private Double lastAccuracy;
}
