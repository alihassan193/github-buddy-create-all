
import { useEffect, useRef, useCallback } from 'react';

interface UseSmartRefreshOptions {
  refreshFn: () => Promise<void>;
  interval?: number;
  skipWhenDialogsOpen?: boolean;
}

export const useSmartRefresh = ({ 
  refreshFn, 
  interval = 30000, 
  skipWhenDialogsOpen = true 
}: UseSmartRefreshOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshFnRef = useRef(refreshFn);
  const isRefreshingRef = useRef(false);
  const lastRefreshRef = useRef(0);

  // Keep the latest refreshFn in a ref to avoid dependency issues
  useEffect(() => {
    refreshFnRef.current = refreshFn;
  }, [refreshFn]);

  const shouldSkipRefresh = () => {
    // Always skip refresh for now to prevent the loop
    console.log('Smart refresh disabled to prevent API call loops');
    return true;
    
    // Skip if currently refreshing
    if (isRefreshingRef.current) {
      console.log('Skipping refresh - already refreshing');
      return true;
    }
    
    // Skip if last refresh was too recent (within 10 seconds)
    const now = Date.now();
    if (now - lastRefreshRef.current < 10000) {
      console.log('Skipping refresh - too recent');
      return true;
    }
    
    if (!skipWhenDialogsOpen) return false;
    
    // Check for open dialogs, modals, or forms with user input
    const openDialogs = document.querySelectorAll('[role="dialog"]');
    const activeInputs = document.querySelectorAll('input:focus, textarea:focus, select:focus');
    const filledInputs = document.querySelectorAll('input[value]:not([value=""]), textarea:not(:empty)');
    
    if (openDialogs.length > 0 || activeInputs.length > 0 || filledInputs.length > 0) {
      console.log('Skipping refresh - user interaction detected');
      return true;
    }
    
    return false;
  };

  const smartRefresh = useCallback(async () => {
    if (shouldSkipRefresh()) {
      return;
    }
    
    isRefreshingRef.current = true;
    lastRefreshRef.current = Date.now();
    
    try {
      console.log('Smart refresh starting...');
      await refreshFnRef.current();
      console.log('Smart refresh completed');
    } catch (error) {
      console.error('Smart refresh failed:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Disable automatic refresh intervals
    console.log('Smart refresh intervals disabled');
    return;
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set up new interval
    intervalRef.current = setInterval(smartRefresh, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, smartRefresh]);

  const forceRefresh = useCallback(async () => {
    if (isRefreshingRef.current) {
      console.log('Force refresh skipped - already refreshing');
      return;
    }
    
    isRefreshingRef.current = true;
    lastRefreshRef.current = Date.now();
    
    try {
      await refreshFnRef.current();
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  return { forceRefresh };
};
