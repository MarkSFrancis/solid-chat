import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { ParentProps } from 'solid-js';

export const QueryProvider = (props: ParentProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        throwOnError: true,
        ...(import.meta.env.DEV
          ? {
              // Fail faster in dev mode to surface issues more quickly
              retry: false,
              refetchOnMount: false,
              refetchOnWindowFocus: false,
              refetchOnReconnect: false,
            }
          : {}),
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
};
