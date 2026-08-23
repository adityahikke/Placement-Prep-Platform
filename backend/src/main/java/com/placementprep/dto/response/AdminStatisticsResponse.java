package com.placementprep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Aggregated question-distribution statistics: totals per section and per chapter. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatisticsResponse {
    private long totalQuestions;
    private List<SectionDistributionResponse> sections;
    private List<ChapterStatResponse> chapters;
}
