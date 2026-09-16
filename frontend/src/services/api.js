import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('darukaa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (email, password, full_name) => {
    const response = await api.post('/auth/register', { email, password, full_name });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const projectAPI = {
  getProjects: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },
  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },
  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

export const siteAPI = {
  getAllSitesGeoJSON: async () => {
    const response = await api.get('/sites/geojson');
    return response.data;
  },
  getProjectSites: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/sites`);
    return response.data;
  },
  createSite: async (projectId, siteData) => {
    const response = await api.post(`/projects/${projectId}/sites`, siteData);
    return response.data;
  },
  getSiteById: async (siteId) => {
    const response = await api.get(`/sites/${siteId}`);
    return response.data;
  },
  deleteSite: async (siteId) => {
    const response = await api.delete(`/sites/${siteId}`);
    return response.data;
  },
};

export const analyticsAPI = {
  getSiteAnalytics: async (siteId, timeframe = 'ALL') => {
    const response = await api.get(`/sites/${siteId}/analytics`, {
      params: { timeframe },
    });
    return response.data;
  },
};

export default api;
