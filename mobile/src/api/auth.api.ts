import { apiClient } from './api.client';

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: async (data: RegisterPayload) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginPayload) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
};
