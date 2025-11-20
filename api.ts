import type {
  ApiMessage,
  ApiMessageDetailType,
  ChatMessageSentMessage,
} from './api-types';
import WebSocket, { WebSocketServer } from 'ws';

const port = parseInt(process.env.PORT ?? '8080', 10);

const socketServer = new WebSocketServer({
  port,
  path: '/api/ws',
});

type ApiMessageData<TDetailType extends ApiMessageDetailType> = Pick<
  Extract<ApiMessage, { detailType: TDetailType }>,
  'detailType' | 'detail'
>;

function toWebSocketMessage<TDetailType extends ApiMessageDetailType>(
  params: ApiMessageData<TDetailType>
): ApiMessage {
  return {
    version: '0',
    id: crypto.randomUUID(),
    createdOn: new Date().toISOString(),
    detailType: params.detailType,
    detail: params.detail,
  } as ApiMessage;
}

function sendMessages<TDetailType extends ApiMessageDetailType>(params: {
  destination: WebSocket | Iterable<WebSocket>;
  messages: ApiMessageData<TDetailType>[];
}) {
  const messages = params.messages.map((m) =>
    toWebSocketMessage({
      detailType: m.detailType,
      detail: m.detail,
    })
  );
  const destinations = Array.isArray(params.destination)
    ? params.destination
    : [params.destination];

  destinations.forEach((d) => d.send(JSON.stringify(messages)));
}

function broadcastMessages<TDetailType extends ApiMessageDetailType>(
  messages: ApiMessageData<TDetailType>[]
) {
  sendMessages({
    destination: [...socketServer.clients].filter(
      (c) => c.readyState === WebSocket.OPEN
    ),
    messages,
  });
}

socketServer.on('connection', (socket, req) => {
  const clientId = req.headers['sec-websocket-key'];
  console.log('Client connected', clientId);

  const seedMessages: ApiMessageData<ApiMessageDetailType>[] = [];
  for (const user of database.users) {
    seedMessages.push({
      detailType: 'user-created',
      detail: {
        userId: user.id,
        username: user.username,
      },
    });
  }
  for (const chat of database.chats) {
    seedMessages.push({
      detailType: 'chat-created',
      detail: {
        id: chat.id,
        name: chat.name,
        memberIds: chat.memberIds,
      },
    });

    for (const message of chat.messages) {
      seedMessages.push({
        detailType: 'chat-message-sent',
        detail: {
          id: message.id,
          chatId: chat.id,
          createdOn: message.createdOn,
          authorId: message.authorId,
          content: message.content,
        },
      });
    }
  }

  sendMessages({
    destination: socket,
    messages: seedMessages,
  });

  socket.on('message', (data) => {
    const messages = JSON.parse(data.toString()) as ChatMessageSentMessage[];

    console.dir(messages, { depth: null });
    const messagesToBroadcast: ApiMessageData<'chat-message-sent'>[] = [];

    for (const message of messages) {
      const chat = database.chats.find((c) => c.id === message.detail.chatId);
      if (!chat) {
        console.warn(`Chat with ID ${message.detail.chatId} not found`);
        return;
      }

      chat.messages.push({
        id: message.detail.id,
        createdOn: message.detail.createdOn,
        authorId: message.detail.authorId,
        content: message.detail.content,
      });
      messagesToBroadcast.push({
        detailType: 'chat-message-sent',
        detail: message.detail,
      });
    }

    broadcastMessages(messagesToBroadcast);
  });
});

console.log(`WebSocket server is running on ws://localhost:${port}/api/ws`);

const database = {
  users: [
    {
      id: 'user-1',
      username: 'Alice',
    },
    {
      id: 'user-2',
      username: 'Bob',
    },
  ] as { id: string; username: string }[],
  chats: [
    {
      id: 'chat-1',
      name: 'General',
      memberIds: ['user-1', 'user-2'],
      messages: [
        {
          id: 'msg-1',
          createdOn: new Date().toISOString(),
          content: 'Hello, Bob!',
          authorId: 'user-1',
        },
        {
          id: 'msg-2',
          createdOn: new Date().toISOString(),
          content: 'Hi, Alice! How are you?',
          authorId: 'user-2',
        },
      ],
    },
    {
      id: 'chat-2',
      memberIds: ['user-1'],
      messages: [
        {
          id: 'msg-3',
          createdOn: new Date().toISOString(),
          content: 'Hi!',
          authorId: 'user-1',
        },
      ],
    },
  ] as {
    id: string;
    name?: string;
    memberIds: string[];
    messages: {
      id: string;
      createdOn: string;
      authorId: string;
      content: string;
    }[];
  }[],
};
