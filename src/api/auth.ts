import api from './axiosConfig';
import { LoginCredentials, AuthResponse } from '@/types';
import { mockLogin } from './mockAuth';

// Toggle this to use mock auth for testing without backend
const USE_MOCK_AUTH = false;

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  if (USE_MOCK_AUTH) {
    return mockLogin(credentials.email, credentials.password);
  }
  const { data } = await api.post<AuthResponse>('/auth/login', credentials);
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
