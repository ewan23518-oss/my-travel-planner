import { create } from 'zustand';

interface AppState {
  // Define your store's state here
  // For now, it's just a placeholder
  dummyValue: string;
  setDummyValue: (value: string) => void;
}

export const useStore = create<AppState>((set) => ({
  dummyValue: 'Hello from store!',
  setDummyValue: (value) => set({ dummyValue: value }),
}));
