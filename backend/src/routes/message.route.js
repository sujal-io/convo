import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
  deleteMessage,
  editMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);

router.get("/chats", getChatPartners);

router.get("/group/:id", getMessagesByUserId);

router.get("/user/:id", getMessagesByUserId);

router.get("/:id", getMessagesByUserId);

router.post("/send/:id", sendMessage);

router.put("/:messageId", editMessage);

router.delete("/:messageId", deleteMessage);

export default router;