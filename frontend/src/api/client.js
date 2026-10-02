const BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),

  // Services
  getServices: () => request('/services'),
  getService: (slug) => request(`/services/${slug}`),

  // Applications
  submitApplication: (body) => request('/applications', { method: 'POST', body: JSON.stringify(body) }),
  getApplications: () => request('/applications'),
  getApplication: (id) => request(`/applications/${id}`),

  // Tracking
  trackOrder: (trackingId) => request(`/track/${trackingId}`),

  // Blog
  getBlogPosts: () => request('/blog'),
  getBlogPost: (slug) => request(`/blog/${slug}`),

  // Contact
  submitContact: (body) => request('/contact', { method: 'POST', body: JSON.stringify(body) }),
};
