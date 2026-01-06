export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface UserProfile {
  userProfileId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  phone: string;
  avatarUrl: string;
  medicalProfileId: string;
  bloodType: BloodType;
  allergies: string;
  medicalHistory: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  isDoctorApproved: boolean;
  userProfileUpdatedAt: string;
  medicalProfileUpdatedAt: string;
}
