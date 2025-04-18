import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { emptyUser } from '@/mocks/data';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For now, we'll simulate a login with a delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a production app, this would validate against a backend
          // For demo purposes, we'll accept any non-empty credentials
          if (email && password) {
            // Check if there's a persisted user with this email
            // In a real app, this would be handled by the backend
            const persistedState = JSON.parse(
              await AsyncStorage.getItem('auth-storage') || '{}'
            );
            
            if (persistedState?.state?.user?.email === email) {
              set({ 
                user: persistedState.state.user, 
                isAuthenticated: true, 
                isLoading: false 
              });
            } else {
              // Create a new user if no persisted user found
              const newUser: User = {
                ...emptyUser,
                id: Date.now().toString(),
                email,
                name: email.split('@')[0], // Temporary name from email
                phone: '',
              };
              set({ user: newUser, isAuthenticated: true, isLoading: false });
            }
          } else {
            set({ error: 'メールアドレスとパスワードを入力してください', isLoading: false });
          }
        } catch (error) {
          set({ error: 'ログインに失敗しました。もう一度お試しください。', isLoading: false });
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      register: async (name, email, password, phone) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Create a new user
          const newUser: User = {
            ...emptyUser,
            id: Date.now().toString(),
            name,
            email,
            phone,
          };
          
          set({ user: newUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ error: '登録に失敗しました。もう一度お試しください。', isLoading: false });
        }
      },
      updateUserProfile: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('ユーザーが見つかりません');
          }
          
          // Update user data
          const updatedUser: User = {
            ...currentUser,
            ...userData,
          };
          
          set({ user: updatedUser, isLoading: false });
          return;
        } catch (error) {
          set({ error: 'プロフィールの更新に失敗しました。もう一度お試しください。', isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);