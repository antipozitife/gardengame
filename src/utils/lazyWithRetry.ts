import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

// React.lazy itself uses `any` for the component props constraint.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LazyComponent = ComponentType<any>;

type ComponentModule<T extends LazyComponent> = {
  default: T;
};

const isChunkLoadError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  return error.name === 'ChunkLoadError' || /Loading chunk .+ failed/i.test(error.message);
};

export const lazyWithRetry = <T extends LazyComponent>(
  name: string,
  importer: () => Promise<ComponentModule<T>>
): LazyExoticComponent<T> =>
  lazy(async () => {
    const retryKey = `garden-lazy-retry:${name}`;

    try {
      const module = await importer();
      sessionStorage.removeItem(retryKey);
      return module;
    } catch (error) {
      if (isChunkLoadError(error) && sessionStorage.getItem(retryKey) !== '1') {
        sessionStorage.setItem(retryKey, '1');
        window.location.reload();

        return new Promise<ComponentModule<T>>(() => undefined);
      }

      sessionStorage.removeItem(retryKey);
      throw error;
    }
  });
