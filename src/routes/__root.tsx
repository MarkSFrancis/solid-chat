import { useQueryClient } from '@tanstack/solid-query';
import { createRootRoute, Outlet } from '@tanstack/solid-router';
import { ErrorBoundary, ParentProps } from 'solid-js';
import { AuthProvider } from '~/api/auth-provider';
import { QueryProvider } from '~/api/query-provider';
import { SocketProvider } from '~/api/socket-provider';
import { DashboardLayout } from '~/features/layout/dashboard-layout';
import { ErrorDisplay } from '~/ui/error-display';
import { RetryButton } from '~/ui/retry-button';

export const Route = createRootRoute({
  component: () => (
    <QueryProvider>
      <AppErrorBoundary>
        <AuthProvider>
          <SocketProvider>
            <DashboardLayout>
              <Outlet />
            </DashboardLayout>
          </SocketProvider>
        </AuthProvider>
      </AppErrorBoundary>
    </QueryProvider>
  ),
});

function AppErrorBoundary(props: ParentProps) {
  const queryClient = useQueryClient();

  return (
    <ErrorBoundary
      fallback={(error, reset) => {
        queryClient.clear();
        return (
          <div class="p-4">
            <ErrorDisplay error={error as unknown}>
              An unrecognised error occurred
            </ErrorDisplay>
            <RetryButton
              onClick={() => {
                queryClient.clear();
                reset();
              }}
            />
          </div>
        );
      }}
    >
      {props.children}
    </ErrorBoundary>
  );
}
