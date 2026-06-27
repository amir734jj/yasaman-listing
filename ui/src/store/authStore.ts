import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../api/generated/Api';
import { Roles } from '../constants/roles';

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  roles: string[];
  setAuth: (auth: AuthResponse) => void;
  setDisplayName: (displayName: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      email: null,
      displayName: null,
      roles: [],
      setAuth: (auth) =>
        set({
          token: auth.token ?? null,
          userId: auth.userId ?? null,
          email: auth.email ?? null,
          displayName: auth.displayName ?? null,
          roles: auth.roles ?? [],
        }),
      setDisplayName: (displayName) => set({ displayName }),
      logout: () =>
        set({ token: null, userId: null, email: null, displayName: null, roles: [] }),
      isAuthenticated: () => !!get().token,
      isAdmin: () => get().roles.includes(Roles.Admin),
    }),
    { name: 'yasaman-auth' },
  ),
);
