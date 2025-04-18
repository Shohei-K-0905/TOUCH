import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, Daycare, Clinic, Doctor } from '@/types';
import { mockAppointments, mockDaycares, mockClinics, mockDoctors } from '@/mocks/data';

interface AppointmentState {
  appointments: Appointment[];
  daycares: Daycare[];
  clinics: Clinic[];
  doctors: Doctor[];
  selectedDaycareId: string | null;
  selectedClinicId: string | null;
  selectedDoctorId: string | null;
  isLoading: boolean;
  error: string | null;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'meetingLink'>) => string;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
  selectDaycare: (id: string) => void;
  selectClinic: (id: string) => void;
  selectDoctor: (id: string) => void;
  getSelectedDaycare: () => Daycare | undefined;
  getSelectedClinic: () => Clinic | undefined;
  getSelectedDoctor: () => Doctor | undefined;
  generateMeetingLink: (appointmentId: string) => string;
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      appointments: [], // Initialize with empty array for production
      daycares: mockDaycares, // Keep sample daycares
      clinics: mockClinics, // Keep sample clinics
      doctors: mockDoctors, // Keep sample doctors
      selectedDaycareId: null,
      selectedClinicId: null,
      selectedDoctorId: null,
      isLoading: false,
      error: null,
      addAppointment: (appointmentData) => {
        const id = Date.now().toString();
        const newAppointment: Appointment = {
          ...appointmentData,
          id,
          status: 'scheduled',
          meetingLink: '',
        };
        set((state) => ({
          appointments: [...state.appointments, newAppointment],
        }));
        return id;
      },
      updateAppointment: (id, updates) => {
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === id ? { ...appointment, ...updates } : appointment
          ),
        }));
      },
      cancelAppointment: (id) => {
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment
          ),
        }));
      },
      selectDaycare: (id) => {
        set({ selectedDaycareId: id });
      },
      selectClinic: (id) => {
        set({ selectedClinicId: id });
      },
      selectDoctor: (id) => {
        set({ selectedDoctorId: id });
      },
      getSelectedDaycare: () => {
        const { daycares, selectedDaycareId } = get();
        return daycares.find((daycare) => daycare.id === selectedDaycareId);
      },
      getSelectedClinic: () => {
        const { clinics, selectedClinicId } = get();
        return clinics.find((clinic) => clinic.id === selectedClinicId);
      },
      getSelectedDoctor: () => {
        const { doctors, selectedDoctorId } = get();
        return doctors.find((doctor) => doctor.id === selectedDoctorId);
      },
      generateMeetingLink: (appointmentId) => {
        // Generate a Jitsi Meet URL
        const roomName = `TOUCH_${appointmentId}_${Date.now()}`;
        const meetingLink = `https://meet.jit.si/${roomName}`;
        
        // Update the appointment with the meeting link
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, meetingLink }
              : appointment
          ),
        }));
        
        return meetingLink;
      },
    }),
    {
      name: 'appointment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);