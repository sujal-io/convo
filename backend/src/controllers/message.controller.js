import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";

export const getAllContacts = async (req, res) => {
    try {
       const loggedInUserId = req.user._id;
       const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

       res.status(200).json(filteredUsers);

    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMessagesByUserId = async (req, res) => {
  try {

    const myId = req.user._id;
    const { id } = req.params;
    let { type } = req.query;
    
    // Determine type from route if not explicitly provided
    const routePath = req.route?.path || "";
    if (routePath.includes("/group/")) {
      type = "group";
    }

    // Default to personal if type not specified
    if (!type) {
      type = "personal";
    }

    let messages = [];

    // PERSONAL CHAT
    if (type === "personal") {
      messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: id },
          { senderId: id, receiverId: myId }
        ],
      });
    }

    // GROUP CHAT
    if (type === "group") {
      messages = await Message.find({
        groupId: id
      });
    }

    res.status(200).json(messages);

  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {

    const { text, image, groupId } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // check if sender is part of group before sending message
if (groupId) {

  const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({
      message: "Group not found"
    });
  }

  const isMember = group.members.some(
    (member) => member.toString() === senderId.toString()
  );

  if (!isMember) {
    return res.status(403).json({
      message: "You are not a member of this group"
    });
  }
}

    // message must belong to either user OR group
    if (!receiverId && !groupId) {
      return res.status(400).json({
        message: "Either receiverId or groupId is required",
      });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId: groupId ? null : receiverId,
      groupId: groupId || null,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // PERSONAL CHAT SOCKET
    if (!groupId) {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    }

    // GROUP CHAT SOCKET (we'll improve later)
    if (groupId) {
      io.emit("newGroupMessage", newMessage);
    }

    res.status(201).json(newMessage);

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChatPartners = async(req,res) =>{
    try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver (excluding group messages)
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
      receiverId: { $ne: null }, // Exclude group messages
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}