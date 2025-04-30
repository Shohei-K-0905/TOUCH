import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Child } from '@/types';
import { db } from '@/src/firebase'; // Import initialized Firestore
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { Alert } from 'react-native';

interface ChildState {
  children: Child[];
  selectedChildId: string | null;
  isLoading: boolean;
  error: string | null;
  addChild: (child: Child) => void;
  updateChild: (id: string, updates: Partial<Child>) => void;
  deleteChild: (id: string) => void;
  selectChild: (id: string) => void;
  getSelectedChild: () => Child | undefined;
}

export const useChildStore = create<ChildState>()(
  persist(
    (set, get) => ({
      children: [], // Initialize with empty array for production
      selectedChildId: null,
      isLoading: false,
      error: null,
      addChild: async (child) => {
        // Set loading state if needed, or handle async elsewhere
        // Example: set({ isLoading: true, error: null });

        const childId = child.id || doc(collection(db, 'children')).id; // Use existing ID or generate new one

        // The 'child.birthDate' received here should already be in 'YYYY-MM-DD' format
        // from add-child.tsx's formatDate function. 
        const formattedBirthDate = child.birthDate; 

        // Attempt to convert 'YYYY-MM-DD' string to Firestore Timestamp
        // Ensure the input string is valid before creating a Date
        let birthDateTimestamp: Timestamp;
        try {
          if (!formattedBirthDate || isNaN(new Date(formattedBirthDate).getTime())) {
            // Handle invalid or empty date string - perhaps default or throw error
            console.warn(`Invalid or empty birthDate string received: ${formattedBirthDate}. Using current date as fallback.`);
            birthDateTimestamp = Timestamp.now(); // Or handle as an error
          } else {
            birthDateTimestamp = Timestamp.fromDate(new Date(formattedBirthDate));
          }
        } catch (dateError) {
          console.error(`Error converting birthDate string '${formattedBirthDate}' to Date:`, dateError);
          // Handle the error appropriately - maybe throw or use a default
          birthDateTimestamp = Timestamp.now(); 
        }

        // Prepare data for Firestore (replace string date with Timestamp)
        const childDataForFirestore = {
          ...child,
          birthDate: birthDateTimestamp,
        };

        console.log('[child-store] Data being sent to Firestore:', JSON.stringify(childDataForFirestore, null, 2));

        const childRef = doc(db, 'children', child.id);

        return setDoc(childRef, childDataForFirestore)
          .then(() => {
            console.log('[child-store] Firestore write successful for child:', child.id);
            // Update local state ONLY after successful Firestore write
            set((state) => ({
              children: [...state.children, child], // Use original child object with string date for local state
              selectedChildId: child.id,
              isLoading: false, // Reset loading state
            }));
          })
          .catch((error) => {
            console.error('Error adding child to Firestore:', error);
            // Also log the data that failed to write
            console.error('Data that failed:', JSON.stringify(childDataForFirestore, null, 2)); 
            Alert.alert('エラー', 'お子様の情報の保存に失敗しました。');
            set({ isLoading: false, error: 'Failed to save child data' });
            throw error; // Re-throw the error so handleSave can catch it if necessary
          });
      },
      updateChild: (id, updates) => {
        // TODO: Implement Firestore update logic
        set((state) => ({
          children: state.children.map((child) =>
            child.id === id ? { ...child, ...updates } : child
          ),
        }));
      },
      deleteChild: (id) => {
        // TODO: Implement Firestore delete logic
        set((state) => {
          const newChildren = state.children.filter((child) => child.id !== id);
          return {
            children: newChildren,
            selectedChildId:
              state.selectedChildId === id
                ? newChildren.length > 0
                  ? newChildren[0].id
                  : null
                : state.selectedChildId,
          };
        });
      },
      selectChild: (id) => {
        set({ selectedChildId: id });
      },
      getSelectedChild: () => {
        const { children, selectedChildId } = get();
        return children.find((child) => child.id === selectedChildId);
      },
    }),
    {
      name: 'child-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);