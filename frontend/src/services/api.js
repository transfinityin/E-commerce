import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.transfinity.shop/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Refresh token automatically on 401
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh_token");

        if (!refresh) {
          throw new Error("No refresh token found");
        }

        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh,
        });

        localStorage.setItem("access_token", data.access);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${data.access}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        // Only bounce to login on protected routes — public pages (shop/home) stay put.
        const path = window.location.pathname;
        const protectedPrefix = [
          "/cart",
          "/checkout",
          "/profile",
          "/wishlist",
          "/addresses",
          "/orders",
          "/order-success",
        ];
        const needsAuth = protectedPrefix.some(
          (p) => path === p || path.startsWith(`${p}/`),
        );
        if (needsAuth && path !== "/login") {
          window.location.href = "/login";
        } else {
          // Soft-reset auth UI without a hard navigation
          window.dispatchEvent(new Event("tf:auth-cleared"));
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
