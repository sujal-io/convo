import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { app, server } from './lib/socket.js';

const PORT = ENV.PORT || 3000;

// Enable CORS early so even parsing errors include CORS headers
app.use(cors({origin: ENV.CLIENT_URL, credentials: true})); // allows frontend to send cookies to our backend
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/messages',messageRoutes)

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});