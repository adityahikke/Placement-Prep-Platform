package com.placementprep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Full read-only student profile shown when an admin opens a single student. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStudentDetailResponse {
    private Long id;
    private String name;
    private String email;
    private String pictureUrl;
    private String college;
    private String branch;
    private Integer graduationYear;
    private String provider;
    private LocalDateTime createdAt;
    private long totalTestsAttempted;
    private long testsCompleted;
}
