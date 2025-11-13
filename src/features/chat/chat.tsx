import { createSignal } from 'solid-js';
import { useSocket } from '~/api/socket-provider';

export function Chat() {
  const socket = useSocket();
  const [message, setMessage] = createSignal('');

  return (
    <div>
      <h2>Chat</h2>
      <div>Socket status: {socket.status}</div>
      <div>
        {socket.messages.map((message) => (
          <code>
            <pre>{JSON.stringify(message, null, 2)}</pre>
          </code>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          const messageValue = message();
          if (messageValue.trim() !== '') {
            const socketEvent = {
              version: '0',
              id: crypto.randomUUID(),
              createdOn: new Date().toISOString(),
              detailType: 'broadcast',
              detail: {
                message: messageValue,
              },
            };
            socket.send(JSON.stringify(socketEvent));
            setMessage('');
          }
        }}
      >
        <input
          type="text"
          value={message()}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
