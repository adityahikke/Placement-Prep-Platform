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
public class SectionResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String icon;
    private List<SubjectResponse> subjects;
    private Long totalChapters;
    private Long totalQuestions;
}
