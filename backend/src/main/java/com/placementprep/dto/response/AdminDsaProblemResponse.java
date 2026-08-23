package com.placementprep.dto.response;

import com.placementprep.entity.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Admin view of a DSA problem. Unlike {@link DsaProblemResponse} (the student
 * view), this intentionally omits {@code userStatus} — admins manage the problem
 * catalogue, they do not track their own solving progress.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDsaProblemResponse {
    private Long id;
    private String title;
    private String topic;
    private Difficulty difficulty;
    private String platform;
    private String problemUrl;
    private String description;
    private String tags;
}
