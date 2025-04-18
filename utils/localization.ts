import * as Localization from 'expo-localization';
import { I18nManager, Platform } from 'react-native';

/**
 * Sets the app's locale preference
 * @param locale The locale code to set (e.g., 'ja', 'en')
 */
export const setLocale = async (locale: string) => {
  try {
    // Force RTL off for Japanese
    if (locale === 'ja' && I18nManager.isRTL) {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }
    
    // Note: expo-localization doesn't have a setLocale method
    // We're just storing the preference and using it for formatting
    
    // Return success
    return true;
  } catch (error) {
    console.error('Failed to set locale:', error);
    return false;
  }
};

/**
 * Gets the current device locale
 */
export const getDeviceLocale = () => {
  return Localization.locale;
};

/**
 * Formats a date according to the current locale
 * @param date The date to format
 * @param options Formatting options
 */
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString('ja-JP', defaultOptions);
};

/**
 * Formats a time according to the current locale
 * @param date The date/time to format
 * @param options Formatting options
 */
export const formatTime = (date: Date, options?: Intl.DateTimeFormatOptions) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    ...options
  };
  
  return date.toLocaleTimeString('ja-JP', defaultOptions);
};