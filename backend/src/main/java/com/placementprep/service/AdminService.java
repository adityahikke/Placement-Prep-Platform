package com.placementprep.service;

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
import com.placementprep.entity.*;
import com.placementprep.exception.BadRequestException;
import com.placementprep.exception.ResourceNotFoundException;
import com.placementprep.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

/**
 * All business logic behind the admin panel. This service is management-only:
 * it reads platform statistics and students, and it performs full CRUD + bulk
 * import on the question bank. It deliberately contains NO test-taking logic —
 * admins never attempt questions or run tests.
 *
 * <p>Authorization is enforced upstream (SecurityConfig + {@code @PreAuthorize}
 * on {@code AdminController}); every method here assumes the caller is an admin.
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final ChapterRepository chapterRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final TestAnswerRepository testAnswerRepository;
    private final DsaProblemRepository dsaProblemRepository;
    private final UserDsaProgressRepository userDsaProgressRepository;

    /** The three top-level sections, in the order the dashboard shows them. */
    private static final String APTITUDE = "APTITUDE";
    private static final String CS_FUNDAMENTALS = "CS_FUNDAMENTALS";
    private static final String DSA = "DSA";

    // ==========================================================================
    // Dashboard
    // ==========================================================================

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        long totalStudents = userRepository.countByRole(Role.ROLE_STUDENT);
        long totalQuestions = questionRepository.count();

        List<AdminStudentResponse> recentStudents =
                userRepository.findTop5ByRoleOrderByCreatedAtDesc(Role.ROLE_STUDENT).stream()
                        .map(this::toStudentResponse)
                        .collect(Collectors.toList());

        List<SectionDistributionResponse> distribution = buildSectionDistribution();

        return AdminDashboardResponse.builder()
                .totalStudents(totalStudents)
                .totalQuestions(totalQuestions)
                .totalAptitudeQuestions(questionRepository.countBySectionCode(APTITUDE))
                .totalCsFundamentalsQuestions(questionRepository.countBySectionCode(CS_FUNDAMENTALS))
                .totalDsaQuestions(questionRepository.countBySectionCode(DSA))
                .recentStudents(recentStudents)
                .questionDistribution(distribution)
                .build();
    }

    // ==========================================================================
    // Students (read-only)
    // ==========================================================================

    @Transactional(readOnly = true)
    public PageResponse<AdminStudentResponse> getStudents(String search, Pageable pageable) {
        Page<User> page = userRepository.searchByRole(Role.ROLE_STUDENT, search, pageable);
        return PageResponse.from(page, this::toStudentResponse);
    }

    @Transactional(readOnly = true)
    public AdminStudentDetailResponse getStudentDetail(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        long totalAttempts = testAttemptRepository.countByUserId(id);
        long completed = testAttemptRepository.countByUserIdAndStatus(id, TestStatus.COMPLETED);

        return AdminStudentDetailResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .pictureUrl(user.getPictureUrl())
                .college(user.getCollege())
                .branch(user.getBranch())
                .graduationYear(user.getGraduationYear())
                .provider(user.getProvider() != null ? user.getProvider().name() : null)
                .createdAt(user.getCreatedAt())
                .totalTestsAttempted(totalAttempts)
                .testsCompleted(completed)
                .build();
    }

    // ==========================================================================
    // Question bank — CRUD
    // ==========================================================================

    @Transactional(readOnly = true)
    public PageResponse<AdminQuestionResponse> getQuestions(Long chapterId, String search,
                                                            Difficulty difficulty, Pageable pageable) {
        Page<Question> page = questionRepository.searchQuestions(chapterId, search, difficulty, pageable);
        return PageResponse.from(page, this::toQuestionResponse);
    }

    @Transactional(readOnly = true)
    public AdminQuestionResponse getQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + id));
        return toQuestionResponse(question);
    }

    @Transactional
    public AdminQuestionResponse createQuestion(QuestionCreateRequest request) {
        Chapter chapter = chapterRepository.findById(request.getChapterId())
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with ID: " + request.getChapterId()));

        Question question = Question.builder()
                .chapter(chapter)
                .questionText(request.getQuestionText())
                .optionA(request.getOptionA())
                .optionB(request.getOptionB())
                .optionC(request.getOptionC())
                .optionD(request.getOptionD())
                .correctOption(normalizeCorrectOption(request.getCorrectOption()))
                .explanation(request.getExplanation())
                .difficulty(request.getDifficulty())
                .estimatedTimeSeconds(request.getEstimatedTimeSeconds() != null ? request.getEstimatedTimeSeconds() : 30)
                .build();

        return toQuestionResponse(questionRepository.save(question));
    }

    @Transactional
    public AdminQuestionResponse updateQuestion(Long id, QuestionUpdateRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + id));

        // Allow moving a question to a different chapter.
        if (request.getChapterId() != null &&
                (question.getChapter() == null || !request.getChapterId().equals(question.getChapter().getId()))) {
            Chapter chapter = chapterRepository.findById(request.getChapterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with ID: " + request.getChapterId()));
            question.setChapter(chapter);
        }

        question.setQuestionText(request.getQuestionText());
        question.setOptionA(request.getOptionA());
        question.setOptionB(request.getOptionB());
        question.setOptionC(request.getOptionC());
        question.setOptionD(request.getOptionD());
        question.setCorrectOption(normalizeCorrectOption(request.getCorrectOption()));
        question.setExplanation(request.getExplanation());
        question.setDifficulty(request.getDifficulty());
        if (request.getEstimatedTimeSeconds() != null) {
            question.setEstimatedTimeSeconds(request.getEstimatedTimeSeconds());
        }

        return toQuestionResponse(questionRepository.save(question));
    }

    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Question not found with ID: " + id);
        }
        questionRepository.deleteById(id);
    }

    // ==========================================================================
    // Statistics
    // ==========================================================================

    @Transactional(readOnly = true)
    public AdminStatisticsResponse getStatistics() {
        List<SectionDistributionResponse> sections = buildSectionDistribution();

        List<ChapterStatResponse> chapters = chapterRepository.findAll().stream()
                .map(this::toChapterStat)
                .sorted(Comparator.comparing(ChapterStatResponse::getSectionCode, Comparator.nullsLast(String::compareTo))
                        .thenComparing(ChapterStatResponse::getSubjectName, Comparator.nullsLast(String::compareTo))
                        .thenComparing(ChapterStatResponse::getChapterName, Comparator.nullsLast(String::compareTo)))
                .collect(Collectors.toList());

        return AdminStatisticsResponse.builder()
                .totalQuestions(questionRepository.count())
                .sections(sections)
                .chapters(chapters)
                .build();
    }

    // ==========================================================================
    // Bulk upload — validate (preview) then commit
    // ==========================================================================

    /**
     * Parse and validate an uploaded CSV/Excel file WITHOUT persisting anything.
     * Every data row is classified VALID, INVALID (with reasons), or DUPLICATE so
     * the admin can review before committing.
     */
    @Transactional(readOnly = true)
    public BulkUploadPreviewResponse previewBulkUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file uploaded, or the file is empty.");
        }

        List<String[]> rows = parseFile(file);
        if (rows.isEmpty()) {
            throw new BadRequestException("The file has no rows.");
        }

        // First row is the header.
        Map<String, Integer> header = indexHeader(rows.get(0));
        validateHeader(header);

        int colSection = findCol(header, "section");
        int colChapter = findCol(header, "chapter");
        int colQuestion = findCol(header, "question", "questiontext");
        int colA = findCol(header, "optiona");
        int colB = findCol(header, "optionb");
        int colC = findCol(header, "optionc");
        int colD = findCol(header, "optiond");
        int colCorrect = findCol(header, "correctanswer", "correctoption", "correct", "answer");
        int colDifficulty = findCol(header, "difficulty", "level");
        int colExplanation = findCol(header, "explanation", "explain", "reason");

        // Cache sections and their chapters so we don't hit the DB per row.
        List<Section> allSections = sectionRepository.findAll();

        List<BulkUploadPreviewResponse.BulkRowResult> results = new ArrayList<>();
        // Track texts seen within THIS file (per chapter) to catch in-file duplicates too.
        Set<String> seenInFile = new HashSet<>();

        int validCount = 0, invalidCount = 0, duplicateCount = 0;

        for (int i = 1; i < rows.size(); i++) {
            String[] row = rows.get(i);
            if (isBlankRow(row)) {
                continue; // silently skip fully-empty lines
            }

            String section = cell(row, colSection);
            String chapterName = cell(row, colChapter);
            String question = cell(row, colQuestion);
            String optionA = cell(row, colA);
            String optionB = cell(row, colB);
            String optionC = cell(row, colC);
            String optionD = cell(row, colD);
            String correct = cell(row, colCorrect);
            String difficulty = cell(row, colDifficulty);
            String explanation = cell(row, colExplanation);

            List<String> errors = new ArrayList<>();

            // --- Resolve section ---
            Section resolvedSection = null;
            if (section.isEmpty()) {
                errors.add("Section is required.");
            } else {
                resolvedSection = resolveSection(allSections, section);
                if (resolvedSection == null) {
                    errors.add("Unknown section '" + section + "'.");
                }
            }

            // --- Resolve chapter (within the section) ---
            Chapter resolvedChapter = null;
            if (chapterName.isEmpty()) {
                errors.add("Chapter is required.");
            } else if (resolvedSection != null) {
                resolvedChapter = resolveChapter(resolvedSection, chapterName);
                if (resolvedChapter == null) {
                    errors.add("Chapter '" + chapterName + "' does not exist in section '" + resolvedSection.getName() + "'.");
                }
            }

            // --- Question text ---
            if (question.isEmpty()) {
                errors.add("Question text is required.");
            }

            // --- Options ---
            if (optionA.isEmpty()) errors.add("Option A is required.");
            if (optionB.isEmpty()) errors.add("Option B is required.");
            if (optionC.isEmpty()) errors.add("Option C is required.");
            if (optionD.isEmpty()) errors.add("Option D is required.");

            // --- Correct answer ---
            String normalizedCorrect = correct.trim().toUpperCase();
            if (normalizedCorrect.isEmpty()) {
                errors.add("Correct answer is required.");
            } else if (!isValidOption(normalizedCorrect)) {
                errors.add("Correct answer must be one of A, B, C, D (got '" + correct + "').");
            }

            // --- Difficulty ---
            Difficulty parsedDifficulty = parseDifficulty(difficulty);
            if (difficulty.isEmpty()) {
                errors.add("Difficulty is required.");
            } else if (parsedDifficulty == null) {
                errors.add("Difficulty must be EASY, MEDIUM or HARD (got '" + difficulty + "').");
            }

            // --- Duplicate detection (only meaningful once the chapter is known) ---
            String status;
            Long chapterId = resolvedChapter != null ? resolvedChapter.getId() : null;
            if (!errors.isEmpty()) {
                status = "INVALID";
                invalidCount++;
            } else {
                String dupKey = chapterId + "::" + question.trim().toLowerCase();
                boolean dupInDb = questionRepository.existsByChapterIdAndQuestionTextIgnoreCase(chapterId, question.trim());
                boolean dupInFile = !seenInFile.add(dupKey);
                if (dupInDb || dupInFile) {
                    status = "DUPLICATE";
                    duplicateCount++;
                    errors.add(dupInDb
                            ? "A question with this text already exists in this chapter."
                            : "Duplicate of another row in this file.");
                } else {
                    status = "VALID";
                    validCount++;
                }
            }

            results.add(BulkUploadPreviewResponse.BulkRowResult.builder()
                    .rowNumber(i) // 1-based within data rows (header is row 0 here → first data row = 1)
                    .status(status)
                    .errors(errors)
                    .section(section)
                    .chapter(chapterName)
                    .question(question)
                    .optionA(optionA)
                    .optionB(optionB)
                    .optionC(optionC)
                    .optionD(optionD)
                    .correctAnswer(correct)
                    .difficulty(difficulty)
                    .explanation(explanation)
                    .chapterId(chapterId)
                    .build());
        }

        return BulkUploadPreviewResponse.builder()
                .totalRows(results.size())
                .validCount(validCount)
                .invalidCount(invalidCount)
                .duplicateCount(duplicateCount)
                .rows(results)
                .build();
    }

    /**
     * Persist the rows the admin confirmed. Each item was already resolved to a
     * chapterId during preview. We re-check duplicates defensively and skip them.
     * Returns a small summary map: {@code imported}, {@code skipped}.
     */
    @Transactional
    public Map<String, Object> commitBulkUpload(BulkCommitRequest request) {
        int imported = 0;
        int skipped = 0;

        for (BulkCommitRequest.BulkQuestionItem item : request.getQuestions()) {
            Chapter chapter = chapterRepository.findById(item.getChapterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with ID: " + item.getChapterId()));

            String text = item.getQuestionText() != null ? item.getQuestionText().trim() : "";
            if (text.isEmpty()) {
                skipped++;
                continue;
            }
            if (questionRepository.existsByChapterIdAndQuestionTextIgnoreCase(chapter.getId(), text)) {
                skipped++;
                continue; // don't create duplicates
            }

            Difficulty difficulty = item.getDifficulty() != null ? item.getDifficulty() : Difficulty.MEDIUM;

            Question question = Question.builder()
                    .chapter(chapter)
                    .questionText(text)
                    .optionA(item.getOptionA())
                    .optionB(item.getOptionB())
                    .optionC(item.getOptionC())
                    .optionD(item.getOptionD())
                    .correctOption(normalizeCorrectOption(item.getCorrectOption()))
                    .explanation(item.getExplanation())
                    .difficulty(difficulty)
                    .estimatedTimeSeconds(item.getEstimatedTimeSeconds() != null ? item.getEstimatedTimeSeconds() : 30)
                    .build();

            questionRepository.save(question);
            imported++;
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("imported", imported);
        summary.put("skipped", skipped);
        return summary;
    }

    // ==========================================================================
    // DSA problem bank — CRUD
    //
    // The DSA section is a flat problem catalogue (title + external link), not a
    // section/subject/chapter tree, so it has its own endpoints. This is the admin
    // catalogue view: it never exposes per-student progress.
    // ==========================================================================

    @Transactional(readOnly = true)
    public PageResponse<AdminDsaProblemResponse> getDsaProblems(String topic, String search,
                                                                Difficulty difficulty, Pageable pageable) {
        Page<DsaProblem> page = dsaProblemRepository.searchProblems(
                trimToNull(topic), trimToNull(search), difficulty, pageable);
        return PageResponse.from(page, this::toDsaResponse);
    }

    @Transactional(readOnly = true)
    public AdminDsaProblemResponse getDsaProblem(Long id) {
        DsaProblem problem = dsaProblemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DSA problem not found with ID: " + id));
        return toDsaResponse(problem);
    }

    @Transactional(readOnly = true)
    public List<String> getDsaTopics() {
        return dsaProblemRepository.findAllDistinctTopics();
    }

    @Transactional
    public AdminDsaProblemResponse createDsaProblem(DsaProblemCreateRequest request) {
        String title = request.getTitle().trim();
        if (title.isEmpty()) {
            throw new BadRequestException("Problem title is required.");
        }
        if (dsaProblemRepository.existsByTitleIgnoreCase(title)) {
            throw new BadRequestException("A DSA problem titled '" + title + "' already exists.");
        }
        String topic = request.getTopic() != null ? request.getTopic().trim() : "";
        if (topic.isEmpty()) {
            throw new BadRequestException("Topic is required.");
        }

        DsaProblem problem = DsaProblem.builder()
                .title(title)
                .topic(topic)
                .difficulty(request.getDifficulty())
                .platform(normalizePlatform(request.getPlatform()))
                .problemUrl(trimToNull(request.getProblemUrl()))
                .description(trimToNull(request.getDescription()))
                .tags(trimToNull(request.getTags()))
                .build();

        return toDsaResponse(dsaProblemRepository.save(problem));
    }

    @Transactional
    public AdminDsaProblemResponse updateDsaProblem(Long id, DsaProblemUpdateRequest request) {
        DsaProblem problem = dsaProblemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DSA problem not found with ID: " + id));

        String title = request.getTitle().trim();
        if (title.isEmpty()) {
            throw new BadRequestException("Problem title is required.");
        }
        if (!title.equalsIgnoreCase(problem.getTitle())
                && dsaProblemRepository.existsByTitleIgnoreCase(title)) {
            throw new BadRequestException("A DSA problem titled '" + title + "' already exists.");
        }
        String topic = request.getTopic() != null ? request.getTopic().trim() : "";
        if (topic.isEmpty()) {
            throw new BadRequestException("Topic is required.");
        }

        problem.setTitle(title);
        problem.setTopic(topic);
        problem.setDifficulty(request.getDifficulty());
        problem.setPlatform(normalizePlatform(request.getPlatform()));
        problem.setProblemUrl(trimToNull(request.getProblemUrl()));
        problem.setDescription(trimToNull(request.getDescription()));
        problem.setTags(trimToNull(request.getTags()));

        return toDsaResponse(dsaProblemRepository.save(problem));
    }

    @Transactional
    public void deleteDsaProblem(Long id) {
        if (!dsaProblemRepository.existsById(id)) {
            throw new ResourceNotFoundException("DSA problem not found with ID: " + id);
        }
        // Clear the user_dsa_progress -> dsa_problems FK references before deleting.
        userDsaProgressRepository.deleteByProblemId(id);
        dsaProblemRepository.deleteById(id);
    }

    // ==========================================================================
    // Curriculum management — subjects & chapters
    //
    // Lets an admin shape the APTITUDE / CS_FUNDAMENTALS content tree from the UI:
    // create/rename/delete subjects and chapters. Deletions are guarded so an admin
    // can't silently orphan questions or corrupt student test history.
    // ==========================================================================

    @Transactional(readOnly = true)
    public List<AdminSubjectResponse> getSubjects(Long sectionId) {
        List<Subject> subjects = (sectionId != null)
                ? subjectRepository.findBySectionId(sectionId)
                : subjectRepository.findAll();
        return subjects.stream()
                .map(this::toAdminSubjectResponse)
                .sorted(Comparator.comparing(AdminSubjectResponse::getSectionCode, Comparator.nullsLast(String::compareTo))
                        .thenComparing(AdminSubjectResponse::getName, Comparator.nullsLast(String::compareTo)))
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminSubjectResponse createSubject(SubjectCreateRequest request) {
        Section section = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + request.getSectionId()));

        String name = request.getName().trim();
        if (name.isEmpty()) {
            throw new BadRequestException("Subject name is required.");
        }
        if (subjectRepository.existsBySectionIdAndNameIgnoreCase(section.getId(), name)) {
            throw new BadRequestException("A subject named '" + name + "' already exists in this section.");
        }

        Subject subject = Subject.builder()
                .section(section)
                .name(name)
                .code(trimToNull(request.getCode()))
                .build();
        return toAdminSubjectResponse(subjectRepository.save(subject));
    }

    @Transactional
    public AdminSubjectResponse updateSubject(Long id, SubjectUpdateRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + id));

        String name = request.getName().trim();
        if (name.isEmpty()) {
            throw new BadRequestException("Subject name is required.");
        }
        Long sectionId = subject.getSection() != null ? subject.getSection().getId() : null;
        if (sectionId != null) {
            Optional<Subject> clash = subjectRepository.findBySectionIdAndNameIgnoreCase(sectionId, name);
            if (clash.isPresent() && !clash.get().getId().equals(subject.getId())) {
                throw new BadRequestException("A subject named '" + name + "' already exists in this section.");
            }
        }

        subject.setName(name);
        subject.setCode(trimToNull(request.getCode()));
        return toAdminSubjectResponse(subjectRepository.save(subject));
    }

    @Transactional
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + id));
        long chapterCount = chapterRepository.countBySubjectId(id);
        if (chapterCount > 0) {
            throw new BadRequestException("This subject still has " + chapterCount
                    + " chapter(s). Delete or move them first.");
        }
        subjectRepository.delete(subject);
    }

    @Transactional(readOnly = true)
    public List<AdminChapterResponse> getChapters(Long subjectId) {
        List<Chapter> chapters = (subjectId != null)
                ? chapterRepository.findBySubjectId(subjectId)
                : chapterRepository.findAll();
        return chapters.stream()
                .map(this::toAdminChapterResponse)
                .sorted(Comparator.comparing(AdminChapterResponse::getSectionCode, Comparator.nullsLast(String::compareTo))
                        .thenComparing(AdminChapterResponse::getSubjectName, Comparator.nullsLast(String::compareTo))
                        .thenComparing(AdminChapterResponse::getName, Comparator.nullsLast(String::compareTo)))
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminChapterResponse createChapter(ChapterCreateRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + request.getSubjectId()));

        String name = request.getName().trim();
        if (name.isEmpty()) {
            throw new BadRequestException("Chapter name is required.");
        }
        if (chapterRepository.existsBySubjectIdAndNameIgnoreCase(subject.getId(), name)) {
            throw new BadRequestException("A chapter named '" + name + "' already exists in this subject.");
        }

        Integer minutes = request.getEstimatedMinutes();
        if (minutes == null || minutes < 1) {
            minutes = 5;
        }

        Chapter chapter = Chapter.builder()
                .subject(subject)
                .name(name)
                .description(trimToNull(request.getDescription()))
                .estimatedMinutes(minutes)
                .build();
        return toAdminChapterResponse(chapterRepository.save(chapter));
    }

    @Transactional
    public AdminChapterResponse updateChapter(Long id, ChapterUpdateRequest request) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with ID: " + id));

        String name = request.getName().trim();
        if (name.isEmpty()) {
            throw new BadRequestException("Chapter name is required.");
        }

        // Optional move to a different subject.
        Subject targetSubject = chapter.getSubject();
        if (request.getSubjectId() != null &&
                (targetSubject == null || !request.getSubjectId().equals(targetSubject.getId()))) {
            targetSubject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + request.getSubjectId()));
            chapter.setSubject(targetSubject);
        }

        // Name must be unique within the (possibly new) subject, ignoring the chapter itself.
        Long subjectId = targetSubject != null ? targetSubject.getId() : null;
        if (subjectId != null) {
            Optional<Chapter> clash = chapterRepository.findBySubjectIdAndNameIgnoreCase(subjectId, name);
            if (clash.isPresent() && !clash.get().getId().equals(chapter.getId())) {
                throw new BadRequestException("A chapter named '" + name + "' already exists in this subject.");
            }
        }

        chapter.setName(name);
        chapter.setDescription(trimToNull(request.getDescription()));
        if (request.getEstimatedMinutes() != null && request.getEstimatedMinutes() >= 1) {
            chapter.setEstimatedMinutes(request.getEstimatedMinutes());
        }
        return toAdminChapterResponse(chapterRepository.save(chapter));
    }

    @Transactional
    public void deleteChapter(Long id, boolean force) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with ID: " + id));

        long questionCount = questionRepository.countByChapterId(id);
        if (questionCount > 0 && !force) {
            throw new BadRequestException("This chapter has " + questionCount
                    + " question(s). Confirm deletion to remove the chapter and all its questions.");
        }
        // Never orphan student test history: questions already answered in a submitted
        // test cannot be removed without corrupting past attempts.
        if (testAnswerRepository.existsByQuestionChapterId(id)) {
            throw new BadRequestException("This chapter's questions appear in one or more students' "
                    + "test history and cannot be deleted.");
        }
        // orphanRemoval on Chapter.questions cascades the delete to the chapter's questions.
        chapterRepository.delete(chapter);
    }

    // ==========================================================================
    // Mapping helpers
    // ==========================================================================

    private AdminStudentResponse toStudentResponse(User user) {
        return AdminStudentResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AdminQuestionResponse toQuestionResponse(Question q) {
        Chapter chapter = q.getChapter();
        Subject subject = chapter != null ? chapter.getSubject() : null;
        Section section = subject != null ? subject.getSection() : null;

        return AdminQuestionResponse.builder()
                .id(q.getId())
                .chapterId(chapter != null ? chapter.getId() : null)
                .chapterName(chapter != null ? chapter.getName() : null)
                .subjectId(subject != null ? subject.getId() : null)
                .subjectName(subject != null ? subject.getName() : null)
                .sectionCode(section != null ? section.getCode() : null)
                .sectionName(section != null ? section.getName() : null)
                .questionText(q.getQuestionText())
                .optionA(q.getOptionA())
                .optionB(q.getOptionB())
                .optionC(q.getOptionC())
                .optionD(q.getOptionD())
                .correctOption(q.getCorrectOption())
                .explanation(q.getExplanation())
                .difficulty(q.getDifficulty())
                .estimatedTimeSeconds(q.getEstimatedTimeSeconds())
                .createdAt(q.getCreatedAt())
                .build();
    }

    private ChapterStatResponse toChapterStat(Chapter chapter) {
        Subject subject = chapter.getSubject();
        Section section = subject != null ? subject.getSection() : null;
        Long chapterId = chapter.getId();

        return ChapterStatResponse.builder()
                .chapterId(chapterId)
                .chapterName(chapter.getName())
                .subjectId(subject != null ? subject.getId() : null)
                .subjectName(subject != null ? subject.getName() : null)
                .sectionId(section != null ? section.getId() : null)
                .sectionCode(section != null ? section.getCode() : null)
                .sectionName(section != null ? section.getName() : null)
                .totalQuestions(questionRepository.countByChapterId(chapterId))
                .easyQuestions(questionRepository.countByChapterIdAndDifficulty(chapterId, Difficulty.EASY))
                .mediumQuestions(questionRepository.countByChapterIdAndDifficulty(chapterId, Difficulty.MEDIUM))
                .hardQuestions(questionRepository.countByChapterIdAndDifficulty(chapterId, Difficulty.HARD))
                .build();
    }

    private AdminDsaProblemResponse toDsaResponse(DsaProblem p) {
        return AdminDsaProblemResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .topic(p.getTopic())
                .difficulty(p.getDifficulty())
                .platform(p.getPlatform())
                .problemUrl(p.getProblemUrl())
                .description(p.getDescription())
                .tags(p.getTags())
                .build();
    }

    private AdminSubjectResponse toAdminSubjectResponse(Subject subject) {
        Section section = subject.getSection();
        List<Chapter> chapters = chapterRepository.findBySubjectId(subject.getId());
        long totalQuestions = 0;
        for (Chapter c : chapters) {
            totalQuestions += questionRepository.countByChapterId(c.getId());
        }
        return AdminSubjectResponse.builder()
                .id(subject.getId())
                .sectionId(section != null ? section.getId() : null)
                .sectionCode(section != null ? section.getCode() : null)
                .sectionName(section != null ? section.getName() : null)
                .name(subject.getName())
                .code(subject.getCode())
                .totalChapters(chapters.size())
                .totalQuestions(totalQuestions)
                .build();
    }

    private AdminChapterResponse toAdminChapterResponse(Chapter chapter) {
        Subject subject = chapter.getSubject();
        Section section = subject != null ? subject.getSection() : null;
        return AdminChapterResponse.builder()
                .id(chapter.getId())
                .subjectId(subject != null ? subject.getId() : null)
                .subjectName(subject != null ? subject.getName() : null)
                .sectionId(section != null ? section.getId() : null)
                .sectionCode(section != null ? section.getCode() : null)
                .sectionName(section != null ? section.getName() : null)
                .name(chapter.getName())
                .description(chapter.getDescription())
                .estimatedMinutes(chapter.getEstimatedMinutes())
                .totalQuestions(questionRepository.countByChapterId(chapter.getId()))
                .build();
    }

    /** Build a per-section distribution across all sections (order: as stored, id ascending). */
    private List<SectionDistributionResponse> buildSectionDistribution() {
        return sectionRepository.findAll().stream()
                .sorted(Comparator.comparing(Section::getId, Comparator.nullsLast(Long::compareTo)))
                .map(section -> {
                    String code = section.getCode();
                    return SectionDistributionResponse.builder()
                            .sectionId(section.getId())
                            .sectionCode(code)
                            .sectionName(section.getName())
                            .totalQuestions(questionRepository.countBySectionCode(code))
                            .easyQuestions(questionRepository.countBySectionCodeAndDifficulty(code, Difficulty.EASY))
                            .mediumQuestions(questionRepository.countBySectionCodeAndDifficulty(code, Difficulty.MEDIUM))
                            .hardQuestions(questionRepository.countBySectionCodeAndDifficulty(code, Difficulty.HARD))
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ==========================================================================
    // Validation / normalization helpers
    // ==========================================================================

    private String normalizeCorrectOption(String raw) {
        if (raw == null) {
            throw new BadRequestException("Correct answer is required.");
        }
        String v = raw.trim().toUpperCase();
        if (!isValidOption(v)) {
            throw new BadRequestException("Correct answer must be one of A, B, C, D.");
        }
        return v;
    }

    private boolean isValidOption(String v) {
        return "A".equals(v) || "B".equals(v) || "C".equals(v) || "D".equals(v);
    }

    /** Trim a string, returning {@code null} for null/blank input (keeps optional DB columns clean). */
    private String trimToNull(String raw) {
        if (raw == null) return null;
        String v = raw.trim();
        return v.isEmpty() ? null : v;
    }

    /** DSA problems default to LeetCode when no platform is supplied. */
    private String normalizePlatform(String raw) {
        String v = trimToNull(raw);
        return v != null ? v : "LeetCode";
    }

    private Difficulty parseDifficulty(String raw) {
        if (raw == null || raw.trim().isEmpty()) return null;
        try {
            return Difficulty.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /** Match a free-text section value against known sections by code or by name (case-insensitive). */
    private Section resolveSection(List<Section> sections, String raw) {
        String byCode = raw.trim().toUpperCase().replaceAll("[\\s-]+", "_");
        String byName = raw.trim();
        for (Section s : sections) {
            if (s.getCode() != null && s.getCode().equalsIgnoreCase(byCode)) return s;
            if (s.getName() != null && s.getName().equalsIgnoreCase(byName)) return s;
        }
        return null;
    }

    /** Find a chapter by name within a section (case-insensitive), searching that section's chapters. */
    private Chapter resolveChapter(Section section, String chapterName) {
        String target = chapterName.trim();
        List<Chapter> chapters = chapterRepository.findBySubjectSectionCode(section.getCode());
        for (Chapter c : chapters) {
            if (c.getName() != null && c.getName().equalsIgnoreCase(target)) return c;
        }
        return null;
    }

    // ==========================================================================
    // File parsing (CSV + Excel)
    // ==========================================================================

    /** Dispatch to the CSV or Excel parser based on the uploaded file's name. */
    private List<String[]> parseFile(MultipartFile file) {
        String name = file.getOriginalFilename();
        String lower = name != null ? name.toLowerCase() : "";
        try (InputStream in = file.getInputStream()) {
            if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
                return parseExcel(in);
            }
            if (lower.endsWith(".csv") || lower.endsWith(".txt") || lower.isEmpty()) {
                return parseCsv(in);
            }
            throw new BadRequestException("Unsupported file type. Please upload a .csv or .xlsx file.");
        } catch (IOException e) {
            throw new BadRequestException("Could not read the uploaded file: " + e.getMessage());
        }
    }

    /** Read an .xlsx/.xls workbook's first sheet into rows of trimmed string cells. */
    private List<String[]> parseExcel(InputStream in) throws IOException {
        List<String[]> rows = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(in)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) return rows;
            DataFormatter formatter = new DataFormatter();
            int lastRow = sheet.getLastRowNum();
            for (int r = 0; r <= lastRow; r++) {
                Row row = sheet.getRow(r);
                if (row == null) {
                    rows.add(new String[0]);
                    continue;
                }
                int lastCol = row.getLastCellNum();
                if (lastCol < 0) {
                    rows.add(new String[0]);
                    continue;
                }
                String[] cells = new String[lastCol];
                for (int c = 0; c < lastCol; c++) {
                    Cell cell = row.getCell(c, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                    cells[c] = cell != null ? formatter.formatCellValue(cell).trim() : "";
                }
                rows.add(cells);
            }
        }
        return rows;
    }

    /**
     * Minimal RFC-4180 CSV reader: handles quoted fields, embedded commas/newlines,
     * and doubled quotes ("") as an escaped quote. Good enough for admin uploads.
     */
    private List<String[]> parseCsv(InputStream in) throws IOException {
        String content = new String(in.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        // Strip a UTF-8 BOM if present.
        if (content.startsWith("﻿")) {
            content = content.substring(1);
        }

        List<String[]> rows = new ArrayList<>();
        List<String> current = new ArrayList<>();
        StringBuilder field = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < content.length(); i++) {
            char ch = content.charAt(i);

            if (inQuotes) {
                if (ch == '"') {
                    if (i + 1 < content.length() && content.charAt(i + 1) == '"') {
                        field.append('"');
                        i++; // skip the escaped quote
                    } else {
                        inQuotes = false;
                    }
                } else {
                    field.append(ch);
                }
            } else {
                switch (ch) {
                    case '"':
                        inQuotes = true;
                        break;
                    case ',':
                        current.add(field.toString().trim());
                        field.setLength(0);
                        break;
                    case '\r':
                        // handled together with \n; ignore lone CR
                        break;
                    case '\n':
                        current.add(field.toString().trim());
                        field.setLength(0);
                        rows.add(current.toArray(new String[0]));
                        current = new ArrayList<>();
                        break;
                    default:
                        field.append(ch);
                }
            }
        }
        // flush trailing field/row (file may not end with a newline)
        if (field.length() > 0 || !current.isEmpty()) {
            current.add(field.toString().trim());
            rows.add(current.toArray(new String[0]));
        }
        return rows;
    }

    // ==========================================================================
    // Header handling
    // ==========================================================================

    /** Map normalized header names → column index (normalization strips spaces/underscores, lowercases). */
    private Map<String, Integer> indexHeader(String[] headerRow) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < headerRow.length; i++) {
            String key = normalizeHeader(headerRow[i]);
            if (!key.isEmpty() && !map.containsKey(key)) {
                map.put(key, i);
            }
        }
        return map;
    }

    private String normalizeHeader(String raw) {
        if (raw == null) return "";
        return raw.trim().toLowerCase().replaceAll("[\\s_]+", "");
    }

    private int findCol(Map<String, Integer> header, String... aliases) {
        for (String a : aliases) {
            Integer idx = header.get(a);
            if (idx != null) return idx;
        }
        return -1;
    }

    private void validateHeader(Map<String, Integer> header) {
        List<String> missing = new ArrayList<>();
        if (findCol(header, "section") < 0) missing.add("section");
        if (findCol(header, "chapter") < 0) missing.add("chapter");
        if (findCol(header, "question", "questiontext") < 0) missing.add("question");
        if (findCol(header, "optiona") < 0) missing.add("optionA");
        if (findCol(header, "optionb") < 0) missing.add("optionB");
        if (findCol(header, "optionc") < 0) missing.add("optionC");
        if (findCol(header, "optiond") < 0) missing.add("optionD");
        if (findCol(header, "correctanswer", "correctoption", "correct", "answer") < 0) missing.add("correctAnswer");
        if (findCol(header, "difficulty", "level") < 0) missing.add("difficulty");
        if (!missing.isEmpty()) {
            throw new BadRequestException("The file is missing required column(s): " + String.join(", ", missing)
                    + ". Expected columns: section, chapter, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty (and optional explanation).");
        }
    }

    // ==========================================================================
    // Small utilities
    // ==========================================================================

    private String cell(String[] row, int index) {
        if (index < 0 || index >= row.length || row[index] == null) return "";
        return row[index].trim();
    }

    private boolean isBlankRow(String[] row) {
        if (row == null || row.length == 0) return true;
        for (String c : row) {
            if (c != null && !c.trim().isEmpty()) return false;
        }
        return true;
    }
}
