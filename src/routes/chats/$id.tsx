import { createFileRoute } from '@tanstack/solid-router';
import { ChatCreatedMessage } from 'api-types';
import { createMemo, Show } from 'solid-js';
import { useSocket } from '~/api/socket-provider';
import { Chat } from '~/features/chat/chat';
import { useChatName } from '~/features/chat/chat-name';
import { Button } from '~/ui/button';
import { PageContainer } from '~/ui/page-container';
import InfoIcon from 'lucide-solid/icons/info';

export const Route = createFileRoute('/chats/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  const socket = useSocket();

  const chat = createMemo(() => {
    return socket.messages.find(
      (msg): msg is ChatCreatedMessage =>
        msg.detailType === 'chat-created' && msg.detail.id === params().id
    );
  });

  return (
    <PageContainer class="h-full flex flex-col py-4">
      <Show when={chat()}>
        {(chat) => (
          <div class="flex justify-between items-center">
            <Show when={chat()} fallback={<div>404: Chat not found</div>}>
              {(chat) => (
                <h2 class="text-4xl font-light">{useChatName(chat)}</h2>
              )}
            </Show>
            <Button
              class="h-8 w-8"
              variantStyle="icon-only"
              icon={InfoIcon}
              variant="secondary"
              aria-label="Info"
            />
          </div>
        )}
      </Show>
      <div class="grow flex flex-col justify-end">
        <Chat id={params().id} />
      </div>
    </PageContainer>
  );
}
