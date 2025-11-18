export interface Doctor {
  userId: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  qualification: string;
  yearsOfExperience: number;
  consultationFee: number;
  specialtyName: string;
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
