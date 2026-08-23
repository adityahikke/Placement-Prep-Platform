package com.placementprep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Everything the admin dashboard needs in a single call: headline counts, recent students, distribution. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalStudents;
    private long totalQuestions;
    private long totalAptitudeQuestions;
    private long totalCsFundamentalsQuestions;
    private long totalDsaQuestions;

    private List<AdminStudentResponse> recentStudents;
    private List<SectionDistributionResponse> questionDistribution;
}
