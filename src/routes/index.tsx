import { createFileRoute } from '@tanstack/solid-router';
import { PageContainer } from '~/ui/page-container';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageContainer class="p-4">
      Welcome to Solid Chat! Select a chat from the side navigation to get
      started.
    </PageContainer>
  );
}
