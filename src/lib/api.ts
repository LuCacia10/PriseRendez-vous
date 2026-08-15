import {
  AuthResponse,
  User,
  Agency,
  Service,
  TimeSlot,
  Appointment,
  AppNotification,
} from '../types';

const TOKEN_KEY = 'rdv_admin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Une erreur est survenue.');
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    firstName: string;
    phone: string;
    identityCardNum?: string;
  }) => request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<User>('/api/auth/me'),

  updateFcmToken: (fcmToken: string) =>
    request<{ success: boolean }>('/api/auth/fcm-token', {
      method: 'POST',
      body: JSON.stringify({ fcmToken }),
    }),

  // Public / Catalog
  getServices: () => request<Service[]>('/api/services'),

  getAgencies: () => request<Agency[]>('/api/agencies'),

  getSlots: (serviceId: string, agencyId: string, date: string) =>
    request<TimeSlot[]>(
      `/api/services/${serviceId}/slots?agencyId=${agencyId}&date=${date}`
    ),

  // Appointments
  createAppointment: (payload: {
    serviceId: string;
    agencyId: string;
    slotDate: string;
    startTime: string;
    endTime: string;
  }) =>
    request<Appointment>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyAppointments: () => request<Appointment[]>('/api/appointments/me'),

  getAppointmentDetail: (id: string) =>
    request<Appointment>(`/api/appointments/${id}`),

  cancelAppointment: (id: string, reason?: string) =>
    request<Appointment>(`/api/appointments/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  rescheduleAppointment: (
    id: string,
    payload: { slotDate: string; startTime: string; endTime: string }
  ) =>
    request<Appointment>(`/api/appointments/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getQrCode: (id: string) =>
    request<{ qrCodeData: string; appointmentNumber: string }>(
      `/api/appointments/${id}/qrcode`
    ),

  // Notifications
  getNotifications: () => request<AppNotification[]>('/api/notifications/me'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  // Agent / Admin
  getAdminAppointments: (filters?: { date?: string; status?: string; agencyId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.agencyId) params.append('agencyId', filters.agencyId);
    return request<Appointment[]>(`/api/admin/appointments?${params.toString()}`);
  },

  validateAppointment: (id: string, notes?: string) =>
    request<Appointment>(`/api/appointments/${id}/validate`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  scanQrCode: (qrPayload: string) =>
    request<{ appointment: Appointment; message: string }>('/api/admin/scan-qr', {
      method: 'POST',
      body: JSON.stringify({ qrPayload }),
    }),

  triggerReminder: (id: string, type: '24h' | '1h') =>
    request<{ success: boolean; notification: AppNotification }>(
      `/api/appointments/${id}/trigger-reminder`,
      {
        method: 'POST',
        body: JSON.stringify({ type }),
      }
    ),

  // Export / Documentation
  getSqlSchema: () => request<{ sql: string }>('/api/export/schema.sql'),

  getMysqlSchema: () => request<{ sql: string }>('/api/export/schema.mysql.sql'),

  getSqliteSchema: () => request<{ sql: string }>('/api/export/schema.sqlite.sql'),

  getFlutterCode: () => request<{ files: Record<string, string> }>('/api/export/flutter-code'),

  getStats: () => request<import('../types').AdminStats>('/api/admin/stats'),

  createService: (payload: Partial<Service>) =>
    request<Service>('/api/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateService: (id: string, payload: Partial<Service>) =>
    request<Service>(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteService: (id: string) =>
    request<{ success: boolean }>(`/api/services/${id}`, {
      method: 'DELETE',
    }),

  deleteAppointment: (id: string) =>
    request<{ success: boolean }>(`/api/appointments/${id}`, {
      method: 'DELETE',
    }),
};
