# Convo

A real-time chat app built on the MERN stack with Socket.IO — one-to-one and group messaging, typing indicators, live presence, and image sharing, all synced instantly across connected clients.

I built this to get real practice with the harder parts of full-stack work: WebSocket architecture, state that has to stay consistent across multiple connected clients, and auth that actually holds up under protected routes — not just a CRUD app with a chat skin on it.

## What it does

**Auth** — Signup/login with JWT, protected API routes, and sessions persisted via HTTP-only cookies rather than localStorage tokens.

**Messaging** — Messages send and arrive over Socket.IO with no page refresh, with optimistic UI updates so the sender's screen feels instant even before the server confirms.

**One-to-one chat** — Persistent conversation history with timestamps.

**Group chat** — Create groups, add/remove members, broadcast messages to everyone in the group in real time.

**Media** — Image messages upload through Cloudinary, with a preview before sending.

**Typing indicators & presence** — See when someone's typing and who's currently online, both driven off the same WebSocket connection rather than polling.

## Tech stack

- **Frontend:** React, Zustand, Tailwind CSS, DaisyUI, Socket.IO client, Axios
- **Backend:** Node.js, Express, MongoDB/Mongoose, Socket.IO, JWT, Multer, Cloudinary

## Architecture

Client-server, with a WebSocket layer sitting alongside the usual REST API:

- **Frontend (React + Zustand):** UI rendering and client-side state, kept in sync with the server over sockets
- **Backend (Node/Express):** auth, REST endpoints, message processing
- **Database (MongoDB):** users, chats, message history
- **Socket.IO:** bidirectional real-time layer for messages, typing status, and presence

## What I'd add next

Message reactions, read receipts, voice messages, push notifications, in-chat search, an emoji picker, general file sharing (beyond images), group admin roles, and end-to-end encryption. Roughly in that order of how much value they'd add relative to effort.

## Running it locally

```bash
git clone https://github.com/yourusername/convo.git
cd convo
```

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend (separate terminal):

```bash
cd frontend
npm install
npm run dev
```

## Screenshots

<!-- TODO: add screenshots, see notes -->
![Login](.//frontend/public/ss1.png)
![Signup](./frontend/public/ss3.png)
![Chat Section](.//frontend/public/ss2.png)


---

**Sujal Bhardwaj** — [GitHub](https://github.com/sujal-io) · [LinkedIn](https://www.linkedin.com/in/sujal-bhardwaj-8332b92b1/)
