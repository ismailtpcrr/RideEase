import api from './api';
import { Car, CarCategory, CarCreateRequest } from '@/types';

export const carService = {
  async getAll(): Promise<Car[]> {
    const res = await api.get<Car[]>('/cars');
    return res.data;
  },

  async getById(id: number): Promise<Car> {
    const res = await api.get<Car>(`/cars/${id}`);
    return res.data;
  },

  async getAvailable(startDate: string, endDate: string): Promise<Car[]> {
    const res = await api.get<Car[]>(`/cars/available?start=${startDate}&end=${endDate}`);
    return res.data;
  },

  async create(data: CarCreateRequest): Promise<Car> {
    const res = await api.post<Car>('/cars', data);
    return res.data;
  },

  async update(id: number, data: CarCreateRequest): Promise<Car> {
    const res = await api.put<Car>(`/cars/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/cars/${id}`);
  },

  async setAvailability(id: number, isAvailable: boolean): Promise<void> {
    await api.patch(`/cars/${id}/availability`, { isAvailable });
  },

  async getCategories(): Promise<CarCategory[]> {
    const res = await api.get<CarCategory[]>('/cars/categories');
    return res.data;
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<{ imageUrl: string }>('/cars/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.imageUrl;
  },
};
