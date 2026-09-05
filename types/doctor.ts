export type DoctorStatus = 'online' | 'busy' | 'offline';

export type Specialty =
  | 'All Specialties'
  | 'Cardiologist'
  | 'Dermatologist'
  | 'General Physician'
  | 'Neurologist'
  | 'Pediatrician'
  | 'Psychiatrist'
  | 'Orthopedic Surgeon'
  | 'Gynecologist';

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: Specialty;
  avatar: string;
  status: DoctorStatus;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  consultationFee: number;
  hospital: string;
  education: string;
  languages: string[];
  bio: string;
  nextAvailable: string;
  badge?: string;
  isVerified?: boolean;
}

