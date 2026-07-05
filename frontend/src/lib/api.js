import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('secureOfficeToken');
  const guestId = localStorage.getItem('secureOfficeGuestId') || crypto.randomUUID();
  localStorage.setItem('secureOfficeGuestId', guestId);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Guest-Id'] = guestId;
  return config;
});

export const authStore = {
  current() {
    return JSON.parse(localStorage.getItem('secureOfficeUser') || 'null');
  },
  saveSession(payload) {
    localStorage.setItem('secureOfficeToken', payload.token);
    localStorage.setItem('secureOfficeUser', JSON.stringify(payload.user));
    return payload.user;
  },
  saveUser(user) {
    localStorage.setItem('secureOfficeUser', JSON.stringify(user));
    return user;
  },
  clear() {
    localStorage.removeItem('secureOfficeToken');
    localStorage.removeItem('secureOfficeUser');
  },
};
