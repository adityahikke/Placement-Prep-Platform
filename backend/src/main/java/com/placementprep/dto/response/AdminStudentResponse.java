package com.placementprep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Compact student row for the admin students list and the dashboard "recent students" table. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStudentResponse {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
}
