import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface GammaRelayState {
  temperature: number;
  brightness: number;
}

export interface PresetState {
  id: string;
  name: string;
  temperature: number;
  brightness: number;
}

interface GammaStore {
  // Current state
  state: GammaRelayState;
  loading: boolean;
  error: string | null;
  connected: boolean;
  
  // Presets
  presets: PresetState[];
  activePreset: string | null;
  
  // UI state
  autoMode: boolean;
  lastManualChange: Date | null;
  
  // Actions
  fetchState: () => Promise<void>;
  setTemperature: (temperature: number) => Promise<void>;
  setBrightness: (brightness: number) => Promise<void>;
  setGammaState: (state: GammaRelayState) => Promise<void>;
  applyPreset: (presetId: string) => Promise<void>;
  addPreset: (preset: Omit<PresetState, 'id'>) => void;
  removePreset: (id: string) => void;
  setAutoMode: (enabled: boolean) => void;
  clearError: () => void;
}

export const useGammaStore = create<GammaStore>((set, get) => ({
  // Initial state
  state: {
    temperature: 6500,
    brightness: 1.0,
  },
  loading: false,
  error: null,
  connected: false,
  
  // Built-in presets
  presets: [
    { id: 'day', name: 'Day', temperature: 6500, brightness: 1.0 },
    { id: 'evening', name: 'Evening', temperature: 4500, brightness: 0.8 },
    { id: 'night', name: 'Night', temperature: 3000, brightness: 0.6 },
    { id: 'reading', name: 'Reading', temperature: 5000, brightness: 0.9 },
    { id: 'movie', name: 'Movie', temperature: 3500, brightness: 0.7 },
  ],
  activePreset: null,
  
  autoMode: true,
  lastManualChange: null,
  
  // Actions
  fetchState: async () => {
    set({ loading: true, error: null });
    try {
      const currentState = await invoke<GammaRelayState>('get_gamma_state');
      set({ 
        state: currentState, 
        loading: false, 
        connected: true,
        error: null 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch gamma state';
      set({ 
        loading: false, 
        connected: false,
        error: errorMessage 
      });
    }
  },

  setTemperature: async (temperature: number) => {
    const { state } = get();
    set({ error: null, lastManualChange: new Date(), activePreset: null });
    
    try {
      await invoke('set_temperature', { temperature });
      set({ 
        state: { ...state, temperature },
        connected: true 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set temperature';
      set({ error: errorMessage, connected: false });
    }
  },

  setBrightness: async (brightness: number) => {
    const { state } = get();
    set({ error: null, lastManualChange: new Date(), activePreset: null });
    
    try {
      await invoke('set_brightness', { brightness });
      set({ 
        state: { ...state, brightness },
        connected: true 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set brightness';
      set({ error: errorMessage, connected: false });
    }
  },

  setGammaState: async (newState: GammaRelayState) => {
    set({ error: null, lastManualChange: new Date(), activePreset: null });
    
    try {
      await invoke('set_gamma_state', { state: newState });
      set({ 
        state: newState,
        connected: true 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set gamma state';
      set({ error: errorMessage, connected: false });
    }
  },

  applyPreset: async (presetId: string) => {
    const { presets } = get();
    const preset = presets.find(p => p.id === presetId);
    
    if (!preset) {
      set({ error: 'Preset not found' });
      return;
    }

    set({ error: null, lastManualChange: new Date() });
    
    try {
      const newState = {
        temperature: preset.temperature,
        brightness: preset.brightness,
      };
      
      await invoke('set_gamma_state', { state: newState });
      set({ 
        state: newState,
        activePreset: presetId,
        connected: true 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply preset';
      set({ error: errorMessage, connected: false });
    }
  },

  addPreset: (preset: Omit<PresetState, 'id'>) => {
    const { presets } = get();
    const id = Date.now().toString();
    set({
      presets: [...presets, { ...preset, id }],
    });
  },

  removePreset: (id: string) => {
    const { presets, activePreset } = get();
    set({
      presets: presets.filter(p => p.id !== id),
      activePreset: activePreset === id ? null : activePreset,
    });
  },

  setAutoMode: (enabled: boolean) => {
    set({ autoMode: enabled });
  },

  clearError: () => {
    set({ error: null });
  },
})); 