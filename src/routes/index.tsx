import { createFileRoute } from '@tanstack/solid-router';
import { Chat } from '~/features/chat/chat';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div class="p-4">
      <h1>Hello "/"!</h1>
      <Chat />
    </div>
  );
}
