import axios from "axios";

const API_BASE_URL = "https://ediify.tife.com.ng/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  resetPassword: async (resetData) => {
    const response = await api.post("/auth/reset-password", resetData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },
};

export const studyGroupAPI = {
  create: async (groupData) => {
    const response = await api.post("/study-groups/create", groupData);
    return response.data;
  },

  getCourses: async () => {
    const response = await api.get("/study-groups/getcourses");
    return response.data;
  },

  getUserGroups: async () => {
    const response = await api.get("/study-groups/getUserGroups");
    return response.data;
  },

  getAllStudyRooms: async () => {
    const response = await api.get("/study-rooms");
    return response.data; 
  },
};
