import { create } from "zustand"
import type { User } from "../types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (name: string, email: string, password: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    // TODO: Implement actual authentication
    set({
      isAuthenticated: true,
      user: {
        id: "1",
        name: "John Doe",
        email: email,
      },
    })
  },
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
  signup: async (name: string, email: string, password: string) => {
    // TODO: Implement actual signup
    set({
      isAuthenticated: true,
      user: {
        id: "1",
        name: name,
        email: email,
      },
    })
  },
}))

