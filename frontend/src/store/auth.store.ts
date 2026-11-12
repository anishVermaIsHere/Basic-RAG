import type { User } from "@/features/user/types"
import { create } from "zustand"
import { getSelf, authLogout } from "@/services/apis/api"


export type AuthStoreType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setLoading: (val: boolean) => void;
  setUser: (user: User | null) => void;
  logOut: () => Promise<void>;
  init: () => Promise<void>;
};


const useAuthStore = create<AuthStoreType>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: true,
  setLoading: (val) => set({ isLoading: val }),
  setUser: (user) => set({ user, isAuthenticated: user?.id ? true : false }),
  logOut: async () => { 
    const res = await authLogout();
    if(res?.data?.success){
      set({ user: null, isAuthenticated: false })
    }
  },
  init: async () => {
    if (get().isInitialized) return;

    set({ isInitialized: true });
    try {
      const response = await getSelf();
      const user = response?.data?.user;
      set({
        user: { ...user, firstName: user.first_name, lastName: user.last_name, fullName: user.full_name },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Auth initialization failed:", error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false
      });
    }
  },
}));

export default useAuthStore;