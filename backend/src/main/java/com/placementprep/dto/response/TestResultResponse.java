package com.placementprep.dto.response;

import com.placementprep.entity.TestStatus;
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
public class TestResultResponse {
    private Long testId;
    private Long chapterId;
    private String chapterName;
    private String testTitle;
    private String sectionCode;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer incorrectAnswers;
    private Integer unattemptedQuestions;
    private Double score;
    private Double accuracy;
    private Integer durationSeconds;
    private Integer timeTakenSeconds;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private TestStatus status;
    private List<QuestionReviewResponse> reviews;
}
