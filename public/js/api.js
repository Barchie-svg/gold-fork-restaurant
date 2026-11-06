/* =============================================
   THE GOLDEN FORK — API UTILITY (api.js)
   ============================================= */

const API_BASE = '/api';

// ── Generic Fetch Wrapper ──────────────────────
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('gf_admin_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── File Upload (FormData — no Content-Type) ──
async function apiUpload(endpoint, formData, method = 'POST') {
  const token = localStorage.getItem('gf_admin_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Upload failed');
  return data;
}

// ── API Namespace ─────────────────────────────
const api = {
  auth: {
    login: (email, password) =>
      apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    getMe: () => apiRequest('/auth/me'),
  },
  menu: {
    getAll: (category = '') =>
      apiRequest(`/menu${category ? '?category=' + encodeURIComponent(category) : ''}`),
    getFeatured: () => apiRequest('/menu/featured'),
    create: (formData) => apiUpload('/menu', formData, 'POST'),
    update: (id, formData) => apiUpload(`/menu/${id}`, formData, 'PUT'),
    delete: (id) => apiRequest(`/menu/${id}`, { method: 'DELETE' }),
  },
  orders: {
    create: (data) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(data) }),
    getAll: (params = '') => apiRequest(`/orders${params}`),
    getStats: () => apiRequest('/orders/stats'),
    updateStatus: (id, status) =>
      apiRequest(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },
  reservations: {
    create: (data) =>
      apiRequest('/reservations', { method: 'POST', body: JSON.stringify(data) }),
    getAll: (params = '') => apiRequest(`/reservations${params}`),
    getStats: () => apiRequest('/reservations/stats'),
    update: (id, data) =>
      apiRequest(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  events: {
    create: (data) => apiRequest('/events', { method: 'POST', body: JSON.stringify(data) }),
    getAll: (params = '') => apiRequest(`/events${params}`),
    update: (id, data) =>
      apiRequest(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  reviews: {
    create: (data) => apiRequest('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    getApproved: () => apiRequest('/reviews/approved'),
    getAll: () => apiRequest('/reviews'),
    updateStatus: (id, approved) =>
      apiRequest(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify({ approved }) }),
    delete: (id) => apiRequest(`/reviews/${id}`, { method: 'DELETE' }),
  },
  payments: {
    mpesaSTKPush: (data) =>
      apiRequest('/payments/mpesa/stk-push', { method: 'POST', body: JSON.stringify(data) }),
    createStripeIntent: (data) =>
      apiRequest('/payments/stripe/create-intent', { method: 'POST', body: JSON.stringify(data) }),
  },
};

// ── Toast Notifications ───────────────────────
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const icons = { success: 'check-circle', error: 'times-circle', info: 'info-circle', warning: 'exclamation-triangle' };
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3800);
}

// ── Helpers ───────────────────────────────────
function formatKES(amount) {
  return `KES ${Number(amount).toLocaleString('en-KE')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-KE', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-KE', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function renderStars(rating, max = 5) {
  let html = '<span class="stars">';
  for (let i = 1; i <= max; i++) {
    html += `<i class="fas fa-star${i <= rating ? '' : '-half-alt stars-empty'}"></i>`;
  }
  return html + '</span>';
}

function getCategoryEmoji(category) {
  const map = {
    Starters: '🥗', Mains: '🍽️', Desserts: '🍰', Drinks: '🥤', Specials: '⭐',
  };
  return map[category] || '🍴';
}

function statusBadge(status) {
  return `<span class="badge badge-${status}">${status}</span>`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
