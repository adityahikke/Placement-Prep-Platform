package com.placementprep.dto.response;

import com.placementprep.entity.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Flat view of a question for the admin question bank. We map to this instead of
 * returning the JPA entity directly so the section/subject/chapter context is
 * included without leaking the lazy entity graph.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminQuestionResponse {
    private Long id;

    private Long chapterId;
    private String chapterName;
    private Long subjectId;
    private String subjectName;
    private String sectionCode;
    private String sectionName;

    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctOption;
    private String explanation;
    private Difficulty difficulty;
    private Integer estimatedTimeSeconds;

    private LocalDateTime createdAt;
}
