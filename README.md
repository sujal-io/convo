# Convo – Real-Time Chat Application

A full-stack real-time chat application built with the MERN stack and Socket.IO.  
Convo supports personal messaging, group chats, image sharing, typing indicators, and live online user status.

This project demonstrates modern full-stack architecture using React, Zustand, Express, MongoDB, and WebSockets.

---

## Features

### Authentication
- User signup and login
- Secure JWT authentication
- Protected API routes
- Persistent sessions using cookies

### Real-Time Messaging
- Instant message delivery using **Socket.IO**
- Messages appear without page refresh
- Optimistic UI updates for faster experience

### Personal Chat
- One-to-one conversations
- Message history
- Message timestamps
- Message delivery and seen status indicators

### Group Chat
- Create chat groups
- Add and remove members
- Send messages to group members
- Real-time group messaging

### Message Features
- Send text messages
- Send image messages
- Delete messages
- Message timestamps
- Message status indicators

### Typing Indicator
- Displays when another user is typing
- Real-time typing updates using sockets

### User Presence
- Online/offline user status
- Real-time user connection tracking

### UI/UX Features
- Responsive modern UI
- Sound effects for typing and notifications
- Image preview before sending
- Smooth auto-scroll to latest messages
- Animated UI components

---

## Tech Stack

### Frontend
- React
- Zustand (state management)
- TailwindCSS
- DaisyUI
- Socket.IO Client
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication
- Multer (file uploads)
- Cloudinary (image storage)

---

## Project Structure

```
convo/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── lib/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── hooks/
│   │   └── lib/
│   └── public/
│
└── README.md
```

## Key Concepts Demonstrated

- Real-time communication with **WebSockets**
- State management using **Zustand**
- Optimistic UI updates
- Secure authentication with **JWT**
- File uploads using **Cloudinary**
- Scalable chat architecture

---

## Future Improvements

Possible enhancements for the project:

- Message reactions (👍 ❤️ 🔥)
- Voice messages
- Read receipts
- Push notifications
- Message search
- Emoji picker
- File sharing
- Group admin controls

---

