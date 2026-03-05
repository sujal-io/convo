import { XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, selectedChatType, setSelectedUser, updateGroupPic } =
    useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const fileInputRef = useRef(null);

  // Safeguard: if no user is selected, don't render header
  if (!selectedUser) {
    return null;
  }

  const isGroup = selectedChatType === "group";
  const isOnline = !isGroup && onlineUsers.includes(selectedUser._id);
  const isGroupAdmin =
    isGroup && selectedUser.admin?.toString() === authUser?._id?.toString();

  const handleGroupPicChange = (e) => {
    const file = e.target.files[0];
    if (!file || !isGroup || !isGroupAdmin) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      updateGroupPic(selectedUser._id, base64);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-6 flex-1"
    >
      <div className="flex items-center space-x-3">
        <div
          className={`avatar ${
            isGroup ? "" : isOnline ? "online" : "offline"
          }`}
        >
          <button
            type="button"
            className="w-12 rounded-full overflow-hidden relative group"
            onClick={() => {
              if (isGroupAdmin && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
          >
            <img
              src={
                isGroup
                  ? selectedUser.groupPic || "/avatar.png"
                  : selectedUser.profilePic || "/avatar.png"
              }
              alt={isGroup ? selectedUser.name : selectedUser.fullname}
              className="w-full h-full object-cover"
            />
            {isGroupAdmin && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">Change</span>
              </div>
            )}
          </button>

          {isGroupAdmin && (
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleGroupPicChange}
              className="hidden"
            />
          )}
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">
            {isGroup ? selectedUser.name : selectedUser.fullname}
          </h3>
          <p className="text-slate-400 text-sm">
            {isGroup
              ? `${selectedUser.members?.length || 0} members`
              : isOnline
                ? "Online"
                : "Offline"}
          </p>
        </div>
      </div>

      <button onClick={() => setSelectedUser(null)}>
        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
      </button>
    </div>
  );
}
export default ChatHeader;