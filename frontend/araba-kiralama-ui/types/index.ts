export interface AuthResponse {
  token: string;
  refreshToken: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  expiresAt: string;
  claims: Record<string, string>;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  plate: string;
  dailyPrice: number;
  isAvailable: boolean;
  description?: string;
  imageUrl?: string;
  fuelType: string;
  transmission: string;
  seatCount: number;
  mileage?: number;
  categoryId: number;
  categoryName: string;
  createdAt: string;
}

export interface CarCreateRequest {
  brand: string;
  model: string;
  year: number;
  plate: string;
  dailyPrice: number;
  isAvailable: boolean;
  description?: string;
  imageUrl?: string;
  fuelType: string;
  transmission: string;
  seatCount: number;
  mileage?: number;
  categoryId: number;
}

export interface CarCategory {
  id: number;
  name: string;
}

export type ReservationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed';

export interface Reservation {
  id: number;
  userId: string;
  carId: number;
  carBrand: string;
  carModel: string;
  carPlate: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
}

export interface ReservationCreateRequest {
  carId: number;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  address?: string;
  createdAt: string;
  license?: UserLicense;
}

export interface UserLicense {
  id: number;
  licenseNumber: string;
  licenseClass: string;
  expiryDate: string;
  isVerified: boolean;
}

export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

export interface Payment {
  id: number;
  reservationId: number;
  amount: number;
  paymentMethod: string;
  cardLastFour?: string;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
  carBrand: string;
  carModel: string;
  userEmail: string;
}

export interface PaymentCreateRequest {
  reservationId: number;
  paymentMethod: string;
  cardLastFour?: string;
}

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  isLocked: boolean;
  claims: Record<string, string>;
}

export interface AdminStats {
  totalCars: number;
  availableCars: number;
  totalReservations: number;
  pendingReservations: number;
  approvedReservations: number;
  totalRevenue: number;
}
