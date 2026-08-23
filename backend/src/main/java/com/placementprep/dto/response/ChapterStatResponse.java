package com.placementprep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Per-chapter question counts within its section/subject, for the question-bank chapter list. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterStatResponse {
    private Long chapterId;
    private String chapterName;
    private Long subjectId;
    private String subjectName;
    private Long sectionId;
    private String sectionCode;
    private String sectionName;
    private long totalQuestions;
    private long easyQuestions;
    private long mediumQuestions;
    private long hardQuestions;
}
