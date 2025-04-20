import { create } from 'zustand';
import { User as FirebaseUser, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '@/src/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from '@/types';
import { emptyUser } from '@/mocks/data';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  _setFirebaseUser: (firebaseUser: FirebaseUser | null) => void;
  _fetchUserData: (uid: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    set({ isLoading: true });
    if (firebaseUser) {
      set({ firebaseUser, isAuthenticated: true, isLoading: false, error: null });
      await get()._fetchUserData(firebaseUser.uid);
    } else {
      set({ user: null, firebaseUser: null, isAuthenticated: false, isLoading: false, error: null });
    }
  });

  return {
    user: null,
    firebaseUser: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    _setFirebaseUser: (firebaseUser) => {
      set({ firebaseUser });
    },

    _fetchUserData: async (uid) => {
      try {
        const userDocRef = doc(db, 'parents', uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          set({ user: userDocSnap.data() as User, isLoading: false });
        } else {
          console.warn(`User document not found in Firestore for UID: ${uid}`);
          const basicUser: User = {
            ...emptyUser,
            id: uid,
            email: get().firebaseUser?.email || '',
            name: get().firebaseUser?.displayName || '',
            phoneNumber: '', // Add default phoneNumber to conform to User type
            address: '',     // Add default address to conform to User type
          };
          set({ user: basicUser, isLoading: false });
        }
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
        set({ error: 'ユーザーデータの取得に失敗しました。', isLoading: false });
      }
    },

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        console.error("Login error:", error);
        let errorMessage = 'ログインに失敗しました。メールアドレスまたはパスワードを確認してください。';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = 'メールアドレスまたはパスワードが間違っています。';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = '有効なメールアドレスを入力してください。';
        }
        set({ error: errorMessage, isLoading: false });
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Logout error:", error);
        set({ error: 'ログアウトに失敗しました。', isLoading: false });
      }
    },

    register: async (name, email, password, phone) => {
      set({ isLoading: true, error: null });
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        const newUser: User = {
          id: firebaseUser.uid,
          name,
          email,
          phoneNumber: phone,
          address: '',
        };

        const userDocRef = doc(db, 'parents', firebaseUser.uid);
        await setDoc(userDocRef, newUser);

        set({ user: newUser });
      } catch (error: any) {
        console.error("Registration error:", error);
        let errorMessage = '登録に失敗しました。もう一度お試しください。';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'このメールアドレスは既に使用されています。';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = '有効なメールアドレスを入力してください。';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'パスワードは6文字以上で入力してください。';
        }
        set({ error: errorMessage, isLoading: false });
      }
    },
  };
});