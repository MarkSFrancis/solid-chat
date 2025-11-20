import HouseIcon from 'lucide-solid/icons/house';
import { SideNavLinkContent } from './side-nav-link';
import { createMemo, For } from 'solid-js';
import { Link } from '@tanstack/solid-router';
import { useSocket } from '~/api/socket-provider';
import { useChatName } from '../chat/chat-name';
import { Button } from '~/ui/button';
import { useAuth } from '~/api/auth-provider';

export function SideNavigation() {
  const socket = useSocket();
  const auth = useAuth();
  const chats = createMemo(() => {
    return socket.messages.filter((msg) => msg.detailType === 'chat-created');
  });

  return (
    <nav class="h-screen self-stretch border-r w-54">
      <div class="p-4">
        <Button class="w-full" variant="secondary" onClick={() => auth.signOut()}>
          Sign out
        </Button>
      </div>
      <hr />
      <div class="p-4 flex flex-col gap-2">
        <Link to="/">
          {({ isActive }) => (
            <SideNavLinkContent icon={HouseIcon} isActive={isActive}>
              Home
            </SideNavLinkContent>
          )}
        </Link>
        <h3 class="text-secondary-foreground pt-4">Chats</h3>
        <For each={chats()}>
          {(chat) => (
            <Link to="/chats/$id" params={{ id: chat.detail.id }}>
              {({ isActive }) => (
                <SideNavLinkContent isActive={isActive}>
                  {useChatName(() => chat)}
                </SideNavLinkContent>
              )}
            </Link>
          )}
        </For>
      </div>
    </nav>
  );
}
