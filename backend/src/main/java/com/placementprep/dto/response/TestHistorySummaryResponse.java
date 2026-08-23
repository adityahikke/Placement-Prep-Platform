package com.placementprep.dto.response;

import com.placementprep.entity.TestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestHistorySummaryResponse {
    private Long id;
    private Long chapterId;
    private String chapterName;
    private String testTitle;
    private String sectionCode;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Double score;
    private Double accuracy;
    private Integer timeTakenSeconds;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private TestStatus status;
}
