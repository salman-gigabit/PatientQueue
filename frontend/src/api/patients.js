import axios from "axios";

const API = import.meta?.env?.VITE_API || "http://localhost:8000";

export const getPatients = () => axios.get(`${API}/patients`);
export const getStats = () => axios.get(`${API}/patients/stats`);
export const addPatient = (data) => axios.post(`${API}/patients`, data);
export const markVisited = (id) => axios.put(`${API}/patients/${id}/visit`);
