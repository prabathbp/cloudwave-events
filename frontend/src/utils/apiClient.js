import axios from "axios";
import { getIdToken } from "./authToken";

const BASE_URL = "https://d307hyj1i7.execute-api.ap-southeast-1.amazonaws.com/dev";

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function authConfig(extra = {}) {
  const token = getIdToken();
  if (!token) return extra;

  return {
    ...extra,
    headers: {
      ...(extra.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };
}

API.interceptors.request.use((config) => {
  const token = getIdToken();
  if (!token) return config;

  if (config.headers && typeof config.headers.set === "function") {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export const getEvents = () => API.get("/events");
export const getEventById = (id) => API.get(`/events/${id}`, authConfig());
export const createEvent = (data) => API.post("/events", data, authConfig());
export const updateEvent = (id, data) =>
  API.put(`/events/${id}`, data, authConfig());
export const deleteEvent = (id) => API.delete(`/events/${id}`, authConfig());
export const registerForEvent = (data) =>
  API.post("/registrations", data, authConfig());
export const getPresignedUrl = (params) =>
  API.get(
    `/uploads/presigned-url?filename=${encodeURIComponent(params.filename)}&contentType=${encodeURIComponent(params.contentType)}`,
    authConfig()
  );
