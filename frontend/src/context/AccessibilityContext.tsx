import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

/**
 * Interface for Accessibility State
 */
interface AccessibilityState {
  signLanguageEnabled: boolean;
  captionsEnabled: boolean;
  speechAssistEnabled: boolean;
  highContrastEnabled: boolean;
  largeTextEnabled: boolean;
}

/**
 * Interface for Context Value
 */
interface AccessibilityContextValue extends AccessibilityState {
  toggleSignLanguage: () => void;
  toggleCaptions: () => void;
  toggleSpeechAssist: () => void;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  updateAccessibility: (updates: Partial<AccessibilityState>) => void;
}

// Local storage key
const STORAGE_KEY = 'learnbridge_accessibility';

// Default values
const defaultState: AccessibilityState = {
  signLanguageEnabled: false,
  captionsEnabled: false,
  speechAssistEnabled: false,
  highContrastEnabled: false,
  largeTextEnabled: false,
};

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

/**
 * Accessibility Provider Component
 */
export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or default
  const [state, setState] = useState<AccessibilityState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultState;
    } catch (error) {
      console.error('Failed to load accessibility settings', error);
      return defaultState;
    }
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    
    // Apply global CSS classes for immediate impact
    const root = document.documentElement;
    
    if (state.highContrastEnabled) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (state.largeTextEnabled) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
  }, [state]);

  const toggleSignLanguage = () => 
    setState(prev => ({ ...prev, signLanguageEnabled: !prev.signLanguageEnabled }));
  
  const toggleCaptions = () => 
    setState(prev => ({ ...prev, captionsEnabled: !prev.captionsEnabled }));
  
  const toggleSpeechAssist = () => 
    setState(prev => ({ ...prev, speechAssistEnabled: !prev.speechAssistEnabled }));
  
  const toggleHighContrast = () => 
    setState(prev => ({ ...prev, highContrastEnabled: !prev.highContrastEnabled }));
  
  const toggleLargeText = () => 
    setState(prev => ({ ...prev, largeTextEnabled: !prev.largeTextEnabled }));

  const updateAccessibility = (updates: Partial<AccessibilityState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const value: AccessibilityContextValue = {
    ...state,
    toggleSignLanguage,
    toggleCaptions,
    toggleSpeechAssist,
    toggleHighContrast,
    toggleLargeText,
    updateAccessibility,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

/**
 * Custom hook to use accessibility context
 */
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
