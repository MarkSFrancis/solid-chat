import { ChatCreatedMessage } from 'api-types';
import { Accessor } from 'solid-js';
import { useSocket } from '~/api/socket-provider';

export function useChatName(chat: Accessor<ChatCreatedMessage>) {
  const socket = useSocket();

  const chatDetail = chat().detail;

  if (chatDetail.name) return chatDetail.name;

  const allUsers = socket.messages.filter(
    (msg) => msg.detailType === 'user-created'
  );
  const memberNames = chatDetail.memberIds.map((id) => {
    const user = allUsers.find((msg) => msg.detail.userId === id);
    return user ? user.detail.username : undefined;
  });

  return memberNames.filter((n) => !!n).join(', ') || 'Chat';
}
