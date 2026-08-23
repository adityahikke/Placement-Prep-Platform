package com.placementprep.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Create a new subject under a section (admin curriculum management). */
@Data
public class SubjectCreateRequest {

    @NotNull
    private Long sectionId;

    @NotBlank
    private String name;

    /** Optional short code (e.g. "OS", "QUANT"). */
    private String code;
}
