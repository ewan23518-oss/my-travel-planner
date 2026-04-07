import { create } from 'zustand';

export const useTravelStore = create<any>((set) => ({
  tripResult: null,
  setTripResult: (result: any) => set({ tripResult: result }),
}));

export const useStore = create<any>((set) => ({
  dummyValue: 'Hello from store!',
  setDummyValue: (value: any) => set({ dummyValue: value }),
}));
