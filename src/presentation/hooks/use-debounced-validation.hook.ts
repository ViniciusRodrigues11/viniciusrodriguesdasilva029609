import { useEffect, useRef, useState } from 'react';

export function useDebouncedValidation(
  value: string,
  validator: (value: string) => string | null,
  delay: number = 300
): string | null {
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!value) {
      return undefined;
    }

    timeoutRef.current = setTimeout(() => {
      const validationError = validator(value);
      setError(validationError);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, validator, delay]);

  return error;
}
