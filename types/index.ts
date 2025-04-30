export interface Child {
  parentId: string; // Link to the parent user
  id: string;
  name: string;
  age: number;
  birthDate: string; // Store as YYYY-MM-DD string in app state
  gender: 'male' | 'female' | 'other';
  allergies?: string[];
  medicalConditions?: string[];
  photo?: string | null;
  insuranceCardImage?: string | null;
  recipientCertImage?: string | null;
}

export interface Daycare {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  specialties: string[];
  doctors?: { id: string; name: string; specialty: string }[]; // 医師は任意
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinicId: string;
  photo?: string | null;
}

export interface Appointment {
  id: string;
  childId: string;
  daycareId: string;
  clinicId: string;
  doctorId: string; // 空文字列も許容
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  meetingLink?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string; // Match Firestore field name
  birthDate?: string;
  address?: string;
  workplace?: string;
  workplacePhone?: string;
  children?: Child[]; // Make optional as it might not be in the main doc
}