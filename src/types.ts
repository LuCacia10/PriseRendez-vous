export type UserRole = 'citizen' | 'agent' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  phone: string;
  identityCardNum?: string;
  role: UserRole;
  fcmToken?: string;
  createdAt: string;
}

export interface Agency {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  openingHours: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  requiredDocuments: string[];
  durationMinutes: number;
  maxSlotsPerTime: number;
  agencyIds: string[];
  iconName?: string;
}

export interface TimeSlot {
  id: string;
  serviceId: string;
  agencyId: string;
  slotDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  capacity: number;
  bookedCount: number;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  appointmentNumber: string; // e.g. A-2026-000123
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  serviceId: string;
  serviceName: string;
  agencyId: string;
  agencyName: string;
  agencyAddress: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: 'en_attente' | 'confirme' | 'honore' | 'annule' | 'absent';
  qrCodeData: string; // base64 data URL or payload string
  createdAt: string;
  validatedAt?: string;
  validatedBy?: string;
  notes?: string;
}

export type NotificationType =
  | 'confirmation'
  | 'rappel_24h'
  | 'rappel_1h'
  | 'annulation'
  | 'modification'
  | 'validation';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  appointmentId?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AdminStats {
  totalAppointments: number;
  confirmedCount: number;
  honoredCount: number;
  cancelledCount: number;
  todayCount: number;
  totalUsers: number;
  totalServices: number;
  attendanceRate: number;
  serviceDistribution: { name: string; count: number; percentage: number }[];
  hourlyActivity: { hour: string; count: number }[];
}

export interface GitCommit {
  hash: string;
  type: 'feat' | 'fix' | 'docs' | 'refactor' | 'test' | 'chore';
  message: string;
  author: string;
  date: string;
  filesChanged: number;
}
