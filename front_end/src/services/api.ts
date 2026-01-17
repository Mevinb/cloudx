/**
 * API Service
 * Centralized API service for making HTTP requests to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Token management - memory only, no localStorage
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};

export const getAccessToken = () => accessToken;

// Request helper
interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (!skipAuth && accessToken) {
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle token refresh
  if (response.status === 401 && refreshToken && !skipAuth) {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      setTokens(data.data.accessToken, data.data.refreshToken);
      
      // Retry original request
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${data.data.accessToken}`;
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    } else {
      clearTokens();
      window.location.href = '/';
      throw new Error('Session expired');
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authAPI = {
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    batch?: string;
  }) => request('/auth/register', { method: 'POST', body: userData, skipAuth: true }),

  login: (credentials: { email: string; password: string }) =>
    request<{
      success: boolean;
      data: {
        user: User;
        accessToken: string;
        refreshToken: string;
      };
    }>('/auth/login', { method: 'POST', body: credentials, skipAuth: true }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  getMe: () => request<{ success: boolean; data: User }>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    request('/auth/me', { method: 'PUT', body: data }),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    request('/auth/password', { method: 'PUT', body: data }),
};

// Users API
export const usersAPI = {
  getAll: (params?: { role?: string; batch?: string; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/users${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => request(`/users/${id}`),

  getProfile: (id: string) => request(`/users/${id}/profile`),

  getStudents: (params?: { batch?: string; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/users/students${query ? `?${query}` : ''}`);
  },

  getStats: () => request('/users/stats'),

  update: (id: string, data: Partial<User>) =>
    request(`/users/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => request(`/users/${id}`, { method: 'DELETE' }),
};

// Sessions API
export const sessionsAPI = {
  getAll: (params?: { type?: string; upcoming?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/sessions${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => request(`/sessions/${id}`),

  create: (data: Partial<Session>) =>
    request('/sessions', { method: 'POST', body: data }),

  update: (id: string, data: Partial<Session>) =>
    request(`/sessions/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => request(`/sessions/${id}`, { method: 'DELETE' }),

  register: (id: string) => request(`/sessions/${id}/register`, { method: 'POST' }),

  unregister: (id: string) => request(`/sessions/${id}/register`, { method: 'DELETE' }),
};

// Attendance API
export const attendanceAPI = {
  getBySession: (sessionId: string) => request(`/attendance/session/${sessionId}`),

  getByUser: (userId: string) => request(`/attendance/user/${userId}`),

  getAnalytics: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/attendance/analytics${query ? `?${query}` : ''}`);
  },

  mark: (data: { sessionId: string; userId: string; status: string; notes?: string }) =>
    request('/attendance/mark', { method: 'POST', body: data }),

  bulkMark: (data: { sessionId: string; attendance: Array<{ userId: string; status: string }> }) =>
    request('/attendance/bulk', { method: 'POST', body: data }),

  selfCheckIn: (sessionId: string) =>
    request(`/attendance/checkin/${sessionId}`, { method: 'POST' }),

  exportCSV: (sessionId: string) =>
    `${API_BASE_URL}/attendance/export/${sessionId}`,
};

// Agendas API
export const agendasAPI = {
  getAll: (params?: { upcoming?: string; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/agendas${query ? `?${query}` : ''}`);
  },

  getUpcoming: (limit?: number) =>
    request(`/agendas/upcoming${limit ? `?limit=${limit}` : ''}`),

  getById: (id: string) => request(`/agendas/${id}`),

  create: (data: Partial<Agenda>) =>
    request('/agendas', { method: 'POST', body: data }),

  update: (id: string, data: Partial<Agenda>) =>
    request(`/agendas/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => request(`/agendas/${id}`, { method: 'DELETE' }),

  register: (id: string) => request(`/agendas/${id}/register`, { method: 'POST' }),

  unregister: (id: string) => request(`/agendas/${id}/register`, { method: 'DELETE' }),
};

// Content API
export const contentAPI = {
  getAll: (params?: { type?: string; topic?: string; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/content${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => request(`/content/${id}`),

  getByTopic: (topic: string) => request(`/content/topic/${topic}`),

  getTopics: () => request('/content/topics'),

  create: (data: Partial<Content>) =>
    request('/content', { method: 'POST', body: data }),

  update: (id: string, data: Partial<Content>) =>
    request(`/content/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => request(`/content/${id}`, { method: 'DELETE' }),

  trackDownload: (id: string) =>
    request(`/content/${id}/download`, { method: 'POST' }),
};

// Assignments API
export const assignmentsAPI = {
  getAll: (params?: { status?: string; topic?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/assignments${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => request(`/assignments/${id}`),

  create: (data: Partial<Assignment>) =>
    request('/assignments', { method: 'POST', body: data }),

  update: (id: string, data: Partial<Assignment>) =>
    request(`/assignments/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => request(`/assignments/${id}`, { method: 'DELETE' }),

  submit: (id: string, data: { content?: string; submissionLink?: string }) =>
    request(`/assignments/${id}/submit`, { method: 'POST', body: data }),

  getMySubmission: (id: string) => request(`/assignments/${id}/my-submission`),

  getSubmissions: (id: string) => request(`/assignments/${id}/submissions`),

  gradeSubmission: (submissionId: string, data: { score: number; feedback?: string }) =>
    request(`/submissions/${submissionId}/grade`, { method: 'PUT', body: data }),
};

// Announcements API
export const announcementsAPI = {
  getAll: (params?: { category?: string; priority?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/announcements${query ? `?${query}` : ''}`);
  },

  getRecent: (limit?: number) =>
    request(`/announcements/recent${limit ? `?limit=${limit}` : ''}`),

  getById: (id: string) => request(`/announcements/${id}`),

  create: (data: Partial<Announcement>) =>
    request('/announcements', { method: 'POST', body: data }),

  update: (id: string, data: Partial<Announcement>) =>
    request(`/announcements/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => request(`/announcements/${id}`, { method: 'DELETE' }),

  togglePin: (id: string) =>
    request(`/announcements/${id}/pin`, { method: 'PUT' }),
};

// Dashboard API
export const dashboardAPI = {
  getStudentDashboard: () => request('/dashboard/student'),
  getTeacherDashboard: () => request('/dashboard/teacher'),
  getAnalytics: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/dashboard/analytics${query ? `?${query}` : ''}`);
  },
};

// Videos API (YouTube videos)
export const videosAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return request<{
      success: boolean;
      count: number;
      total: number;
      totalPages: number;
      currentPage: number;
      data: Video[];
    }>(`/videos${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => request<{ success: boolean; data: Video }>(`/videos/${id}`),

  add: (data: { title: string; youtubeUrl: string; description?: string }) =>
    request<{ success: boolean; data: Video }>('/videos', { method: 'POST', body: data }),

  update: (id: string, data: { title?: string; youtubeUrl?: string; description?: string }) =>
    request<{ success: boolean; data: Video }>(`/videos/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => request(`/videos/${id}`, { method: 'DELETE' }),
};

// Types
export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  batch?: string;
  skills?: string[];
  avatar?: string;
  bio?: string;
  joinDate?: string;
  isActive?: boolean;
}

export interface Session {
  _id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: string;
  createdBy: User;
  isActive: boolean;
}

export interface Attendance {
  _id: string;
  user: User;
  session: Session;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string;
  markedBy?: User;
}

export interface Agenda {
  _id: string;
  date: string;
  topic: string;
  description?: string;
  speaker?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  resources?: Array<{ title: string; url?: string; type: string }>;
  registeredAttendees?: User[];
}

export interface Content {
  _id: string;
  title: string;
  description?: string;
  type: 'video' | 'pdf' | 'slides' | 'document' | 'link';
  topic: string;
  url?: string;
  embedUrl?: string;
  duration?: string;
  pageCount?: number;
  slideCount?: number;
  uploadedBy: User;
  views: number;
  downloads: number;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  points: number;
  topic?: string;
  createdBy: User;
  submission?: Submission;
}

export interface Submission {
  _id: string;
  assignment: string;
  student: User;
  content?: string;
  submissionLink?: string;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'late' | 'graded' | 'returned';
  isLate: boolean;
  score?: number;
  feedback?: string;
  gradedBy?: User;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: User;
  priority: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
  category: string;
  isPinned: boolean;
  createdAt: string;
}

export interface Video {
  _id: string;
  title: string;
  videoId: string;
  youtubeUrl: string;
  description?: string;
  embedUrl: string;
  thumbnailUrl: string;
  addedBy: User;
  createdAt: string;
}

export default {
  auth: authAPI,
  users: usersAPI,
  sessions: sessionsAPI,
  attendance: attendanceAPI,
  agendas: agendasAPI,
  content: contentAPI,
  assignments: assignmentsAPI,
  announcements: announcementsAPI,
  dashboard: dashboardAPI,
  videos: videosAPI,
};
