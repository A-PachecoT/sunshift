import { create } from 'zustand';

export type ThemeMode = 'auto' | 'light' | 'dark';
export type ActiveTab = 'overview' | 'schedule' | 'settings';

interface UIStore {
  // Window state
  isMainWindowVisible: boolean;
  isQuickControlVisible: boolean;
  windowPosition: { x: number; y: number } | null;
  
  // Navigation
  activeTab: ActiveTab;
  
  // Theme
  themeMode: ThemeMode;
  currentTheme: 'light' | 'dark';
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
  }>;
  
  // Loading states
  loadingStates: Record<string, boolean>;
  
  // Actions
  setMainWindowVisible: (visible: boolean) => void;
  setQuickControlVisible: (visible: boolean) => void;
  setWindowPosition: (position: { x: number; y: number }) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setCurrentTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<UIStore['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (key: string, loading: boolean) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  isMainWindowVisible: true,
  isQuickControlVisible: false,
  windowPosition: null,
  activeTab: 'overview',
  themeMode: 'auto',
  currentTheme: 'dark',
  notifications: [],
  loadingStates: {},
  
  // Actions
  setMainWindowVisible: (visible: boolean) => {
    set({ isMainWindowVisible: visible });
  },

  setQuickControlVisible: (visible: boolean) => {
    set({ isQuickControlVisible: visible });
  },

  setWindowPosition: (position: { x: number; y: number }) => {
    set({ windowPosition: position });
  },

  setActiveTab: (tab: ActiveTab) => {
    set({ activeTab: tab });
  },

  setThemeMode: (mode: ThemeMode) => {
    set({ themeMode: mode });
    
    // Auto-determine theme based on temperature if mode is 'auto'
    if (mode === 'auto') {
      // This will be updated based on gamma state changes
      // For now, default to dark theme
      set({ currentTheme: 'dark' });
    }
  },

  setCurrentTheme: (theme: 'light' | 'dark') => {
    set({ currentTheme: theme });
  },

  addNotification: (notification) => {
    const { notifications } = get();
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    set({
      notifications: [newNotification, ...notifications].slice(0, 10), // Keep only last 10
    });
    
    // Auto-remove after 5 seconds for info/success, 10 seconds for warning/error
    const timeout = notification.type === 'info' || notification.type === 'success' ? 5000 : 10000;
    setTimeout(() => {
      get().removeNotification(newNotification.id);
    }, timeout);
  },

  removeNotification: (id: string) => {
    const { notifications } = get();
    set({
      notifications: notifications.filter(n => n.id !== id),
    });
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setLoading: (key: string, loading: boolean) => {
    const { loadingStates } = get();
    set({
      loadingStates: {
        ...loadingStates,
        [key]: loading,
      },
    });
  },
})); 