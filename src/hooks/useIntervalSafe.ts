/**
 * ⏰ Safe Interval Hook
 * Utility hook para gerenciar intervals com cleanup adequado
 * Previne memory leaks e race conditions
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseIntervalSafeOptions {
  delay: number;
  immediate?: boolean;
  enabled?: boolean;
}

export function useIntervalSafe(
  callback: () => void | Promise<void>,
  options: UseIntervalSafeOptions
) {
  const { delay, immediate = false, enabled = true } = options;
  
  // Refs para evitar race conditions
  const savedCallback = useRef<() => void | Promise<void>>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const isRunningRef = useRef(false);

  // Salvar callback mais recente
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Função para executar callback de forma segura
  const executeCallback = useCallback(async () => {
    if (!isMountedRef.current || isRunningRef.current) return;
    
    try {
      isRunningRef.current = true;
      await savedCallback.current?.();
    } catch (error) {
      console.error('Error in interval callback:', error);
    } finally {
      if (isMountedRef.current) {
        isRunningRef.current = false;
      }
    }
  }, []);

  // Função para iniciar interval
  const start = useCallback(() => {
    if (!isMountedRef.current || intervalRef.current) return;

    if (immediate) {
      executeCallback();
    }

    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        executeCallback();
      }
    }, delay);
  }, [delay, immediate, executeCallback]);

  // Função para parar interval
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isRunningRef.current = false;
  }, []);

  // Função para reiniciar interval
  const restart = useCallback(() => {
    stop();
    if (enabled && isMountedRef.current) {
      start();
    }
  }, [enabled, start, stop]);

  // Effect para gerenciar interval baseado em enabled
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }

    return () => {
      stop();
    };
  }, [enabled, start, stop]);

  // Effect para cleanup final
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stop();
    };
  }, [stop]);

  return {
    start,
    stop,
    restart,
    isRunning: () => intervalRef.current !== null
  };
}

/**
 * Hook para timeout seguro
 */
export function useTimeoutSafe(
  callback: () => void | Promise<void>,
  delay: number,
  enabled: boolean = true
) {
  const savedCallback = useRef<() => void | Promise<void>>();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Salvar callback mais recente
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Função para executar callback de forma segura
  const executeCallback = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      await savedCallback.current?.();
    } catch (error) {
      console.error('Error in timeout callback:', error);
    }
  }, []);

  // Função para iniciar timeout
  const start = useCallback(() => {
    if (!isMountedRef.current || timeoutRef.current) return;

    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        executeCallback();
        timeoutRef.current = null;
      }
    }, delay);
  }, [delay, executeCallback]);

  // Função para cancelar timeout
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Função para reiniciar timeout
  const restart = useCallback(() => {
    cancel();
    if (enabled && isMountedRef.current) {
      start();
    }
  }, [enabled, start, cancel]);

  // Effect para gerenciar timeout baseado em enabled
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      cancel();
    }

    return () => {
      cancel();
    };
  }, [enabled, start, cancel]);

  // Effect para cleanup final
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cancel();
    };
  }, [cancel]);

  return {
    start,
    cancel,
    restart,
    isActive: () => timeoutRef.current !== null
  };
}

/**
 * Hook para debounce seguro
 */
export function useDebounceSafe<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (!isMountedRef.current) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          callback(...args);
          timeoutRef.current = null;
        }
      }, delay);
    },
    [callback, delay, ...deps]
  ) as T;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook para throttle seguro
 */
export function useThrottleSafe<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const lastRunRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (!isMountedRef.current) return;

      const now = Date.now();
      
      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            lastRunRef.current = Date.now();
            callback(...args);
            timeoutRef.current = null;
          }
        }, delay - (now - lastRunRef.current));
      }
    },
    [callback, delay, ...deps]
  ) as T;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

export default useIntervalSafe;