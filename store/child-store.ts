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
      addChild: (child) => {
        // Set loading state if needed, or handle async elsewhere
        // Example: set({ isLoading: true, error: null });

        // Generate a unique ID for the child if it doesn't have one
        const childId = child.id || doc(collection(db, 'children')).id; // Use existing ID or generate new one

        // Parse 'YYYYMMDD' string to 'YYYY-MM-DD' before creating Date object
        let formattedBirthDate = child.birthDate; // Default to original if format is unexpected
        if (/^\d{8}$/.test(child.birthDate)) { // Check if it's exactly 8 digits
          formattedBirthDate = `${child.birthDate.substring(0, 4)}-${child.birthDate.substring(4, 6)}-${child.birthDate.substring(6, 8)}`;
        }

        // Attempt to convert formatted birthDate string to Firestore Timestamp
        const birthDateTimestamp = Timestamp.fromDate(new Date(formattedBirthDate));

        // Prepare data for Firestore (replace string date with Timestamp)
        const childDataForFirestore = {
          ...child,
          birthDate: birthDateTimestamp,
        };

        const childRef = doc(db, 'children', child.id);

        setDoc(childRef, childDataForFirestore)
          .then(() => {
            // Update local state ONLY after successful Firestore write
            set((state) => ({
              children: [...state.children, child], // Use original child object with string date for local state
              selectedChildId: child.id,
              isLoading: false, // Reset loading state
            }));
          })
          .catch((error) => {
            console.error('Error adding child to Firestore:', error);
            Alert.alert('エラー', 'お子様の情報の保存に失敗しました。');
            set({ isLoading: false, error: 'Failed to save child data' });
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