import axios from "axios";

const API = import.meta?.env?.VITE_API || "http://localhost:8000";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getPatients = () => 
  axios.get(`${API}/patients`, { headers: getAuthHeaders() });

export const getStats = () => 
  axios.get(`${API}/patients/stats`, { headers: getAuthHeaders() });

export const addPatient = (data) => 
  axios.post(`${API}/patients`, data, { headers: getAuthHeaders() });

export const markVisited = (id) => 
  axios.put(`${API}/patients/${id}/visit`, {}, { headers: getAuthHeaders() });
