import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  selectedChatType: null, // "personal" or "group"
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) =>
  set({
    selectedUser,
    selectedChatType: "personal",
    messages: []   // clear old chat messages
  }),

  setSelectedGroup: (group) =>
  set({
    selectedUser: group,
    selectedChatType: "group",
    messages: []   // clear old chat messages
  }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async () => {
  const { selectedUser, selectedChatType } = get();

  if (!selectedUser || !selectedChatType) return;

  set({ isMessagesLoading: true });

  try {

    const type = selectedChatType === "group"
      ? "group"
      : "personal";

    const res = await axiosInstance.get(
      `/messages/${selectedUser._id}?type=${type}`
    );

    set({ messages: res.data });

  } catch (error) {
    toast.error(error.response.data.message);
  } finally {
    set({ isMessagesLoading: false });
  }
},

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immideately update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
    } catch (error) {
      set({ messages: messages }); // remove optimistic message on failure
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    const { authUser } = useAuthStore.getState();

    socket.on("newMessage", (newMessage) => {
      const { authUser } = useAuthStore.getState();

      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;

      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
set({ messages: [...currentMessages, newMessage] });

// 🔥 TELL BACKEND THAT MESSAGE WAS RECEIVED
socket.emit("messageDelivered", {
  messageId: newMessage._id
});

      // 🔴 THIS IS THE IMPORTANT PART
      // tell backend that this message has reached receiver

      if (newMessage.receiverId === authUser._id) {
        socket.emit("messageDelivered", {
          messageId: newMessage._id,
        });
      }

      if (isSoundEnabled && newMessage.senderId !== authUser._id) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch(() => {});
      }
    });

    socket.on("messageDeliveredUpdate", ({ messageId }) => {

  const currentMessages = get().messages;

  const updatedMessages = currentMessages.map((msg) => {

    if (msg._id === messageId) {
      return {
        ...msg,
        status: "delivered"
      };
    }

    return msg;
  });

  set({ messages: updatedMessages });

});
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));
