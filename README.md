# Convo – Real-Time Chat Application

Convo is a full-stack real-time messaging application built using the **MERN stack** and **Socket.IO**.  
It allows users to communicate instantly through personal and group chats while supporting features such as typing indicators, media sharing, and real-time user presence.

This project demonstrates modern full-stack development practices including **secure authentication, scalable backend architecture, real-time communication, and efficient state management**.

---

## Key Highlights

- Real-time messaging using **WebSockets (Socket.IO)**
- Secure **JWT-based authentication**
- **One-to-one and group chat** functionality
- Image sharing using **Cloudinary**
- **Typing indicators and live user presence**
- Responsive UI built with **React + TailwindCSS**
- Efficient state management using **Zustand**

---

## Features

### Authentication & Security

- User signup and login
- JWT-based authentication
- Protected API routes
- Persistent sessions using HTTP-only cookies

---

### Real-Time Messaging

- Instant message delivery using **Socket.IO**
- Messages update without page refresh
- Optimistic UI updates for better user experience
- Real-time synchronization across connected clients

---

### Personal Chats

- One-to-one private conversations
- Persistent message history
- Message timestamps
- Message delivery and seen status indicators

---

### Group Chat

- Create and manage group conversations
- Add or remove group members
- Send messages to all group participants
- Real-time message broadcasting

---

### Message Features

- Send text messages
- Send image messages
- Delete messages
- Automatic timestamps
- Message status indicators

---

### Typing Indicators

- Shows when another user is typing
- Real-time typing updates using WebSockets

---

### User Presence

- Displays online/offline status
- Tracks active user connections in real time

---

### UI / UX Features

- Modern responsive interface
- Smooth auto-scroll to the latest messages
- Image preview before sending
- Notification and typing sound effects
- Animated UI components

---

## Tech Stack

### Frontend

- React.js
- Zustand (state management)
- TailwindCSS
- DaisyUI
- Socket.IO Client
- Axios

---

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

## Architecture Overview

The application follows a **client–server architecture**.

**Frontend (React)**  
Handles UI rendering, user interaction, and application state.

**Backend (Node.js + Express)**  
Manages authentication, API endpoints, and message processing.

**Database (MongoDB)**  
Stores user accounts, chat data, and message history.

**WebSockets (Socket.IO)**  
Enables real-time bidirectional communication between connected clients.

---

## Key Concepts Demonstrated

- Real-time communication using **WebSockets**
- Global state management using **Zustand**
- Optimistic UI updates
- Secure authentication using **JWT**
- Cloud-based media storage using **Cloudinary**
- Scalable full-stack application architecture

---

## Future Improvements

Possible enhancements:

- Message reactions (👍 ❤️ 🔥)
- Voice messages
- Read receipts
- Push notifications
- Message search
- Emoji picker
- File sharing
- Group admin roles and permissions
- End-to-end encryption

---
