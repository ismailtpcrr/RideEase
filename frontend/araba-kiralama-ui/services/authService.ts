import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authService = {
  async register(data: RegisterRequest): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>('/auth/register', data);
    return res.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  async confirmEmail(userId: string, token: string): Promise<void> {
    await api.get('/auth/confirm-email', { params: { userId, token } });
  },

  async resendConfirmation(email: string): Promise<void> {
    await api.post('/auth/resend-confirmation', { email });
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { email, token, newPassword });
  },
};
