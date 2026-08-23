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
public class SubjectResponse {
    private Long id;
    private Long sectionId;
    private String name;
    private String code;
    private List<ChapterResponse> chapters;
    private Long totalQuestions;
}
