import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface GammaRelayState {
  temperature: number;
  brightness: number;
}

export function useGammaRelay() {
  const [state, setState] = useState<GammaRelayState>({
    temperature: 6500,
    brightness: 1.0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current state
  const fetchState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentState = await invoke<GammaRelayState>('get_gamma_state');
      setState(currentState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gamma state');
      console.error('Error fetching gamma state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set temperature
  const setTemperature = useCallback(async (temperature: number) => {
    try {
      setError(null);
      await invoke('set_temperature', { temperature });
      setState(prev => ({ ...prev, temperature }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set temperature');
      console.error('Error setting temperature:', err);
    }
  }, []);

  // Set brightness
  const setBrightness = useCallback(async (brightness: number) => {
    try {
      setError(null);
      await invoke('set_brightness', { brightness });
      setState(prev => ({ ...prev, brightness }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set brightness');
      console.error('Error setting brightness:', err);
    }
  }, []);

  // Set both temperature and brightness
  const setGammaState = useCallback(async (newState: GammaRelayState) => {
    try {
      setError(null);
      await invoke('set_gamma_state', { state: newState });
      setState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set gamma state');
      console.error('Error setting gamma state:', err);
    }
  }, []);

  // Fetch initial state on mount
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Poll for changes every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [fetchState]);

  return {
    state,
    loading,
    error,
    setTemperature,
    setBrightness,
    setGammaState,
    refresh: fetchState,
  };
} 