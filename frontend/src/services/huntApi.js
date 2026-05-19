import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const huntApi = axios.create({
  baseURL: `${API_BASE}/hunt`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token interceptor
huntApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handler
const handleError = (error) => {
  if (error.response?.data?.code) {
    const code = error.response.data.code;
    const message = error.response.data.error || 'Something went wrong';

    switch (code) {
      case 'ALREADY_CLAIMED':
        throw new Error('This QR is already claimed by another user!');
      case 'INVALID_QR':
        throw new Error('Invalid QR code. Please check your T-shirt.');
      case 'HUNT_EXISTS':
        throw new Error('You already have an active treasure hunt!');
      case 'NOT_STARTED':
        throw new Error('Activate your T-shirt QR first!');
      case 'OUT_OF_RANGE':
        throw new Error(`Too far! Get within ${error.response.data.required_radius}m.`);
      case 'INVALID_LOCATION':
        throw new Error('Invalid location QR. Are you at the right place?');
      case 'REWARD_CLAIMED':
        throw new Error('You already claimed this levels reward!');
      case 'ALREADY_COMPLETED':
        throw new Error('Congratulations! You already completed the hunt!');
      default:
        throw new Error(message);
    }
  }
  throw error;
};

export const huntService = {
  // Activate T-shirt QR
  activateQR: async (code) => {
    try {
      const response = await huntApi.post('/activate/', { code });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get progress
  getProgress: async () => {
    try {
      const response = await huntApi.get('/progress/');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get full dashboard
  getDashboard: async () => {
    try {
      const response = await huntApi.get('/dashboard/');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Verify location
  verifyLocation: async (locSecret, userLat, userLong) => {
    try {
      const response = await huntApi.post('/verify-location/', {
        loc_secret: locSecret,
        user_lat: userLat,
        user_long: userLong
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get leaderboard
  getLeaderboard: async (top = 50) => {
    try {
      const response = await huntApi.get(`/leaderboard/?top=${top}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // ========== ADMIN APIs ==========

  // Get admin dashboard stats
  getAdminDashboard: async () => {
    try {
      const response = await huntApi.get('/admin/dashboard-stats/');
      return response.data;
    } catch (error) {
      console.warn('Admin dashboard stats not available:', error.message);
      return null;
    }
  },

  // Get all QR codes (admin)
  getAdminQRCodes: async () => {
    try {
      const response = await huntApi.get('/admin/qr-codes/');
      return response.data;
    } catch (error) {
      console.warn('Admin QR list not available:', error.message);
      return { count: 0, results: [] };
    }
  },

  // Generate QR batch (admin)
  generateQR: async (orderIds) => {
    try {
      const response = await huntApi.post('/admin/generate-qr/', { order_ids: orderIds });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get locations (admin)
  getLocations: async () => {
    try {
      const response = await huntApi.get('/admin/locations/');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Create/Update location (admin)
  saveLocation: async (data, id = null) => {
    try {
      if (id) {
        const response = await huntApi.put(`/admin/locations/${id}/`, data);
        return response.data;
      } else {
        const response = await huntApi.post('/admin/locations/', data);
        return response.data;
      }
    } catch (error) {
      handleError(error);
    }
  },

  // Delete location (admin)
  deleteLocation: async (id) => {
    try {
      const response = await huntApi.delete(`/admin/locations/${id}/`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
};

export default huntApi;