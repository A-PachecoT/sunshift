import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { useGammaStore } from '../stores/gammaStore';
import { useUIStore } from '../stores/uiStore';

export function useTrayEvents() {
  const { applyPreset, state } = useGammaStore();
  const { setQuickControlVisible } = useUIStore();
  
  useEffect(() => {
    // Listen for preset apply events from tray
    const unlistenPreset = listen<string>('apply_preset', (event) => {
      applyPreset(event.payload);
    });
    
    // Listen for quick control toggle
    const unlistenQuickControl = listen('toggle_quick_control', () => {
      setQuickControlVisible(true);
    });
    
    // Cleanup listeners
    return () => {
      unlistenPreset.then(fn => fn());
      unlistenQuickControl.then(fn => fn());
    };
  }, [applyPreset, setQuickControlVisible]);
  
  // Update tray icon when temperature changes
  useEffect(() => {
    invoke('update_tray_icon', { temperature: state.temperature }).catch(console.error);
  }, [state.temperature]);
} 