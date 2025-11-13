import { UseQueryResult } from '@tanstack/solid-query';
import {
  Accessor,
  createSignal,
  ErrorBoundary,
  JSX,
  ParentProps,
} from 'solid-js';

export interface AsyncErrorBoundaryFallbackProps {
  error: unknown;
  reset: () => void;
  isResetting: Accessor<boolean>;
}

export type AsyncErrorBoundaryProps = ParentProps<{
  fallback: (props: AsyncErrorBoundaryFallbackProps) => JSX.Element;
  queries: UseQueryResult[];
}>;

export function AsyncErrorBoundary(props: AsyncErrorBoundaryProps) {
  const [isResetting, setResetting] = createSignal(false);

  function handleReset(reset: () => void) {
    setResetting(true);
    const failedQueries = props.queries.filter((q) => q.isError);

    Promise.all(failedQueries.map((q) => q.refetch()))
      .then(() => {
        reset();
      })
      .catch((err: unknown) => {
        console.error('Error during reset:', err);
      })
      .finally(() => setResetting(false));
  }

  return (
    <ErrorBoundary
      fallback={(error, reset) =>
        props.fallback({
          error,
          isResetting,
          reset: () => {
            handleReset(reset);
          },
        })
      }
    >
      {props.children}
    </ErrorBoundary>
  );
}
