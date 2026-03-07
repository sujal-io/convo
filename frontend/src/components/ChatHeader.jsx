import { XIcon, Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const [showMembers, setShowMembers] = useState(false);
  const showMembersRef = useRef(false);
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

  showMembersRef.current = showMembers;

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        if (showMembersRef.current) {
          setShowMembers(false);
        } else {
          setSelectedUser(null);
        }
      }
    };

    window.addEventListener("keydown", handleEscKey);

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

        <div className="relative">
          <h3 className="text-slate-200 font-medium">
            {isGroup ? selectedUser.name : selectedUser.fullname}
          </h3>
          {isGroup ? (
            <button
              type="button"
              onClick={() => setShowMembers((v) => !v)}
              className="text-slate-400 text-sm hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <Users className="w-4 h-4" />
              {selectedUser.members?.length || 0} members
            </button>
          ) : (
            <p className="text-slate-400 text-sm">
              {isOnline ? "Online" : "Offline"}
            </p>
          )}
          {isGroup && showMembers && (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden="true"
                onClick={() => setShowMembers(false)}
              />
              <div className="absolute left-0 top-full mt-1 z-20 w-56 max-h-64 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2">
                <p className="px-3 py-1 text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Group members
                </p>
                {(selectedUser.members || []).map((m) => {
                  const member = typeof m === "object" ? m : null;
                  const name = member?.fullname ?? member?.fullName ?? "Unknown";
                  const pic = member?.profilePic;
                  return (
                    <div
                      key={member?._id ?? m}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                        {pic ? (
                          <img
                            src={pic}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                            {name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-200 text-sm truncate">
                        {name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <button onClick={() => setSelectedUser(null)}>
        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
      </button>
    </div>
  );
}
export default ChatHeader;