import React, { createContext, useContext, useState, useEffect } from 'react';


/**
 * Interface for Accessibility State
 */








/**
 * Interface for Context Value
 */









// Local storage key
const STORAGE_KEY = 'learnbridge_accessibility';

// Default values
const defaultState = {
  signLanguageEnabled: false,
  captionsEnabled: false,
  speechAssistEnabled: false,
  highContrastEnabled: false,
  largeTextEnabled: false
};

const AccessibilityContext = createContext(undefined);

/**
 * Accessibility Provider Component
 */
export const AccessibilityProvider = ({ children }) => {
  // Initialize state from localStorage or default
  const [state, setState] = useState(() => {
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
  setState((prev) => ({ ...prev, signLanguageEnabled: !prev.signLanguageEnabled }));

  const toggleCaptions = () =>
  setState((prev) => ({ ...prev, captionsEnabled: !prev.captionsEnabled }));

  const toggleSpeechAssist = () =>
  setState((prev) => ({ ...prev, speechAssistEnabled: !prev.speechAssistEnabled }));

  const toggleHighContrast = () =>
  setState((prev) => ({ ...prev, highContrastEnabled: !prev.highContrastEnabled }));

  const toggleLargeText = () =>
  setState((prev) => ({ ...prev, largeTextEnabled: !prev.largeTextEnabled }));

  const updateAccessibility = (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const value = {
    ...state,
    toggleSignLanguage,
    toggleCaptions,
    toggleSpeechAssist,
    toggleHighContrast,
    toggleLargeText,
    updateAccessibility
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>);

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