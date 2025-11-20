import { createMemo, createSignal, createUniqueId, For, Show } from 'solid-js';
import { useSocket } from '~/api/socket-provider';
import SendIcon from 'lucide-solid/icons/send';
import { Button } from '~/ui/button';
import { ChatMessageSentMessage } from 'api-types';
import { cn } from '~/utils/cn';
import { Avatar } from '../user/avatar';
import { useUser } from '~/api/auth-provider';

export function Chat(props: { id: string }) {
  const user = useUser();
  const socket = useSocket();
  const [message, setMessage] = createSignal('');
  const inputId = createUniqueId();

  const allUsers = createMemo(() => {
    return socket.messages.reduce(
      (acc, msg) => {
        if (msg.detailType === 'user-created') {
          acc[msg.detail.userId] = {
            id: msg.detail.userId,
            username: msg.detail.username,
          };
        }
        return acc;
      },
      {} as Record<string, { id: string; username: string }>
    );
  });

  return (
    <div class="flex flex-col py-4 gap-2">
      <div>
        <For
          each={socket.messages.filter(
            (msg): msg is ChatMessageSentMessage =>
              msg.detailType === 'chat-message-sent' &&
              msg.detail.chatId === props.id
          )}
        >
          {(msg) => {
            const isFromMe = () => msg.detail.authorId === user().userId;
            function authorName() {
              const author = allUsers()[msg.detail.authorId];
              return author
                ? author.username
                : msg.detail.authorId.substring(0, 4);
            }

            return (
              <div class="flex gap-1 py-2 items-end">
                <Show
                  when={isFromMe()}
                  fallback={
                    <>
                      <Avatar class="h-8 w-8" username={authorName()} />
                      <div
                        class={cn(
                          'whitespace-pre-wrap rounded-xl px-2 py-1',
                          'bg-indigo-200'
                        )}
                      >
                        {msg.detail.content}
                      </div>
                    </>
                  }
                >
                  <div class="grow flex justify-end">
                    <div
                      class={cn(
                        'whitespace-pre-wrap rounded-xl px-2 py-1',
                        'bg-gray-200'
                      )}
                    >
                      {msg.detail.content}
                    </div>
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
      <form
        class="flex gap-2 items-end"
        onSubmit={(e) => {
          e.preventDefault();

          const messageValue = message();
          if (messageValue.trim() !== '') {
            const socketEvent = {
              version: '0',
              id: crypto.randomUUID(),
              createdOn: new Date().toISOString(),
              detailType: 'chat-message-sent',
              detail: {
                id: crypto.randomUUID(),
                createdOn: new Date().toISOString(),
                authorId: user().userId,
                chatId: props.id,
                content: messageValue,
              },
            } satisfies ChatMessageSentMessage;
            socket.send(JSON.stringify([socketEvent]));
            setMessage('');
          }
        }}
      >
        <label for={inputId} class="sr-only">
          New message:
        </label>
        <textarea
          id={inputId}
          class="grow border p-1 rounded px-2 field-sizing-content resize-none"
          placeholder="Type your message here..."
          value={message()}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <Button
          variantStyle="icon-only"
          type="submit"
          icon={SendIcon}
          aria-label="Send"
        />
      </form>
    </div>
  );
}
