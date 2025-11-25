/**
 * Environment configuration
 * Separated to make testing easier
 */

// Use a function to safely access import.meta in non-module contexts
export const getEnvVar = (key: string, defaultValue: string): string => {
  try {
    // @ts-ignore - import.meta may not be available in test environment
    return import.meta?.env?.[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

export const API_URL = getEnvVar("VITE_API_URL", "http://localhost:5000");
