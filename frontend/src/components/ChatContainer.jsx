import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { Trash2 as Trash2Icon, Pencil as PencilIcon, Check, X } from "lucide-react";

function ChatContainer() {
  const {
    selectedUser,
    getMessages,
    selectedChatType,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUser,
    typingGroupUser,
    deleteMessage,
    editMessage,
  } = useChatStore();
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Fetch messages whenever the selected user or chat type changes.
  // We depend on the whole selectedUser object so re-clicking the same user
  // (which creates a new object reference) will still trigger a refetch.
  useEffect(() => {
    if (selectedUser && selectedChatType) {
      getMessages();
    }
  }, [selectedUser, selectedChatType, getMessages]);

  // Manage socket subscriptions per selected user.
  useEffect(() => {
    if (!selectedUser) return;

    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto  py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isOwnMessage =
                msg.senderId === authUser._id ||
                msg.senderId?._id === authUser._id;

              return (
                <div
                  key={msg._id}
                  className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
                >
                  <div className={`flex items-start gap-2`}>
                    {/* Small avatar outside bubble for others in group chats */}
                    {selectedChatType === "group" && !isOwnMessage && (
                      <div className="avatar mt-1">
                        <div className="w-6 h-6 rounded-full">
                          <img
                            src={msg.senderId?.profilePic || "/avatar.png"}
                            alt={
                              msg.senderId?.fullname ||
                              msg.senderId?.fullName ||
                              msg.senderId?.name ||
                              "User avatar"
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div
                      className={`chat-bubble relative ${isOwnMessage
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-800 text-slate-200"
                        }`}
                    >
                      {/* GROUP CHAT SENDER NAME (OTHERS ONLY) */}
                      {selectedChatType === "group" && !isOwnMessage && (
                        <p className="text-xs text-cyan-400 mb-1 font-medium">
                          {msg.senderId?.fullName ||
                            msg.senderId?.fullname ||
                            msg.senderId?.name}
                        </p>
                      )}
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Shared"
                          className="rounded-lg h-48 object-cover"
                        />
                      )}
                      {editingMessageId === msg._id ? (
                        <div className="mt-2 flex flex-col gap-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (editingText.trim()) {
                                  editMessage(msg._id, editingText.trim());
                                  setEditingMessageId(null);
                                  setEditingText("");
                                }
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditingText("");
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-600 hover:bg-slate-700 text-white text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        msg.text && (
                          <p className="mt-2 break-words whitespace-normal">
                            {msg.text}
                          </p>
                        )
                      )}
                      <div className="mt-1 flex items-center justify-between gap-2 text-xs opacity-75">
                        <p>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {isOwnMessage && editingMessageId !== msg._id && (
                          <div className="flex items-center gap-1">
                            {msg.text && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMessageId(msg._id);
                                  setEditingText(msg.text);
                                }}
                                className="text-slate-300/70 hover:text-cyan-400 transition-colors"
                                title="Edit message"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => deleteMessage(msg._id)}
                              className="text-slate-300/70 hover:text-red-400 transition-colors"
                              title="Delete message"
                            >
                              <Trash2Icon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>


                </div>
              );
            })}

            {selectedChatType === "group" &&
              typingGroupUser &&
              typingGroupUser.groupId?.toString() === selectedUser?._id?.toString() && (
                <p className="text-sm text-slate-400 mt-2">
                  {typingGroupUser.fullname} is typing...
                </p>
              )}
            {selectedChatType === "personal" &&
              typingUser === selectedUser?._id && (
                <p className="text-sm text-slate-400 mt-2">
                  {selectedUser.fullname} is typing...
                </p>
              )}

            {/*this is for auto scrolling to the latest message, def add this*/}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder
            name={selectedUser?.fullname || "this user"}
          />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;
