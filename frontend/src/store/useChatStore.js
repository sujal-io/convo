import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  groups: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  selectedChatType: null, // "personal" or "group"
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  typingUser: null,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  // Select a personal chat. Only clear messages when changing to a *different* user.
  setSelectedUser: (selectedUser) =>
    set((state) => {
      const isSameUser =
        state.selectedChatType === "personal" &&
        state.selectedUser?._id === selectedUser?._id;

      // If user is the same, keep existing messages to avoid flicker/placeholder.
      if (isSameUser) {
        return {
          selectedUser,
          selectedChatType: "personal",
        };
      }

      // Switching to a different user – clear old chat messages.
      return {
        selectedUser,
        selectedChatType: "personal",
        messages: [],
      };
    }),

  // Select a group chat. Same logic: only clear when switching groups.
  setSelectedGroup: (group) =>
    set((state) => {
      const isSameGroup =
        state.selectedChatType === "group" &&
        state.selectedUser?._id === group?._id;

      if (isSameGroup) {
        return {
          selectedUser: group,
          selectedChatType: "group",
        };
      }

      return {
        selectedUser: group,
        selectedChatType: "group",
        messages: [],
      };
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
      const type = selectedChatType === "group" ? "group" : "personal";

      const res = await axiosInstance.get(
        `/messages/${selectedUser._id}?type=${type}`,
      );

      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getMyGroups: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch groups");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  updateGroupPic: async (groupId, groupPic) => {
    try {
      const res = await axiosInstance.put("/groups/update-pic", {
        groupId,
        groupPic,
      });

      const updatedGroup = res.data;

      // update groups list
      const currentGroups = get().groups;
      const newGroups = currentGroups.map((g) =>
        g._id === updatedGroup._id ? updatedGroup : g,
      );

      const { selectedUser, selectedChatType } = get();

      const isCurrentGroupSelected =
        selectedChatType === "group" && selectedUser?._id === updatedGroup._id;

      set({
        groups: newGroups,
        selectedUser: isCurrentGroupSelected ? updatedGroup : selectedUser,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update group picture",
      );
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, selectedChatType, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // PERSONAL – show optimistic message immediately
    if (selectedChatType === "personal") {
      optimisticMessage.receiverId = selectedUser._id;
      set({ messages: [...messages, optimisticMessage] });
    }

    // GROUP – rely on socket "newGroupMessage" event instead of optimistic local add
    if (selectedChatType === "group") {
      optimisticMessage.groupId = selectedUser._id;
      // do NOT push optimistic message here to avoid duplicates with socket event
    }

    try {
      if (selectedChatType === "personal") {
        await axiosInstance.post(
          `/messages/send/${selectedUser._id}`,
          messageData,
        );
      } else {
        await axiosInstance.post(`/messages/send/null`, {
          ...messageData,
          groupId: selectedUser._id,
        });
      }
    } catch (error) {
      // rollback only for personal chats where we modified messages optimistically
      if (selectedChatType === "personal") {
        set({ messages });
      }
      toast.error(error.response?.data?.message || "Send failed");
    }
  },
  deleteMessage: async (messageId) => {
    const { messages, selectedChatType, selectedUser } = get();

    // Optimistically remove the message from UI
    const previousMessages = messages;
    const updatedMessages = messages.filter((msg) => msg._id !== messageId);
    set({ messages: updatedMessages });

    try {
      await axiosInstance.delete(`/messages/${messageId}`, {
        params: {
          // keep option open if backend ever needs context
          type: selectedChatType === "group" ? "group" : "personal",
          targetId: selectedUser?._id,
        },
      });
    } catch (error) {
      // rollback on failure
      set({ messages: previousMessages });
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },
  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    const { authUser } = useAuthStore.getState();

    socket.on("userTyping", ({ userId }) => {
      set({ typingUser: userId });
    
      setTimeout(() => {
        set({ typingUser: null });
      }, 1500);
    });

    socket.on("newMessage", (newMessage) => {
      const { authUser: latestAuthUser } = useAuthStore.getState();

      const isMessageFromSelectedUser =
        newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id;

      if (!isMessageFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      // tell backend that this message has reached receiver (only once)
      if (newMessage.receiverId === latestAuthUser._id) {
        socket.emit("messageDelivered", {
          messageId: newMessage._id,
        });
      }

      if (isSoundEnabled && newMessage.senderId !== latestAuthUser._id) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch(() => {});
      }
    });

    socket.on("newGroupMessage", (newMessage) => {
      console.log("GROUP SOCKET RECEIVED:", newMessage);
      const { selectedUser: currentSelectedUser, selectedChatType } = get();

      // only update if this group chat is currently open
      if (
        selectedChatType === "group" &&
        newMessage.groupId?.toString() === currentSelectedUser?._id
      ) {
        const currentMessages = get().messages;
        set({ messages: [...currentMessages, newMessage] });
      }
    });

    socket.on("messageDeliveredUpdate", ({ messageId }) => {
      const currentMessages = get().messages;

      const updatedMessages = currentMessages.map((msg) => {
        if (msg._id === messageId) {
          return {
            ...msg,
            status: "delivered",
          };
        }

        return msg;
      });

      set({ messages: updatedMessages });
    });
    socket.on("messageDeleted", ({ messageId }) => {
      const currentMessages = get().messages;
      const filtered = currentMessages.filter((msg) => msg._id !== messageId);
      set({ messages: filtered });
    });
    socket.on("groupMessageDeleted", ({ messageId, groupId }) => {
      const { selectedUser: currentSelectedUser, selectedChatType } = get();

      // only update if this group chat is currently open
      if (
        selectedChatType === "group" &&
        currentSelectedUser?._id === groupId
      ) {
        const currentMessages = get().messages;
        const filtered = currentMessages.filter((msg) => msg._id !== messageId);
        set({ messages: filtered });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("newGroupMessage");
    socket.off("messageDeleted");
    socket.off("groupMessageDeleted");
  },
}));
