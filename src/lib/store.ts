import { create } from 'zustand';
import { TripInput, TripResult } from './types';

interface TravelStore {
  tripInput: TripInput;
  tripResult: TripResult | null;
  isGenerating: boolean;
  setTripInput: (input: Partial<TripInput>) => void;
  setTripResult: (result: TripResult | null) => void;
  setIsGenerating: (status: boolean) => void;
}

export const useTravelStore = create<TravelStore>((set) => ({
  tripInput: {
    destination: '',
    departure: '',
    startDate: new Date().toISOString().split('T')[0], // 默认今天
    days: 3,
    budget: 'standard',
    companions: 2,
    style: 'relaxed',
    extraNotes: '',
  },
  tripResult: null,
  isGenerating: false,
  setTripInput: (input) => set((state) => ({ tripInput: { ...state.tripInput, ...input } })),
  setTripResult: (result) => set({ tripResult: result }),
  setIsGenerating: (status) => set({ isGenerating: status }),
}));
