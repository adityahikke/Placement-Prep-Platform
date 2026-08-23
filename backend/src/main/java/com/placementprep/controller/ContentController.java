package com.placementprep.controller;

import com.placementprep.dto.response.ApiResponse;
import com.placementprep.dto.response.ChapterResponse;
import com.placementprep.dto.response.SectionResponse;
import com.placementprep.dto.response.SubjectResponse;
import com.placementprep.service.ContentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Content", description = "Sections, Subjects, and Chapters content APIs")
public class ContentController {

    private final ContentService contentService;

    @GetMapping("/sections")
    @Operation(summary = "Get all learning sections (Aptitude, CS Fundamentals, DSA)")
    public ResponseEntity<ApiResponse<List<SectionResponse>>> getAllSections() {
        return ResponseEntity.ok(ApiResponse.success(contentService.getAllSections()));
    }

    @GetMapping("/sections/{code}")
    @Operation(summary = "Get section details by code (e.g. APTITUDE)")
    public ResponseEntity<ApiResponse<SectionResponse>> getSectionByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(contentService.getSectionByCode(code)));
    }

    @GetMapping("/subjects/section/{sectionCode}")
    @Operation(summary = "Get all subjects for a section")
    public ResponseEntity<ApiResponse<List<SubjectResponse>>> getSubjectsBySectionCode(@PathVariable String sectionCode) {
        return ResponseEntity.ok(ApiResponse.success(contentService.getSubjectsBySectionCode(sectionCode)));
    }

    @GetMapping("/chapters/{chapterId}")
    @Operation(summary = "Get chapter details with question statistics")
    public ResponseEntity<ApiResponse<ChapterResponse>> getChapterDetails(@PathVariable Long chapterId) {
        return ResponseEntity.ok(ApiResponse.success(contentService.getChapterDetails(chapterId)));
    }

    @GetMapping("/chapters/subject/{subjectId}")
    @Operation(summary = "Get all chapters for a subject")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getChaptersBySubjectId(@PathVariable Long subjectId) {
        return ResponseEntity.ok(ApiResponse.success(contentService.getChaptersBySubjectId(subjectId)));
    }
}
