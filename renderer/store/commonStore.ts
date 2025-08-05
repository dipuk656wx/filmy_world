import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CommonStore {
    authToken: string | null;
    setauthToken: (authToken: string) => void;
    clearauthToken: () => void;
    user: User | null;
    logout: () => void;
    setUser: (user: User) => void;
    clearUser: () => void;
    baseUrl: string;
    showSubscriptionPopup: boolean;
    setShowSubscriptionPopup: (show: boolean) => void;
    showMultiLoginPopup: boolean;
    setShowMultiLoginPopup: (show: boolean) => void;
    remainingBalance: number;
    setremainingBalance: (balance: number) => void;
}
export type User = {
    username: string;
    password: string;
    email: string;
    balance?: number;
    createdAt?: Date;
};

export const useCommonStore = create<CommonStore>()(
    persist(
        (set) => ({
            authToken: null,
            setauthToken: (authToken) => set({ authToken }),
            clearauthToken: () => set({ authToken: null }),
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
            baseUrl: 'http://172.233.155.175:5000',
            logout: () => {
                set({ authToken: null, user: null });
            },
            showSubscriptionPopup: false,
            setShowSubscriptionPopup: (show) => set({ showSubscriptionPopup: show }),
            setShowMultiLoginPopup: (show) => set({ showMultiLoginPopup: show }),
            showMultiLoginPopup: false,
            remainingBalance: 0,
            setremainingBalance: (balance) => set({ remainingBalance: balance }),

        }),
        {
            name: 'common-store', // key in localStorage
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ authToken: state.authToken, user: state.user, baseUrl: state.baseUrl }),

        }
    )
);