import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'therapist' | 'admin';
  is_verified: boolean;
  wellness_profile?: {
    sleep_schedule?: { bedtime: string; wake_time: string };
    stress_level?: number;
    primary_goals?: string[];
    wellness_preferences?: string[];
    onboarding_done?: boolean;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, access: string, refresh: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('manmitra_user') || 'null') : null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('manmitra_access') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('manmitra_refresh') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('manmitra_access') : false,

  setAuth: (user, access, refresh) => {
    localStorage.setItem('manmitra_user', JSON.stringify(user));
    localStorage.setItem('manmitra_access', access);
    localStorage.setItem('manmitra_refresh', refresh);
    set({ user, accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  updateUser: (updatedFields) => {
    set((state) => {
      if (!state.user) return {};
      const newUser = { ...state.user, ...updatedFields };
      localStorage.setItem('manmitra_user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },

  logout: () => {
    localStorage.removeItem('manmitra_user');
    localStorage.removeItem('manmitra_access');
    localStorage.removeItem('manmitra_refresh');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));
