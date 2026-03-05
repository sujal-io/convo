import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

function GroupsList() {
  const {
    groups,
    getMyGroups,
    isUsersLoading,
    setSelectedGroup,
  } = useChatStore();

  useEffect(() => {
    getMyGroups();
  }, [getMyGroups]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  if (groups.length === 0)
    return (
      <p className="text-slate-400 text-center mt-6">
        No groups yet
      </p>
    );

  return (
    <>
      {groups.map((group) => (
        <div
          key={group._id}
          onClick={() => setSelectedGroup(group)}
          className="bg-purple-500/10 p-4 rounded-lg cursor-pointer hover:bg-purple-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-purple-500/30 overflow-hidden flex items-center justify-center text-white font-bold">
              {group.groupPic ? (
                <img
                  src={group.groupPic}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                group.name.charAt(0).toUpperCase()
              )}
            </div>
            <h4 className="text-slate-200 font-medium truncate">
              {group.name}
            </h4>
          </div>
        </div>
      ))}
    </>
  );
}

export default GroupsList;