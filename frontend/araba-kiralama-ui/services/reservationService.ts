import api from './api';
import { Reservation, ReservationCreateRequest } from '@/types';

export const reservationService = {
  async create(data: ReservationCreateRequest): Promise<Reservation> {
    const res = await api.post<Reservation>('/reservations', data);
    return res.data;
  },

  async getMy(): Promise<Reservation[]> {
    const res = await api.get<Reservation[]>('/reservations/my');
    return res.data;
  },

  async cancel(id: number): Promise<void> {
    await api.delete(`/reservations/${id}`);
  },

  async getAll(): Promise<Reservation[]> {
    const res = await api.get<Reservation[]>('/admin/reservations');
    return res.data;
  },

  async approve(id: number): Promise<void> {
    await api.put(`/admin/reservations/${id}/approve`);
  },

  async reject(id: number): Promise<void> {
    await api.put(`/admin/reservations/${id}/reject`);
  },

  async complete(id: number): Promise<void> {
    await api.put(`/admin/reservations/${id}/complete`);
  },
};
