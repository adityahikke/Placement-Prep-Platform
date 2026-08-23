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
public class DashboardStatsResponse {
    private Long questionsSolved;
    private Long totalTestsAttempted;
    private Double averageAccuracy;
    private Integer currentStreak;
    private Double aptitudeProgress;
    private Double csProgress;
    private Double dsaProgress;
    private List<ChapterPerformance> strongChapters;
    private List<ChapterPerformance> weakChapters;
    private List<TestHistorySummaryResponse> recentTests;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterPerformance {
        private Long chapterId;
        private String chapterName;
        private String subjectName;
        private Double accuracy;
        private Integer testsAttempted;
        private String status; // "STRONG", "AVERAGE", "WEAK"
    }
}
