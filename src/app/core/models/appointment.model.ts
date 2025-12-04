export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  slotId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  consultationFee: number;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  // Optional fields from backend
  doctorName?: string;
  patientName?: string;
  specialtyName?: string;
  patientPhone?: string;
  patientEmail?: string;
  doctorAvatar?: string;
  doctorEmail?: string;
  doctorPhone?: string;
  publicCode: string;
}

export interface AppointmentPageResponse {
  content: Appointment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
  sorted: boolean;
}
