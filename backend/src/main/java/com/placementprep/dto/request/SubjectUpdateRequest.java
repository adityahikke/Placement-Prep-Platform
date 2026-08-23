package com.placementprep.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Rename / re-code an existing subject. */
@Data
public class SubjectUpdateRequest {

    @NotBlank
    private String name;

    private String code;
}
