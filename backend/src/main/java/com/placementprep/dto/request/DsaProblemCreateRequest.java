package com.placementprep.dto.request;

import com.placementprep.entity.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Payload for creating a DSA problem from the admin panel. Only title, topic and
 * difficulty are mandatory; platform defaults to "LeetCode" server-side when blank,
 * and the problem URL (e.g. the LeetCode link) is optional but validated when present.
 */
@Data
public class DsaProblemCreateRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String topic;

    @NotNull
    private Difficulty difficulty;

    private String platform;

    @Size(max = 1000)
    private String problemUrl;

    private String description;

    private String tags;
}
