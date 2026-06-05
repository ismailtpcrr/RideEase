import api from './api';
import { Payment, PaymentCreateRequest } from '@/types';

export const paymentService = {
  async create(data: PaymentCreateRequest): Promise<Payment> {
    const res = await api.post<Payment>('/payments', data);
    return res.data;
  },

  async getByReservation(reservationId: number): Promise<Payment | null> {
    try {
      const res = await api.get<Payment>(`/payments/reservation/${reservationId}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async getAll(): Promise<Payment[]> {
    const res = await api.get<Payment[]>('/admin/payments');
    return res.data;
  },
};
