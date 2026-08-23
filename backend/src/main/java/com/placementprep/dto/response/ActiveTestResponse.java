package com.placementprep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveTestResponse {
    private Long testId;
    private Long chapterId;
    private String chapterName;
    private String testTitle;
    private String sectionCode;
    private LocalDateTime startedAt;
    private Integer durationSeconds;
    private Integer totalQuestions;
    private List<ActiveTestQuestionResponse> questions;
}
