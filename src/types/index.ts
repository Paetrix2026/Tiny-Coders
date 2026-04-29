export type Role = 'patient' | 'doctor' | null;

export interface Profile {
  id: string; // uuid
  email: string;
  name: string;
  role: 'patient' | 'doctor';
}

export interface Doctor {
  id: string; // uuid
  user_id: string; // uuid -> references profiles.id
  specialization: string;
  // joined
  profile?: Profile;
}

export interface Patient {
  id: string; // uuid (assumed to be auth.user.id / profiles.id)
  patient_id: string; // text
  age: number;
  glucose: number;
  blood_pressure: number;
  bmi: number;
  // joined
  profile?: Profile;
}

export interface RecordEntry {
  id: string; // uuid
  patient_id: string; // uuid
  doctor_id: string; // uuid
  glucose: number; // float
  bp: string; // text
  // joined
  doctor?: Doctor;
  patient?: Patient;
}

export interface DoctorPatientMap {
  doctor_id: string;
  patient_id: string;
}
