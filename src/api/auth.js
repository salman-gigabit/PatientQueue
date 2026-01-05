import axios from "axios";

const API = import.meta?.env?.VITE_API || "http://localhost:8000";

export const login = (email, password) => 
  axios.post(`${API}/auth/login`, { email, password });

export const signup = (name, email, password) => 
  axios.post(`${API}/auth/signup`, { name, email, password });

export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return Promise.reject(new Error("No token"));
  return axios.get(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

