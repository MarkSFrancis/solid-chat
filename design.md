# Objectives

- Local-first / offline-first
	- This includes being able to continue to send messages whilst offline
- Push from the server to the client for key events (e.g. "new message in chat") to have a "realtime" feel
- Support for large-scale chat rooms (>20k members)
- Support for large numbers of chats per user (>2k chats per user)
- Support for per-chat RBAC (owner / admin / member)
- Support for authentication including instant propagation of session revokes

# Offline-first + the sync problem

Data could be edited by two different people whilst offline, then they come back online. We now need to reconcile the two "sources of truth"

# Patterns

- **Event sourcing**: a list of "stuff that happened to this" -> replay to get the "current state"
	- **Events + Snapshots** are a way of achieving this without needing to share the complete history for new connections
	- **Cryptocurrency**  is another form of this model, useful when you don't want a central API at all
- **CRDT (Conflict-free Replicated Data Type)** -> a set of mathematical matrixes which apply differences and merge datasets together
- **LWW (Last Write Wins)** -> throw everything that isn't the last write in the bin
	- **Distributed SQLite** is a form of this
	- This can be done at any level of granularity (per DB, per table, per record, or even per field)
		- For example, per field might look like this:
			```json
			{
			  "id": "chat-1",
			  "name": "Best chat",
			  "name_updated_at": "2000-01-01",
			  "created_at": "2000-01-01"
			}
			```
		- This would indicate that the chat was created `2000-01-01`, and the name was last edited at the same time.  If another request comes in which edits `name`, it'd have a  newer timestamp which would then result in the old value being replaced
		- Note that not all fields need LWW support, such as `id` and  `created_at`, as these fields are immutable.
		- It might also be beneficial to have an overall `updated_at` field,  as this could make scanning for recently changed data faster when syncing to clients

# Recommendation

### For mutable / editable fields

