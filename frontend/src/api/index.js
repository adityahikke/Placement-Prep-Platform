import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (userData) => axiosClient.post('/auth/register', userData),
  googleLogin: (credential) => axiosClient.post('/auth/google', { credential }),
  getCurrentUser: () => axiosClient.get('/auth/me'),
};

export const contentApi = {
  getAllSections: () => axiosClient.get('/sections'),
  getSectionByCode: (code) => axiosClient.get(`/sections/${code}`),
  getSubjectsBySection: (sectionCode) => axiosClient.get(`/subjects/section/${sectionCode}`),
  getChapterDetails: (chapterId) => axiosClient.get(`/chapters/${chapterId}`),
  getChaptersBySubject: (subjectId) => axiosClient.get(`/chapters/subject/${subjectId}`),
};

export const testApi = {
  startChapterTest: (chapterId) => axiosClient.post('/tests/start', { chapterId }),
  startRandomTest: (params) => axiosClient.post('/tests/random', params),
  submitTest: (testId, answers) => axiosClient.post(`/tests/${testId}/submit`, { answers }),
  getTestResult: (testId) => axiosClient.get(`/tests/${testId}/result`),
  getTestHistory: () => axiosClient.get('/tests/history'),
};

export const dashboardApi = {
  getStats: () => axiosClient.get('/dashboard'),
  getOverallProgress: () => axiosClient.get('/progress/overall'),
};

export const dsaApi = {
  getProblems: (params) => axiosClient.get('/dsa/problems', { params }),
  // `force` reopens a problem that is already Solved (SOLVED is sticky on the backend).
  updateStatus: (problemId, status, force = false) =>
    axiosClient.put(`/dsa/problems/${problemId}/status`, { status, force }),
  getTopics: () => axiosClient.get('/dsa/topics'),
};

export const adminApi = {
  // Dashboard
  getDashboard: () => axiosClient.get('/admin/dashboard'),

  // Students (read-only)
  // params: { search, page, size }
  getStudents: (params) => axiosClient.get('/admin/students', { params }),
  getStudent: (id) => axiosClient.get(`/admin/students/${id}`),

  // Question bank
  getStatistics: () => axiosClient.get('/admin/questions/statistics'),
  // params: { chapterId, search, difficulty, page, size }
  getQuestions: (params) => axiosClient.get('/admin/questions', { params }),
  getQuestion: (id) => axiosClient.get(`/admin/questions/${id}`),
  createQuestion: (data) => axiosClient.post('/admin/questions', data),
  updateQuestion: (id, data) => axiosClient.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => axiosClient.delete(`/admin/questions/${id}`),

  // Bulk upload: validate (preview) then commit the reviewed rows.
  bulkUploadPreview: (file) => {
    const form = new FormData();
    form.append('file', file);
    // Content-Type is set to undefined so the browser adds the correct
    // multipart boundary (our axios instance defaults to application/json).
    return axiosClient.post('/admin/questions/bulk-upload', form, {
      headers: { 'Content-Type': undefined },
    });
  },
  bulkCommit: (questions) => axiosClient.post('/admin/questions/bulk-commit', { questions }),

  // DSA problem bank (separate from the chapter-based question bank).
  // params: { topic, search, difficulty, page, size }
  getDsaProblems: (params) => axiosClient.get('/admin/dsa-problems', { params }),
  getDsaTopics: () => axiosClient.get('/admin/dsa-problems/topics'),
  getDsaProblem: (id) => axiosClient.get(`/admin/dsa-problems/${id}`),
  createDsaProblem: (data) => axiosClient.post('/admin/dsa-problems', data),
  updateDsaProblem: (id, data) => axiosClient.put(`/admin/dsa-problems/${id}`, data),
  deleteDsaProblem: (id) => axiosClient.delete(`/admin/dsa-problems/${id}`),

  // Curriculum management: subjects and chapters within a section.
  // params: { sectionId }
  getSubjects: (params) => axiosClient.get('/admin/subjects', { params }),
  createSubject: (data) => axiosClient.post('/admin/subjects', data),
  updateSubject: (id, data) => axiosClient.put(`/admin/subjects/${id}`, data),
  deleteSubject: (id) => axiosClient.delete(`/admin/subjects/${id}`),
  // params: { subjectId }
  getChapters: (params) => axiosClient.get('/admin/chapters', { params }),
  createChapter: (data) => axiosClient.post('/admin/chapters', data),
  updateChapter: (id, data) => axiosClient.put(`/admin/chapters/${id}`, data),
  // `force` deletes a chapter that still has questions (backend requires it).
  deleteChapter: (id, force = false) =>
    axiosClient.delete(`/admin/chapters/${id}`, { params: { force } }),
};
