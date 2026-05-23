import axios from "axios";

const BASE_URL = "https://d307hyj1i7.execute-api.ap-southeast-1.amazonaws.com/dev";

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

API.interceptors.request.use((config) => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.endsWith('.idToken')) {
      const token = localStorage.getItem(key);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      break;
    }
  }
  return config;
});

export const getEvents = () => API.get("/events");
export const getEventById = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post("/events", data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const registerForEvent = (data) => API.post("/registrations", data);
export const getPresignedUrl = (params) => API.get(`/uploads/presigned-url?filename=${encodeURIComponent(params.filename)}&contentType=${encodeURIComponent(params.contentType)}`);
