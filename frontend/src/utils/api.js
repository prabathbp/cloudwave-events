import axios from "axios";

const BASE_URL = "https://d307hyj1i7.execute-api.ap-southeast-1.amazonaws.com/dev";

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getEvents = () => API.get("/events");
export const getEventById = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post("/events", data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const registerForEvent = (data) => API.post("/registrations", data);
export const getPresignedUrl = (data) => API.post("/uploads/presigned-url", data);

//export const getEventById = (id) =>
  axios.get(`${API_URL}/events/${id}`, { headers: authHeader() });

//export const updateEvent = (id, data) =>
  axios.put(`${API_URL}/events/${id}`, data, { headers: authHeader() });

//export const deleteEvent = (id) =>
  axios.delete(`${API_URL}/events/${id}`, { headers: authHeader() });