interface WebSocketMessage<TDetailType extends string, TDetail> {
  version: string;
  id: string;
  createdOn: string;
  detailType: TDetailType;
  detail: TDetail;
}

export type UserCreatedMessage = WebSocketMessage<
  'user-created',
  {
    userId: string;
    username: string;
  }
>;

export type ChatCreatedMessage = WebSocketMessage<
  'chat-created',
  {
    id: string;
    name?: string;
    memberIds: string[];
  }
>;

export type ChatMessageSentMessage = WebSocketMessage<
  'chat-message-sent',
  {
    id: string;
    chatId: string;
    createdOn: string;
    authorId: string;
    content: string;
  }
>;

export type ApiMessage =
  | UserCreatedMessage
  | ChatCreatedMessage
  | ChatMessageSentMessage;

export type ApiMessageDetailType = ApiMessage['detailType'];
export type ApiMessageDetail<Type extends ApiMessageDetailType> = Extract<
  ApiMessage,
  { detailType: Type }
>['detail'];

export type AppMessage = ChatMessageSentMessage;
