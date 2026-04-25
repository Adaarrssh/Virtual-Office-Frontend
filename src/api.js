import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://virtual-office-backend-3e1e.onrender.com/api";

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default API;
