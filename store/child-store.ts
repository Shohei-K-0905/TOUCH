import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Child } from '@/types';
import { mockChildren } from '@/mocks/data';

interface ChildState {
  children: Child[];
  selectedChildId: string | null;
  isLoading: boolean;
  error: string | null;
  addChild: (child: Omit<Child, 'id'>) => void;
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
        const newChild = {
          ...child,
          id: Date.now().toString(),
        };
        set((state) => ({
          children: [...state.children, newChild],
          selectedChildId: newChild.id,
        }));
      },
      updateChild: (id, updates) => {
        set((state) => ({
          children: state.children.map((child) =>
            child.id === id ? { ...child, ...updates } : child
          ),
        }));
      },
      deleteChild: (id) => {
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