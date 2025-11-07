import API from './axios';

export const login = (email, password) => API.post('/auth/login', { email, password });
export const register = (data) => API.post('/auth/register', data);
export const logout = () => localStorage.removeItem('token');