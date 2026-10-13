const DIRECT_API = 'http://127.0.0.1:8000';

async function request(endpoint, options = {}) {
  let response;

  // 1. Try relative URL first (Vite proxy)
  try {
    response = await fetch(endpoint, options);
  } catch (proxyNetErr) {
    // If relative network fetch completely fails, try direct backend URL
    try {
      response = await fetch(`${DIRECT_API}${endpoint}`, options);
    } catch (directNetErr) {
      throw new Error(
        'Backend server is unreachable. Please ensure the Python FastAPI server is running on port 8000 (run start_backend.bat or start_all.bat).'
      );
    }
  }

  // 2. If proxy returned a 500/502/504 gateway error, attempt direct backend port 8000
  if (!response.ok && (response.status === 500 || response.status === 502 || response.status === 504)) {
    try {
      const directResponse = await fetch(`${DIRECT_API}${endpoint}`, options);
      if (directResponse.ok) {
        return directResponse.json();
      }
    } catch (_) {
      // Ignore direct fallback error and process original response error
    }
  }

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const err = await response.json();
      errorDetail = err.detail || JSON.stringify(err);
    } catch (e) {
      if (response.status === 500 || response.status === 502 || response.status === 504) {
        errorDetail =
          'Backend server (FastAPI port 8000) is offline or unreachable. Please start it using start_backend.bat or start_all.bat.';
      } else {
        errorDetail = response.statusText || `HTTP ${response.status} Error`;
      }
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  // Auth
  login: (username, password) =>
    request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),

  // Bins
  getBins: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/bins${query ? `?${query}` : ''}`);
  },
  getBin: (id) => request(`/api/bins/${id}`),
  createBin: (data) =>
    request('/api/bins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateBin: (id, data) =>
    request(`/api/bins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteBin: (id) =>
    request(`/api/bins/${id}`, {
      method: 'DELETE',
    }),
  getBinHistory: (id, limit = 24) =>
    request(`/api/bins/${id}/history?limit=${limit}`),

  // Simulation
  triggerTick: (multiplier = 1.0) =>
    request(`/api/simulation/tick?multiplier=${multiplier}`, { method: 'POST' }),
  emptyBin: (id) =>
    request(`/api/simulation/empty/${id}`, { method: 'POST' }),
  spikeBin: (id, targetFill) =>
    request(`/api/simulation/spike/${id}?target_fill=${targetFill}`, { method: 'POST' }),
  resetSimulation: () =>
    request('/api/simulation/reset', { method: 'POST' }),

  // Vision
  classifyImage: (formData) =>
    request('/api/vision/classify', {
      method: 'POST',
      body: formData,
    }),
  getVisionHistory: () => request('/api/vision/history'),

  // AI & Recommendations
  getRecommendations: () => request('/api/ai/recommendations'),
  chatAssistant: (message) =>
    request('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    }),

  // Collections
  getCollections: (status) => {
    const query = status ? `?status=${status}` : '';
    return request(`/api/collections${query}`);
  },
  createAlert: (data) =>
    request('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateAlert: (id, data) =>
    request(`/api/collections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  dispatchAll: () =>
    request('/api/collections/dispatch-all', { method: 'POST' }),

  // Reports
  getDashboardStats: () => request('/api/reports/dashboard-stats'),
  getCategoryBreakdown: () => request('/api/reports/category-breakdown'),
  getHourlyTrends: () => request('/api/reports/hourly-trends'),
  exportCsvUrl: '/api/reports/export-csv',

  // Settings
  getSettings: () => request('/api/settings'),
  updateSettings: (data) =>
    request('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};
