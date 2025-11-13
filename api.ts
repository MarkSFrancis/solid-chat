import WebSocket, { WebSocketServer } from "ws";

const port = parseInt(process.env.PORT ?? "8080", 10);

const socketServer = new WebSocketServer({
  port,
  path: "/api/ws",
});

interface WebSocketMessage<TDetailType extends string, TDetail> {
  version: string;
  id: string;
  createdOn: string;
  detailType: TDetailType;
  detail: TDetail;
}

function toWebSocketMessage<TDetailType extends string, TDetail>(params: {
  detailType: TDetailType;
  detail: TDetail;
}): WebSocketMessage<TDetailType, TDetail> {
  return {
    version: "0",
    id: crypto.randomUUID(),
    createdOn: new Date().toISOString(),
    detailType: params.detailType,
    detail: params.detail,
  };
}

function sendMessage<TDetailType extends string, TDetail>(params: {
  destination: WebSocket | Iterable<WebSocket>;
  detailType: TDetailType;
  detail: TDetail;
}) {
  const message = toWebSocketMessage({
    detailType: params.detailType,
    detail: params.detail,
  });
  const destinations = Array.isArray(params.destination)
    ? params.destination
    : [params.destination];

  destinations.forEach((d) => d.send(JSON.stringify(message)));
}

function broadcastMessage<TDetailType extends string, TDetail>(params: {
  detailType: TDetailType;
  detail: TDetail;
}) {
  sendMessage({
    destination: [...socketServer.clients].filter(
      (c) => c.readyState === WebSocket.OPEN
    ),
    detailType: params.detailType,
    detail: params.detail,
  });
}

socketServer.on("connection", (socket, req) => {
  const clientId = req.headers["sec-websocket-key"];
  console.log("Client connected", clientId);

  sendMessage({
    destination: socket,
    detailType: "greeting",
    detail: {
      message: "Hello from the server!",
    },
  });

  broadcastMessage({
    detailType: "new-connection",
    detail: {
      message: `A new client has connected`,
      clientId,
    },
  });

  socket.on("message", (data) => {
    const message = JSON.parse(data.toString()) as WebSocketMessage<
      "send-chat-message",
      { message: string }
    >;

    console.dir(message, { depth: null });

    broadcastMessage({
      detailType: "chat-message",
      detail: {
        message: message.detail.message,
        from: {
          clientId,
        },
      },
    });
  });
});

console.log(`WebSocket server is running on ws://localhost:${port}/api/ws`);
