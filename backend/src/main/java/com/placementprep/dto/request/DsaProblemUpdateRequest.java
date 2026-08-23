package com.placementprep.dto.request;

import com.placementprep.entity.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Payload for editing an existing DSA problem. Mirrors {@link DsaProblemCreateRequest};
 * kept as a separate type so the two can evolve independently (PUT vs POST).
 */
@Data
public class DsaProblemUpdateRequest {

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