We generally believe a **per-field-LWW** approach is superior, though some actions may **always** win (e.g. **delete** operations being persisted, even if someone's made an edit since that event).

For LWW fields, we recommend `"value"` and `"value_updated_at"` formats, like so:
```json
{
  "name": "Best chat",
  "name_updated_at": "2000-01-01"
}
```

However, with that said, you should use a format that works best with your DB. We'll discuss the format for the wire separately later, in [[#Efficient LWW]].

### For immutable / readonly fields

For non-editable fields (such as `id` or `created_at`), we do **not** recommend using the LWW approach, and instead **never** allow edits to such fields. This is because the LWW is overhead and misleading in those cases.

### For IDs

We generally recommend that **all records** use ULIDs for their ID. This allows for quickly sorting, filtering, and indexing by `created_on`, without dedicated indexes

> [!INFO] ULIDs + created_on
> Whilst using ULIDs mean that `created_on` is technically just noise, we still recommend storing this separately as it's easier to filter on + understand quickly than ULIDs in most DBs.
> 
> As ULIDs grow in maturity, we may find the `created_on` field to be unnecessary noise.

### Don't delete records immediately

With distributed sync like this, we can't delete records when they're removed. We can clear out the data, but we **must** keep the record's ID and a mark that the the record was deleted as a minimum. This is so that if future writes to this record come from clients, they don't recreate the record. Instead, they're reconciled against a record that's already marked as "deleted" + therefore will be treated accordingly.

For example, for a chat message that exists we might have this:
```json
{
  "id": "chat_1",
  "content": "Hello world!",
  "author_id": "1"
}
```

If the author then deletes the message, we might then change it to this:
```json
{
  "id": "chat_1",
  "deleted_at": "2000-01-01"
}
```
Notice that all other fields have been removed. If any subsequent updates come for "chat_1" (such as new reactions, message edits, or further deletes), then they'd be reconciled accordingly naturally. 

If the record had been deleted entirely, subsequent "message edits" would be unclear as to whether they're for a message that failed to sync its "create" event (and therefore a bug), a fake request from a malicious user (and therefore an [IDOR attack](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)), or if they're for a message that was previously deleted (and should therefore be ignored).

This is called a [Tombstone](https://en.wikipedia.org/wiki/Tombstone_(data_store)).

#### Handling tombstone records

Obviously all this "this entry was deleted" data can pile up over time, and it's a waste of storage. So ideally, we'd like to clean all this up at some point. Here's what we'll do:
- For records deleted > 30 days ago, we'll clear out the tombstone records
- If a client sends us updates which are more than 30 days old, we'll have to reject them

### Manage sets as separate records

Some data have attached Sets (lists of data attached to other data).
Examples include:
- Chat messages
- Chat message reactions
- Chat members

We're not going to attach these as part of their related entities at all (e.g. an array on a `message` record), but rather as their own separate pieces of data. This means each set's entry will need to store the related record's IDs (e.g. `chat_id`).

> [!Success] Avoiding array position sync problems
> If we just used arrays, we would experience an issue when separate instances "pushing" different data to their local arrays, and therefore end up with the same array position referring to two different bits of data. As such, any edits made to that array position's data later will end up referring to different records on different sync sources.
> 
> For example, if user 1 has a chat with user 2, and then user 1 invites user 3 and user 2 invites user 4, we end up with this data:
> ```json
> // User 1's data
> {
>   "members": ["user_1", "user_2", "user_3"]
> }
> ```
> ```json
> // User 2's data
> {
>   "members": ["user_1", "user_2", "user_4"]
> }
> ```
> Suddenly we can't rely on `members[2]` referring to the same user data in each sync environment, which gets complex for [a lot of reasons](https://firebase.blog/posts/2014/04/best-practices-arrays-in-firebase)
> 
> Using an ID-keyed record for each entry removes this array indexing problem entirely. It's also why we use ULIDs for IDs instead of sequentially incrementing numbers

### For the chat metadata

The chat metadata includes info like the chat's name, avatar, and more. 

The majority of these would be editable fields, and therefore use LWW. A JSON storage blob might look something like this:
```json
{
  "id": "chat_01KAM9QZDCQ33Q5WFV2TJ6H5ZG",
  "name": "Best chat",
  "name_updated_at": "2000-01-01",
  "avatar_url": "https://picsum.photos/200",
  "avatar_url_updated_at": "2000-01-01"
}
```

## Chat messages

- Chat messages are a great example of a Set record within a chat
- Chat messages are **not** an append-only store, though it may appear to be, as messages can be edited or deleted later
```json
{
  "id": "1",
  "chat_id": "1",
  "created_at": "2000-01-01",
  "content": "Hello, world!",
  "content_updated_at": "2000-01-01",
  "author_id": "4"
}
```

### For chat message reactions

Message reactions are a great example of a Set record, so they're simple. However, they don't need an ID of their own, as a combination of user + message + reaction emoji can only exist once, so its primary key would be a hash of those values. As such, a reaction might look something like this:
```json
{
  "chat_message_id": "1",
  "user_id": "1",
  "reaction": "👍"
}
```

There's quite a lot of granularity here that means we might not send this data down as a single record to the client. We'll go into this in more detail later in [[#Subscribing to containers]]

### For chat members

Chat members are very similar to message reactions. Here's what a chat member's data might look like:
```json
{
  "chat_id": "1",
  "user_id": "1",
  "membership_status": "member",
  "membership_status_updated_at": "2000-01-01",
  "is_operator": true,
  "is_operator_updated_at": "2000-01-01"
}
```

# Wire protocol

Okay, so that's great for storage, but what about how data is actually sent over the wire? 

## Use WebSockets

Because we need the server to be able to push updates to the clients, we recommend using WebSockets instead of HTTP. This forms a two-way connection between the client + server, which is much more complex when using HTTP (see [long polling / server-sent events](https://medium.com/@asharsaleem4/long-polling-vs-server-sent-events-vs-websockets-a-comprehensive-guide-fb27c8e610d0))

## Authenticated connections

When a WebSocket connection is established, it must be authenticated first via a JWT. Once a connection is established, it is **trusted**, and JWT is attached to the connection via metadata. 

Unfortunately, browsers **do not** support custom headers in the initial connection request, so you must either use Cookies or go through a "ticket" process to create a WebSocket connection:
1. Request the ability to create a WebSocket connection, generally via a HTTP request to an API
2. The API generates a temporary and single-use "ticket" which you can then use to create an authenticated WebSocket
3. The client then uses this ticket to establish a WebSocket connection (e.g. `wss://my-server.com/ws?ticket=asdf`)

> [!WARNING] Cookie auth and Cross-Site WebSocket Hijacking (CSWSH)
> If you choose to rely on cookies in WebSocket handshake requests, your WebSockets become vulnerable to [CSWSH](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html#authentication-and-authorization). WebSockets do not support [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), so you must provide the necessary protections yourself.
> 
> As such, the server **must** validate the `Origin` header on every handshake. This ensures that the client request is coming from a domain name you know and trust. 

When the JWT associated with a connection expires, the server **must** drop the connection. Note that a 5 seconds delay after expiry to allow for [clock skew](https://en.wikipedia.org/wiki/Clock_skew) is [fairly standard](https://github.com/clerk/javascript/blob/337430bc44ba846e40bff66d72618963d51ee20d/packages/backend/src/jwt/verifyJwt.ts#L20) for JWTs.

The client must refresh the JWT before it expires and send the newer JWT to the server, in order for the server to update the connection's associated JWT. Doing so resets the "kill" timer described above. This process is effectively a "heartbeat" of auth, which would run every few minutes or so and is required for the connection to remain live over longer authenticated periods. 

The server **must** handle any "session revoked" updates, which must drop all connections which use a JWT associated with the revoked session. A session may be revoked when the user:
- Logs out
- Changes their password
- Reports a breach on their account
- Deletes their account (or is otherwise banned from using the app)

## Use Transfer Windows

Because information is flying both ways in our connection, we want to minimise latency and make the most of our WebSocket data frames. We'll quite often want to send multiple pieces of data, especially when the client has just come online ("here's all the data you need") or just re-connected ("here's all things I did whilst I was offline"). So instead of sending these bits of data as separate things, we'll make all data transfers as minified JSON arrays, and we'll call each array a **transfer window**. These transfer windows keeps the wire-debugging simple, allows us to continue using web-standard formats and tools, keeps our transfers efficient, and allows us to send groups of data knowing that they'll be received in the correct order. 

Bear in mind that this doesn't mean "don't send data until we've got at least a few events", akin to batching, but rather "send all the events you haven't managed to send yet as soon as you can", regardless if that means sending an array with only one item in it, or sending an array with hundreds in it. 


> [!Success] De-duping data
> Because we can group updates together in a single transfer window, if there's multiple bits of data being sent at the same time (one author wrote 5 messages), we can optionally optimise this so that we only broadcast the author's data once. 
> 
> Because the client will reconcile the data locally, there's no need for the duplicate author information


### Efficient LWW

In the DB, we may store the timestamps for our LWWs like so:
```json
{
  "name": "Best chat",
  "name_updated_at": "2000-01-01T00:00:00.000Z"
}
```
but this is relatively inefficient over the wire - especially if there's a number of LWW fields. 

As such, we recommend a slightly different format for the wire protocol:
```json
{
  "name": ["Best chat", 946684800000]
}
```
In this format, the LWW fields are a tuple. The 1st item is the value, and the 2nd is the timestamp it was last edited at (as the number of milliseconds since epoch)

## LWW and clock skew

If a client sends us updates for records which appear to happen in the future (according to the server's clock), we should treat (and save) them as if they had happened at the server's current time. This avoids malicious actors setting their local time into the future + ending up freezing the field to be un-editable until that future time. 

If the client makes an edit, but it's editing data which appears to have been edited in the future (at the time when it's making the edit), it should save as if it had happened at the last write's time +1 millisecond when it's making its current edit. This avoids issues when the client's clock is in the past, and therefore they're unable to edit anything. 

## For new or re-connecting clients

When a new client connects (or reconnects), they'll need to "seed" their local storage. This needs some basic info, but also significantly less than you might think. We don't need a complete replication of the server's state onto the client, and instead we can serve only a small subset of the data. 

Primarily, there are a few things we need to keep in mind when seeding a client's store:
1. Do I have any local pending updates I need to broadcast first? 
2. What data does the user need right now? 
3. What data should the user have synced in realtime? 

We can be pessimistic and send more data down to the client (for example, if the client expects  to be offline for a while + want to explore some data), but we don't generally recommend this for a chat app like this one. 

In our app, the user might see the list of most recently active chats, and the most recently sent messages in the currently open chat, including their authors. So we'd send:
1. The top 20 (or so) most recently active chats, including whatever data they need to draw the chat sidebar
2. For the most recently active chat, the most recent 20 (or so) messages
3. The user data for the users who created those most recent messages

> [!INFO] Send related data as separate records
> Whilst it might seem obvious to attach author data directly into messages like so:
> ```json
> {
>   "message_id": "1",
>   "author": {
>     "id": "1",
>      "name": "John Smith"
>   }
> }
> ```
>  this is actually bad for local-first!
> 
> Because the client needs to pick up these + correct the data if it gets a later event saying "John was edited", it needs to maintain its local list of users separately + reconcile locally, so receiving the data separately makes this process easier. No need for the client to unpick the related data out before being able to reconcile it with other local data the client already has

When sending related data, the related data should always be emitted **before** the data, and in the same **transfer window**. This is to avoid situations such as the message content being rendered when there's no author info yet. For example, send the `author` before sending the `message` when a new message is sent.

When we emit these snapshots of the relevant data, it allows the app to stay _somewhat_ up-to-date on related data without being overly subscribed to realtime info. 

### Subscribing to containers

Managing who's subscribed to what on the server-side is quite the task, so we want to reduce the number of subscriptions and their fidelity as much as possible. To do this, the client should subscribe to things based on **containers** (groups of data), rather than individual pieces of data. 

For example, a client may subscribe to "Active chats" which keeps their sidebar synced, and also sync to "Chat #1" as that's the chat they currently have open. Each of these represent multiple individual pieces of data (most recent messages, chat name, etc.), but are high-level enough on their own that a client shouldn't require thousands of individual subscriptions in order to display the right information to the user.

> [!Success] Server-controlled subscription granularity
> Containers can vary in complexity without the client realising. Some chat groups may have hundreds of thousands of members, others may only have two. 
> 
> For a mere two users, the server could easily emit all "user online status changed" events straight to the client. For hundreds of thousands, this is less feasible. With our approach of "send updates about users whenever you think it's necessary", the server can dynamically adjust how much truly realtime data to subscribe the user to. 

#### Events

When we subscribe to a container, we generally want two things:
1. A snapshot of the current state (including when each part of it was last updated)
2. A live stream of events (e.g. "chat name changed", or "message sent") with _their_ state snapshots (e.g. the message + message author)
	1. This stream should be reconciled against our local events both locally and on the server. When sent to the server, the server will then re-emit the same event back to us, with the latest state snapshots attached

We also want to stream our **local** events up to the API too. If the API rejects any, we could discard / rollback our local ones (for example, if we edited a group name right after someone else removed our permission to do so, our rename should be rejected + rolled back). This "events after snapshot" allows us to merge remote + local events into the latest "state", even before we've managed to send our local updates to the API. 

### Embrace incomplete data

For the majority of events, we won't need to send _all_ the data. For example, when a user sends a message, a "message created" event is captured, and the message gets broadcast to subscribers. That means the author's info _also_ gets broadcast, but we don't actually need _all_ the author's info to display the new message. Just their name + avatar is probably enough! If the client has more detailed updates coming from elsewhere, they should reconcile it all locally. 

This means the client benefits from and should expect partial local copies of records, as well as partial updates from the API. If the client later finds itself needing more data, it should request that data separately

### Managing busyness

Some data needs realtime updates, but most doesn't. We can manage when we broadcast updates to clients and when we don't, as well as how much data is in those updates, based on the busyness of the container, or the importance of particular updates.

For example, if the user is viewing the list of people in a chat, we probably want a subscription to their online status. But we don't need a realtime subscription to avatars + names. We can get those updates if those users send a new message in the chat instead, as we get user profile snapshots when that happens anyway

### Sets are an orange flag

We talked about [[#Manage sets as separate records|Sets]] further up, but the idea is that they're a collection of data related to something else. Because these can be infinitely long, we should try **really hard** to define our sets in a way that **limits** the amount of data we're sending down. This could mean one or more of the following:
1. Paginating the set data (e.g. only sending the latest messages)
2. Summarising the set data by default (e.g. only sending the number of reactions for each emoji, rather than exactly who sent which reactions)
3. Omitting detailed fields from the Set data (e.g. only sending the user's name and avatar - not their full profile info)

For example, chat message reactions could exclusively send with each message:
1. The total number of emojis that have been reacted with
2. The 5 most popular emojis
3. The names of the first 3 users who made each of the most popular 5 emoji reactions

The more detailed data (e.g. who exactly has reacted) could be fetched when the user clicks / hovers on things, or scrolls / searches through the list of people who reacted.
