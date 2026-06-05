import api from './api';
import { AdminStats, UserListItem, UserProfile } from '@/types';

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const res = await api.get<UserProfile>('/users/profile');
    return res.data;
  },

  async updateProfile(data: { firstName: string; lastName: string; address?: string }): Promise<UserProfile> {
    const res = await api.put<UserProfile>('/users/profile', data);
    return res.data;
  },

  async addLicense(data: { licenseNumber: string; licenseClass: string; expiryDate: string }): Promise<void> {
    await api.post('/users/license', data);
  },

  async updateLicense(data: { licenseNumber: string; licenseClass: string; expiryDate: string }): Promise<void> {
    await api.put('/users/license', data);
  },

  async getStats(): Promise<AdminStats> {
    const res = await api.get<AdminStats>('/admin/stats');
    return res.data;
  },

  async verifyLicense(id: number): Promise<void> {
    await api.put(`/admin/licenses/${id}/verify`);
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.put('/users/change-password', data);
  },

  async getAllUsers(): Promise<UserListItem[]> {
    const res = await api.get<UserListItem[]>('/admin/users');
    return res.data;
  },

  async deactivateUser(id: string): Promise<void> {
    await api.put(`/admin/users/${id}/deactivate`);
  },

  async activateUser(id: string): Promise<void> {
    await api.put(`/admin/users/${id}/activate`);
  },

  async assignRole(id: string, role: string): Promise<void> {
    await api.put(`/admin/users/${id}/role`, { role });
  },

  async addClaim(id: string, claimType: string, claimValue: string): Promise<void> {
    await api.put(`/admin/users/${id}/claims/add`, { claimType, claimValue });
  },

  async removeClaim(id: string, claimType: string): Promise<void> {
    await api.put(`/admin/users/${id}/claims/remove`, { claimType });
  },
};
