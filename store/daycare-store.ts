import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Daycare } from '@/types';
import { mockDaycares } from '@/mocks/data';

interface DaycareState {
  daycares: Daycare[];
  selectedDaycareId: string | null;
  isLoading: boolean;
  error: string | null;
  addDaycare: (daycare: Omit<Daycare, 'id'>) => void;
  updateDaycare: (id: string, updates: Partial<Daycare>) => void;
  deleteDaycare: (id: string) => void;
  getDaycareById: (id: string) => Daycare | undefined;
  selectDaycare: (id: string) => void;
  unselectDaycare: (id: string) => void;
  getSelectedDaycares: () => Daycare[];
}

export const useDaycareStore = create<DaycareState>()(
  persist(
    (set, get) => ({
      daycares: mockDaycares,
      selectedDaycareId: null,
      isLoading: false,
      error: null,
      
      addDaycare: (daycare) => {
        const newDaycare = {
          ...daycare,
          id: Date.now().toString(),
        };
        set((state) => ({
          daycares: [...state.daycares, newDaycare],
        }));
      },
      
      updateDaycare: (id, updates) => {
        set((state) => ({
          daycares: state.daycares.map((daycare) =>
            daycare.id === id ? { ...daycare, ...updates } : daycare
          ),
        }));
      },
      
      deleteDaycare: (id) => {
        console.log(`Attempting to delete daycare with id: ${id}`);
        
        // First, get the current state
        const currentState = get();
        console.log(`Current state has ${currentState.daycares.length} daycares`);
        
        // Find the daycare to delete
        const daycareToDelete = currentState.daycares.find(d => d.id === id);
        console.log(`Daycare to delete:`, daycareToDelete);
        
        if (!daycareToDelete) {
          console.error(`Daycare with id ${id} not found!`);
          return; // Exit if daycare not found
        }
        
        // Create new array without the daycare to delete
        const newDaycares = currentState.daycares.filter(d => d.id !== id);
        
        console.log(`After deletion: ${newDaycares.length} daycares`);
        
        // Update the state with the new array
        set({
          daycares: newDaycares,
          selectedDaycareId: currentState.selectedDaycareId === id ? null : currentState.selectedDaycareId,
        });
        
        // Force persist the state to AsyncStorage
        const stateToSave = {
          state: {
            daycares: newDaycares,
            selectedDaycareId: currentState.selectedDaycareId === id ? null : currentState.selectedDaycareId,
          },
          version: 0,
        };
        
        AsyncStorage.setItem('daycare-storage', JSON.stringify(stateToSave))
          .then(() => {
            console.log('State persisted to AsyncStorage after deletion');
          })
          .catch(error => {
            console.error('Failed to persist state:', error);
          });
      },
      
      getDaycareById: (id) => {
        return get().daycares.find((daycare) => daycare.id === id);
      },
      
      selectDaycare: (id) => {
        set({ selectedDaycareId: id });
      },
      
      unselectDaycare: (id) => {
        set((state) => ({
          selectedDaycareId: state.selectedDaycareId === id ? null : state.selectedDaycareId,
        }));
      },
      
      getSelectedDaycares: () => {
        // This function is used in the profile screen to show selected daycares
        // For now, we'll just return all daycares
        return get().daycares;
      },
    }),
    {
      name: 'daycare-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        daycares: state.daycares,
        selectedDaycareId: state.selectedDaycareId,
      }),
    }
  )
);