// ─────────────────────────────────────────────────────────────
//  Hidaya API Service  —  all backend calls in one place
//  Vite proxies /api → http://localhost:5000/api in dev.
//  In production set VITE_API_BASE env var.
// ─────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_BASE || '/api';

// ── token helpers ─────────────────────────────────────────────
export const getToken  = () => localStorage.getItem('hidaya_token');
export const saveToken = (t) => localStorage.setItem('hidaya_token', t);
export const clearToken = () => localStorage.removeItem('hidaya_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ── generic fetch wrapper ─────────────────────────────────────
async function request(method, path, body) {
  const opts = {
    method,
    headers: authHeaders(),
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res  = await fetch(`${BASE}${path}`, opts);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'API error');
  return json.data;
}

const get  = (path)        => request('GET',    path);
const post = (path, body)  => request('POST',   path, body);
const put  = (path, body)  => request('PUT',    path, body);
const del  = (path)        => request('DELETE', path);

// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════
export const authAPI = {
  /** login with { login_id, password, role } */
  login:          (body) => post('/auth/login',           body),
  register:       (body) => post('/auth/register',        body),
  me:             ()     => get('/auth/me'),
  changePassword: (body) => put('/auth/change-password',  body),
};

// ═══════════════════════════════════════════════════════════════
//  USERS  (manager / owner only)
// ═══════════════════════════════════════════════════════════════
export const usersAPI = {
  getAll:          ()           => get('/users'),
  getById:         (id)         => get(`/users/${id}`),
  update:          (id, body)   => put(`/users/${id}`, body),
  delete:          (id)         => del(`/users/${id}`),
  updatePassword:  (id, body)   => put(`/users/${id}/password`, body),
};

// ═══════════════════════════════════════════════════════════════
//  STUDENTS
// ═══════════════════════════════════════════════════════════════
export const studentsAPI = {
  getAll:   ()          => get('/students'),
  getById:  (id)        => get(`/students/${id}`),
  create:   (body)      => post('/students', body),
  update:   (id, body)  => put(`/students/${id}`, body),
  delete:   (id)        => del(`/students/${id}`),
};

// ═══════════════════════════════════════════════════════════════
//  TEACHERS
// ═══════════════════════════════════════════════════════════════
export const teachersAPI = {
  getAll:   ()          => get('/teachers'),
  getById:  (id)        => get(`/teachers/${id}`),
  create:   (body)      => post('/teachers', body),
  update:   (id, body)  => put(`/teachers/${id}`, body),
  delete:   (id)        => del(`/teachers/${id}`),
};

// ═══════════════════════════════════════════════════════════════
//  ASSISTANTS
// ═══════════════════════════════════════════════════════════════
export const assistantsAPI = {
  getAll:   ()          => get('/assistants'),
  getById:  (id)        => get(`/assistants/${id}`),
  create:   (body)      => post('/assistants', body),
  update:   (id, body)  => put(`/assistants/${id}`, body),
  delete:   (id)        => del(`/assistants/${id}`),
};

// ═══════════════════════════════════════════════════════════════
//  TASKS
// ═══════════════════════════════════════════════════════════════
export const tasksAPI = {
  getAll:   ()          => get('/tasks'),
  create:   (body)      => post('/tasks', body),
  update:   (id, body)  => put(`/tasks/${id}`, body),
  delete:   (id)        => del(`/tasks/${id}`),
};

// ═══════════════════════════════════════════════════════════════
//  PAYMENTS
// ═══════════════════════════════════════════════════════════════
export const paymentsAPI = {
  getAll:   ()    => get('/payments'),
  getStats: ()    => get('/payments/stats'),
  create:   (body) => post('/payments', body),
  toggle:   (id)  => put(`/payments/${id}/toggle`),
};

// ═══════════════════════════════════════════════════════════════
//  STUDENT RESULTS
// ═══════════════════════════════════════════════════════════════
export const resultsAPI = {
  getSubjects:  ()           => get('/results/subjects'),
  getAll:       ()           => get('/results'),
  getByStudent: (studentId)  => get(`/results/student/${studentId}`),
  save:         (body)       => post('/results', body),
};

// ═══════════════════════════════════════════════════════════════
//  ATTENDANCE
// ═══════════════════════════════════════════════════════════════
export const attendanceAPI = {
  get:     (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/attendance${qs ? '?' + qs : ''}`);
  },
  getStats: ()           => get('/attendance/stats'),
  save:     (body)       => post('/attendance', body),
};

// ═══════════════════════════════════════════════════════════════
//  DAILY TOPICS
// ═══════════════════════════════════════════════════════════════
export const topicsAPI = {
  get:    (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/topics${qs ? '?' + qs : ''}`);
  },
  create: (body) => post('/topics', body),
};

// ═══════════════════════════════════════════════════════════════
//  TIMETABLE
// ═══════════════════════════════════════════════════════════════
export const timetableAPI = {
  get:        ()                    => get('/timetable'),
  updateSlot: (day, period, body)   => put(`/timetable/${day}/${period}`, body),
};

// ═══════════════════════════════════════════════════════════════
//  REPORTS  (manager/owner)
// ═══════════════════════════════════════════════════════════════
export const reportsAPI = {
  overview:             () => get('/reports/overview'),
  teacherTasks:         () => get('/reports/teacher-tasks'),
  gradeDistribution:    () => get('/reports/grade-distribution'),
  attendanceBreakdown:  () => get('/reports/attendance-breakdown'),
  list:                 () => get('/reports/list'),
  // generate: accepts { term, notes, comment, document_name, document_data, document_type }
  // document_data = base64 string of file content
  generate:             (body) => post('/reports/generate', body),
  send:                 (id)   => put(`/reports/${id}/send`, {}),
  getSent:              () => get('/reports/sent'),
  delete:               (id)   => del(`/reports/${id}`),
  // document download — returns a redirect URL for the browser
  documentUrl:          (id)   => `${BASE}/reports/${id}/document`,
};

// ═══════════════════════════════════════════════════════════════
//  ZAKAT  (owner)
// ═══════════════════════════════════════════════════════════════
export const zakatAPI = {
  calculate:       ()      => get('/zakat/calculate'),
  history:         ()      => get('/zakat/history'),
  save:            (body)  => post('/zakat/save', body),
  incomeBreakdown: ()      => get('/zakat/income-breakdown'),
  addSponsorship:  (body)  => post('/zakat/sponsorship', body),
  deleteSponsorship: (id)  => del(`/zakat/sponsorship/${id}`),
};

// ═══════════════════════════════════════════════════════════════
//  SETTINGS  (manager/owner only)
// ═══════════════════════════════════════════════════════════════
export const settingsAPI = {
  getAll:  ()            => get('/settings'),
  update:  (key, value)  => put(`/settings/${key}`, { value }),
};
