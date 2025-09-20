import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Unit = 'C' | 'F';

interface UnitState {
  unit: Unit;
  setUnit: (unit: Unit) => void;
  loadUnit: () => Promise<void>;
}

export const useUnitStore = create<UnitState>((set) => ({
  unit: 'C',
  setUnit: (unit) => {
    set({ unit });
    AsyncStorage.setItem('unit', unit);
  },
  loadUnit: async () => {
    const stored = await AsyncStorage.getItem('unit');
    if (stored === 'C' || stored === 'F') set({ unit: stored });
  },
}));