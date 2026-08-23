package com.placementprep.controller;

import com.placementprep.dto.request.BulkCommitRequest;
import com.placementprep.dto.request.ChapterCreateRequest;
import com.placementprep.dto.request.ChapterUpdateRequest;
import com.placementprep.dto.request.DsaProblemCreateRequest;
import com.placementprep.dto.request.DsaProblemUpdateRequest;
import com.placementprep.dto.request.QuestionCreateRequest;
import com.placementprep.dto.request.QuestionUpdateRequest;
import com.placementprep.dto.request.SubjectCreateRequest;
import com.placementprep.dto.request.SubjectUpdateRequest;
import com.placementprep.dto.response.*;
import com.placementprep.entity.Difficulty;
import com.placementprep.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Admin-only API. Every endpoint here is management-oriented: platform stats,
 * read-only student browsing, and full question-bank management (CRUD + bulk
 * import). There is intentionally NO test-taking endpoint — admins do not
 * attempt questions or run tests.
 *
 * <p>The class-level {@code @PreAuthorize("hasAuthority('ROLE_ADMIN')")} (backed
 * by SecurityConfig's {@code /api/admin/** -> hasAuthority("ROLE_ADMIN")}) means a
 * student's token hitting any of these paths receives HTTP 403.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Panel", description = "Administrative endpoints for platform, student and question management")
public class AdminController {

    private final AdminService adminService;

    // -------------------------------------------------------------------------
    // Dashboard
    // -------------------------------------------------------------------------

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard summary: counts, recent students, question distribution")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboard()));
    }

    // -------------------------------------------------------------------------
    // Students (read-only)
    // -------------------------------------------------------------------------

    @GetMapping("/students")
    @Operation(summary = "List registered students (search by name/email, paginated)")
    public ResponseEntity<ApiResponse<PageResponse<AdminStudentResponse>>> getStudents(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), clampSize(size),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(adminService.getStudents(search, pageable)));
    }

    @GetMapping("/students/{id}")
    @Operation(summary = "Get a single student's read-only profile and test counts")
    public ResponseEntity<ApiResponse<AdminStudentDetailResponse>> getStudentDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStudentDetail(id)));
    }

    // -------------------------------------------------------------------------
    // Question bank — statistics
    // -------------------------------------------------------------------------

    @GetMapping("/questions/statistics")
    @Operation(summary = "Question distribution statistics per section and per chapter")
    public ResponseEntity<ApiResponse<AdminStatisticsResponse>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStatistics()));
    }

    // -------------------------------------------------------------------------
    // Question bank — CRUD
    // -------------------------------------------------------------------------

    @GetMapping("/questions")
    @Operation(summary = "List questions (filter by chapter, difficulty, text search; paginated)")
    public ResponseEntity<ApiResponse<PageResponse<AdminQuestionResponse>>> getQuestions(
            @RequestParam(required = false) Long chapterId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), clampSize(size),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(
                adminService.getQuestions(chapterId, search, difficulty, pageable)));
    }

    @GetMapping("/questions/{id}")
    @Operation(summary = "Get a single question by ID")
    public ResponseEntity<ApiResponse<AdminQuestionResponse>> getQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getQuestion(id)));
    }

    @PostMapping("/questions")
    @Operation(summary = "Create a new question")
    public ResponseEntity<ApiResponse<AdminQuestionResponse>> createQuestion(
            @Valid @RequestBody QuestionCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Question created successfully",
                adminService.createQuestion(request)));
    }

    @PutMapping("/questions/{id}")
    @Operation(summary = "Update an existing question")
    public ResponseEntity<ApiResponse<AdminQuestionResponse>> updateQuestion(
            @PathVariable Long id, @Valid @RequestBody QuestionUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully",
                adminService.updateQuestion(id, request)));
    }

    @DeleteMapping("/questions/{id}")
    @Operation(summary = "Delete a question by ID")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        adminService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }

    // -------------------------------------------------------------------------
    // Question bank — bulk upload (validate → preview → commit)
    // -------------------------------------------------------------------------

    @PostMapping(value = "/questions/bulk-upload", consumes = "multipart/form-data")
    @Operation(summary = "Upload a CSV/Excel file and get a validation preview (nothing is saved yet)")
    public ResponseEntity<ApiResponse<BulkUploadPreviewResponse>> bulkUploadPreview(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("File validated", adminService.previewBulkUpload(file)));
    }

    @PostMapping("/questions/bulk-commit")
    @Operation(summary = "Persist the reviewed/valid rows from a previous bulk-upload preview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> bulkCommit(
            @Valid @RequestBody BulkCommitRequest request) {
        Map<String, Object> summary = adminService.commitBulkUpload(request);
        return ResponseEntity.ok(ApiResponse.success("Bulk import complete", summary));
    }

    // -------------------------------------------------------------------------
    // DSA problem bank — CRUD
    // -------------------------------------------------------------------------

    @GetMapping("/dsa-problems")
    @Operation(summary = "List DSA problems (filter by topic, difficulty, title/tag search; paginated)")
    public ResponseEntity<ApiResponse<PageResponse<AdminDsaProblemResponse>>> getDsaProblems(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // DsaProblem has no createdAt column — order by title so listings are stable.
        Pageable pageable = PageRequest.of(Math.max(page, 0), clampSize(size),
                Sort.by(Sort.Direction.ASC, "title"));
        return ResponseEntity.ok(ApiResponse.success(
                adminService.getDsaProblems(topic, search, difficulty, pageable)));
    }

    @GetMapping("/dsa-problems/topics")
    @Operation(summary = "Distinct DSA topics (for filters and form suggestions)")
    public ResponseEntity<ApiResponse<List<String>>> getDsaTopics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDsaTopics()));
    }

    @GetMapping("/dsa-problems/{id}")
    @Operation(summary = "Get a single DSA problem by ID")
    public ResponseEntity<ApiResponse<AdminDsaProblemResponse>> getDsaProblem(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDsaProblem(id)));
    }

    @PostMapping("/dsa-problems")
    @Operation(summary = "Create a new DSA problem (with its practice link)")
    public ResponseEntity<ApiResponse<AdminDsaProblemResponse>> createDsaProblem(
            @Valid @RequestBody DsaProblemCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("DSA problem created successfully",
                adminService.createDsaProblem(request)));
    }

    @PutMapping("/dsa-problems/{id}")
    @Operation(summary = "Update an existing DSA problem")
    public ResponseEntity<ApiResponse<AdminDsaProblemResponse>> updateDsaProblem(
            @PathVariable Long id, @Valid @RequestBody DsaProblemUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("DSA problem updated successfully",
                adminService.updateDsaProblem(id, request)));
    }

    @DeleteMapping("/dsa-problems/{id}")
    @Operation(summary = "Delete a DSA problem (also clears students' progress rows for it)")
    public ResponseEntity<ApiResponse<Void>> deleteDsaProblem(@PathVariable Long id) {
        adminService.deleteDsaProblem(id);
        return ResponseEntity.ok(ApiResponse.success("DSA problem deleted successfully", null));
    }

    // -------------------------------------------------------------------------
    // Curriculum — subjects
    // -------------------------------------------------------------------------

    @GetMapping("/subjects")
    @Operation(summary = "List subjects (optionally filtered by section) with roll-up counts")
    public ResponseEntity<ApiResponse<List<AdminSubjectResponse>>> getSubjects(
            @RequestParam(required = false) Long sectionId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getSubjects(sectionId)));
    }

    @PostMapping("/subjects")
    @Operation(summary = "Create a subject under a section")
    public ResponseEntity<ApiResponse<AdminSubjectResponse>> createSubject(
            @Valid @RequestBody SubjectCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Subject created successfully",
                adminService.createSubject(request)));
    }

    @PutMapping("/subjects/{id}")
    @Operation(summary = "Rename a subject or change its code")
    public ResponseEntity<ApiResponse<AdminSubjectResponse>> updateSubject(
            @PathVariable Long id, @Valid @RequestBody SubjectUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Subject updated successfully",
                adminService.updateSubject(id, request)));
    }

    @DeleteMapping("/subjects/{id}")
    @Operation(summary = "Delete a subject (only when it has no chapters)")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        adminService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully", null));
    }

    // -------------------------------------------------------------------------
    // Curriculum — chapters
    // -------------------------------------------------------------------------

    @GetMapping("/chapters")
    @Operation(summary = "List chapters (optionally filtered by subject) with question counts")
    public ResponseEntity<ApiResponse<List<AdminChapterResponse>>> getChapters(
            @RequestParam(required = false) Long subjectId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getChapters(subjectId)));
    }

    @PostMapping("/chapters")
    @Operation(summary = "Create a chapter under a subject")
    public ResponseEntity<ApiResponse<AdminChapterResponse>> createChapter(
            @Valid @RequestBody ChapterCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Chapter created successfully",
                adminService.createChapter(request)));
    }

    @PutMapping("/chapters/{id}")
    @Operation(summary = "Update a chapter (rename, edit description/time, or move to another subject)")
    public ResponseEntity<ApiResponse<AdminChapterResponse>> updateChapter(
            @PathVariable Long id, @Valid @RequestBody ChapterUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Chapter updated successfully",
                adminService.updateChapter(id, request)));
    }

    @DeleteMapping("/chapters/{id}")
    @Operation(summary = "Delete a chapter; pass force=true to also delete its questions")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean force) {
        adminService.deleteChapter(id, force);
        return ResponseEntity.ok(ApiResponse.success("Chapter deleted successfully", null));
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Keep page size sane: at least 1, at most 100. */
    private int clampSize(int size) {
        if (size < 1) return 10;
        return Math.min(size, 100);
    }
}
