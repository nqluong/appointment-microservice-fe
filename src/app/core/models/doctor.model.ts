export interface Doctor {
  userId: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  avatarUrl: string;
  licenseNumber?: string;
  qualification: string;
  yearsOfExperience: number;
  consultationFee: number;
  specialtyName: string;
}

export interface TimeSlot {
  slotId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface DoctorDetail {
  userId: string;
  fullName: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  avatarUrl: string | null;
  gender: 'MALE' | 'FEMALE';
  specialtyName: string;
  licenseNumber: string | null;
  qualification: string;
  yearsOfExperience: number;
  consultationFee: number;
  availableSlots: TimeSlot[];
}

export interface DoctorResponse {
  content: Doctor[];
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

export interface UserProfile {
  userProfileId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  address: string;
  phone: string;
  medicalProfileId: string;
  bloodType: string;
  allergies: string;
  medicalHistory: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  isDoctorApproved: boolean;
  userProfileUpdatedAt: string;
  medicalProfileUpdatedAt: string;
}
