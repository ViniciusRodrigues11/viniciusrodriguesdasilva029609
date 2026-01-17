import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

/**
 * Hook customizado para consumir Observables RxJS em componentes React
 * Controla a subscrição e limpeza para evitar memory leaks
 *
 * @param observable$ - O Observable a ser consumido
 * @param initialValue - Valor inicial enquanto o Observable não emite
 * @returns O valor atual emitido pelo Observable
 */
export function useObservable<T>(observable$: Observable<T>, initialValue: T): T {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const subscription = observable$.subscribe((newValue) => {
      setValue(newValue);
    });

    // Cleanup: desinscreve ao desmontar ou quando observable muda
    return () => {
      subscription.unsubscribe();
    };
  }, [observable$]);

  return value;
}
