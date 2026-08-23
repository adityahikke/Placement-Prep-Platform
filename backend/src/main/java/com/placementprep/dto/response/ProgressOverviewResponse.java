package com.placementprep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressOverviewResponse {
    private Double overallAccuracy;
    private Long totalTests;
    private Long totalQuestionsAttempted;
    private Long totalCorrectAnswers;
    private List<ChapterProgressItem> chapterProgressList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterProgressItem {
        private Long chapterId;
        private String chapterName;
        private String subjectName;
        private String sectionCode;
        private Long totalQuestions;
        private Long attemptedQuestions;
        private Double completionRate;
        private Double accuracy;
        private Integer attemptsCount;
        private String masteryLevel; // "STRONG", "AVERAGE", "WEAK", "NOT_STARTED"
    }
}
