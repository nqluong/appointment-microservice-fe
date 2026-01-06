import { Doctor } from './doctor.model';

export interface Specialty {
  specialtyId: string;
  name: string;
  description: string;
  isActive: boolean;
  doctors: Doctor[];
}
