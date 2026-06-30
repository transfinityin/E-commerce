import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.transfinity.shop/api";

// ✅ FIX: Add /hunt to baseURL so all calls go to /api/hunt/...
const huntApi = axios.create({
  baseURL: `${API_URL}/hunt/`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token interceptor
huntApi.interceptors.request.use(
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

// Error handler
const handleError = (error) => {
  if (error.response?.data?.code) {
    const code = error.response.data.code;
    const message = error.response.data.error || "Something went wrong";

    switch (code) {
      case "ALREADY_CLAIMED":
        throw new Error("This QR is already claimed by another user!");

      case "INVALID_QR":
        throw new Error("Invalid QR code. Please check your T-shirt.");

      case "HUNT_EXISTS":
        throw new Error("You already have an active treasure hunt!");

      case "NOT_STARTED":
        throw new Error("Activate your T-shirt QR first!");

      case "OUT_OF_RANGE":
        throw new Error(
          `Too far! Get within ${error.response.data.required_radius || 100}m.`,
        );

      case "INVALID_LOCATION":
        throw new Error("Invalid location QR. Are you at the right place?");

      case "REWARD_CLAIMED":
        throw new Error("You already claimed this level reward!");

      case "ALREADY_COMPLETED":
        throw new Error("Congratulations! You already completed the hunt!");

      default:
        throw new Error(message);
    }
  }

  if (error.response?.data?.detail) {
    throw new Error(error.response.data.detail);
  }

  if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  }

  if (error.response?.status === 404) {
    throw new Error("API endpoint or QR code not found");
  }

  throw new Error(error.message || "Request failed");
};

export const huntService = {
  // Activate T-shirt QR
  activateQR: async (code) => {
    try {
      const response = await huntApi.post("/activate/", { code });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get hunt progress
  // ✅ FIX: Backend path is /hunt-progress/ not /hunt/progress/
  getProgress: async () => {
    try {
      const response = await huntApi.get("/hunt-progress/");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get hunt leaderboard
  // ✅ FIX: Backend path is /hunt-leaderboard/ not /hunt/leaderboard/
  getLeaderboard: async (top = 50) => {
    try {
      const response = await huntApi.get(`/hunt-leaderboard/?top=${top}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // ✅ FIX: Backend has /map/world/ for world map data
  getWorldMap: async () => {
    try {
      const response = await huntApi.get("/map/world/");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // ✅ FIX: Backend has /community/stats/ and /community/progress/
  getCommunityStats: async () => {
    try {
      const response = await huntApi.get("/community/stats/");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // These endpoints work only if backend urls/views exist
  // ✅ FIX: /verify-location/ doesn't exist in current backend (commented out)
  // If you need it, uncomment the view in views.py first
  verifyLocation: async (locSecret, userLat, userLong) => {
    try {
      const response = await huntApi.post("/verify-location/", {
        loc_secret: locSecret,
        user_lat: userLat,
        user_long: userLong,
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // ✅ FIX: Now correctly resolves to /api/hunt/admin/dashboard-stats/
  getAdminDashboard: async () => {
    try {
      const response = await huntApi.get("/admin/dashboard-stats/");
      return response.data;
    } catch (error) {
      console.warn("Admin dashboard stats not available:", error.message);
      return null;
    }
  },

  // ✅ FIX: Backend has /qr-status/<hash>/ not /admin/qr-codes/
  getQRStatus: async (secretHash) => {
    try {
      const response = await huntApi.get(`/qr-status/${secretHash}/`);
      return response.data;
    } catch (error) {
      console.warn("QR status check failed:", error.message);
      return { exists: false };
    }
  },

  // ✅ FIX: Now correctly resolves to /api/hunt/admin/generate-qr/
  generateQR: async (orderIds) => {
    try {
      const response = await huntApi.post("/admin/generate-qr/", {
        order_ids: orderIds,
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // ✅ FIX: Now correctly resolves to /api/hunt/admin/locations/
  getLocations: async () => {
    try {
      const response = await huntApi.get("/admin/locations/");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  saveLocation: async (data, id = null) => {
    try {
      if (id) {
        const response = await huntApi.put(`/admin/locations/${id}/`, data);
        return response.data;
      }
      const response = await huntApi.post("/admin/locations/", data);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  deleteLocation: async (id) => {
    try {
      const response = await huntApi.delete(`/admin/locations/${id}/`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

export default huntApi;
