import axios from "axios";

const API_BASE_URL = "https://ediifyapi.tife.com.ng/api";

export const API_STORAGE_URL = "https://ediifyapi.tife.com.ng/storage";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
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
    const isLoginAttempt = error.config.url.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginAttempt) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.replace = "/login";
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

  searchParticipants: async (query) => {
    const response = await api.post("/study-groups/participants/search", {
      query: query,
    });
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

  getGroupDetails: async (groupId) => {
    const response = await api.get(`/study-groups/${groupId}/details`);
    return response.data;
  },

  getAllStudyRooms: async () => {
    const response = await api.get("/study-rooms");
    return response.data;
  },

  joinGroup: async (groupId) => {
    const response = await api.post(`/study-groups/${groupId}/join-request`);
    return response.data;
  },

  handleJoinRequest: async (requestId, requestData) => {
    const response = await api.post(
      `/study-groups/${requestId}/handle-request`,
      requestData
    );
    return response.data;
  },

  addGroupMember: async (groupId, studentId) => {
    try {
      const response = await api.post(`/study-groups/${groupId}/add-member`, {
        study_group_id: groupId,
        student_id: studentId,
      });
      return response.data;
    } catch (error) {
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to add group member",
      };
    }
  },
  removeGroupMember: async (groupId, memberId) => {
    const response = await api.delete(
      `/study-groups/${groupId}/admin-remove-members/${memberId}`,
      {
        data: {
          member_id: memberId,
        },
      }
    );
    return response.data;
  },

  leaveStudyGroup: async (groupId) => {
    const response = await api.delete(`/study-groups/${groupId}/leave`);
    return response.data;
  },

  updateGroupDetails: async (groupId, updateData) => {
    const response = await api.post(
      `/study-groups/${groupId}/update`,
      updateData
    );
    return response.data;
  },

  startCallSession: async (groupId) => {
    const response = await api.post(`/study-groups/${groupId}/start-session`);
    return response.data;
  },

  toggleAdminStatus: async (groupId, userId) => {
    const response = await api.post(`/study-groups/${groupId}/toggle-admin/${userId}`);
    return response.data;
  },
};

export const notificationsAPI = {
  getNotifications: async () => {
    const response = await api.get("/notifications");
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.post(
      `/notifications/${notificationId}/mark-as-read`
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post("/notifications/mark-all-as-read");
    return response.data;
  },
};

export const userAPI = {
  getUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },
};

export const chatAPI = {
  sendMessage: async (groupId, payload) => {
    const response = await api.post(`/groups/${groupId}/messages`, payload);
    return response.data;
  },

  getMessages: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/messages`);
    return response.data;
  },

  uploadFile: async (formData) => {
    const response = await api.post("/groups/file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getFiles: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/get_files`);
    return response.data;
  },

  downloadFile: async (fileId) => {
    const response = await api.get(`/groups/file/download/${fileId}`, {
      responseType: "blob",
    });
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },
};

export const permissionsAPI = {
  limitMessages: async (groupId) => {
    const response = await api.post(`/groups/${groupId}/toggle-restriction`);
    return response.data;
  },
};
