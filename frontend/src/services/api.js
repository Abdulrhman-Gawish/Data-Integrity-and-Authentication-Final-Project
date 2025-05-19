import axios from "../utils/axios";

export const getDocuments = async () => {
  const res = await axios.get("/documents");
  return res.data;
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const downloadDocument = async (docId) => {
  const res = await axios.get(`/documents/${docId}/download`, {
    responseType: "blob",
  });
  return res.data;
};

export const updateDocument = async (docId, data) => {
  const res = await axios.patch(`/documents/${docId}`, data);
  return res.data;
};

export const deleteDocument = async (docId) => {
  const res = await axios.delete(`/documents/${docId}`);
  return res.data;
};

export const signup = async (formData) => {
  const response = await axios.post("/auth/signup", formData);
  return response.data;
};

export const logout = async () => {
  const response = await axios.get("/auth/logout");
  return response.data;
};

export const githubLoginUrl = () => {
  const redirectUri = `${window.location.origin}/auth/callback`;
  return `/auth/github?redirect_uri=${encodeURIComponent(redirectUri)}`;
};
export const getCurrentUser = async () => {
  const response = await axios.get("/auth/checkAuth");
  return response.data;
};

export const updateUserProfile = async (profileForm) => {
  const response = await axios.patch("/users/profile", profileForm);
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  try {
    const response = await axios.get('/users', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (userId) => {
  const response = await axios.get(`/users/${userId}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post("/users", userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await axios.patch(`/users/${userId}`, userData);
  return response.data;
};

export const updateUserRole = async (userId, roleData) => {
  const response = await axios.patch(`/users/${userId}/role`, roleData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(`/users/${userId}`);
  return response.data;
};
export const getLogs = async (params = {}) => {
  try {
    const response = await axios.get('/admin/logs', { params });
    return {
      data: response.data.data,
      total: response.data.pagination.total,
      currentPage: response.data.pagination.currentPage,
      totalPages: response.data.pagination.totalPages
    };
  } catch (error) {
    throw error;
  }
};

export const verifyDocumentSignature = async (docId) => {
  const response = await axios.get(`/documents/${docId}/verify`);
  return response.data;
};


