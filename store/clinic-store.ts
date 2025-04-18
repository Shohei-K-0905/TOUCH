import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clinic } from '@/types';
import { mockClinics } from '@/mocks/data';

interface ClinicState {
  clinics: Clinic[];
  selectedClinicId: string | null;
  isLoading: boolean;
  error: string | null;
  addClinic: (clinic: Omit<Clinic, 'id'>) => void;
  updateClinic: (id: string, updates: Partial<Clinic>) => void;
  deleteClinic: (id: string) => void;
  getClinicById: (id: string) => Clinic | undefined;
  selectClinic: (id: string) => void;
  unselectClinic: (id: string) => void;
  getSelectedClinics: () => Clinic[];
}

export const useClinicStore = create<ClinicState>()(
  persist(
    (set, get) => ({
      clinics: mockClinics,
      selectedClinicId: null,
      isLoading: false,
      error: null,
      
      addClinic: (clinic) => {
        const newClinic = {
          ...clinic,
          id: Date.now().toString(),
          doctors: [], // 新規作成時は医師リストは空でも可
        };
        set((state) => ({
          clinics: [...state.clinics, newClinic],
        }));
      },
      
      updateClinic: (id, updates) => {
        set((state) => ({
          clinics: state.clinics.map((clinic) =>
            clinic.id === id ? { ...clinic, ...updates } : clinic
          ),
        }));
      },
      
      deleteClinic: (id) => {
        console.log(`Attempting to delete clinic with id: ${id}`);
        
        // First, get the current state
        const currentState = get();
        console.log(`Current state has ${currentState.clinics.length} clinics`);
        
        // Find the clinic to delete
        const clinicToDelete = currentState.clinics.find(c => c.id === id);
        console.log(`Clinic to delete:`, clinicToDelete);
        
        if (!clinicToDelete) {
          console.error(`Clinic with id ${id} not found!`);
          return; // Exit if clinic not found
        }
        
        // Create new array without the clinic to delete
        const newClinics = currentState.clinics.filter(c => c.id !== id);
        
        console.log(`After deletion: ${newClinics.length} clinics`);
        
        // Update the state with the new array
        set({
          clinics: newClinics,
          selectedClinicId: currentState.selectedClinicId === id ? null : currentState.selectedClinicId,
        });
        
        // Force persist the state to AsyncStorage
        const stateToSave = {
          state: {
            clinics: newClinics,
            selectedClinicId: currentState.selectedClinicId === id ? null : currentState.selectedClinicId,
          },
          version: 0,
        };
        
        AsyncStorage.setItem('clinic-storage', JSON.stringify(stateToSave))
          .then(() => {
            console.log('State persisted to AsyncStorage after deletion');
          })
          .catch(error => {
            console.error('Failed to persist state:', error);
          });
      },
      
      getClinicById: (id) => {
        return get().clinics.find((clinic) => clinic.id === id);
      },
      
      selectClinic: (id) => {
        set({ selectedClinicId: id });
      },
      
      unselectClinic: (id) => {
        set((state) => ({
          selectedClinicId: state.selectedClinicId === id ? null : state.selectedClinicId,
        }));
      },
      
      getSelectedClinics: () => {
        // This function is used in the profile screen to show selected clinics
        // For now, we'll just return all clinics
        return get().clinics;
      },
    }),
    {
      name: 'clinic-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        clinics: state.clinics,
        selectedClinicId: state.selectedClinicId,
      }),
    }
  )
);