import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import {
  ArrowLeft,
  BellOff,
  Loader2,
  Settings,
  Image,
  File,
  Link,
  LogOut,
  Monitor,
  Info,
} from "lucide-react";
import { studyGroupAPI } from "@/lib/api";
import { toast } from "sonner";
import GroupOverview from "../features/groupDetails/components/GroupOverview";
import GroupPermissions from "../features/groupDetails/components/GroupPermissions";
import LeaveGroupConfirmation from "../features/groupDetails/components/LeaveGroupConfirmation";
import EditGroupName from "../features/groupDetails/components/EditGroupName";
import EditGroupDescription from "../features/groupDetails/components/EditGroupDescription";
import MediaTab from "../features/groupDetails/components/MediaTab";
import FilesTab from "../features/groupDetails/components/FilesTab";
import ShareContentTab from "../features/groupDetails/components/ShareContentTab";
import { formatGroupOverviewDateTime } from "@/lib/formatMessageTime";
import { useAuth } from "@/hooks/useAuth";

const baseSidebarItems = [
  { id: "overview", label: "Overview", icon: <Info /> },
  { id: "screen_sharing", label: "Screen sharing", icon: <Monitor /> },
  { id: "media", label: "Media", icon: <Image /> },
  { id: "files", label: "Files", icon: <File /> },
  { id: "links", label: "Links", icon: <Link /> },
  {
    id: "permission",
    label: "Permission",
    icon: <Settings />,
    adminOnly: true,
  },
  { id: "leave", label: "Leave", icon: <LogOut /> },
];

const GroupActionsPopup = ({
  isOpen,
  onClose,
  groupId,
  onRestrictionUpdate,
  initialTab = "overview",
  onLeaveSuccess,
  onGroupDetailsUpdate,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showEditName, setShowEditName] = useState(false);
  const [showEditDescription, setShowEditDescription] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [sidebarItems, setSidebarItems] = useState(baseSidebarItems);
  const [isUpdating, setIsUpdating] = useState(false);

  const { getUser } = useAuth();
  const user = getUser();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId || !isOpen) return;
      setIsLoading(true);
      try {
        const { data } = await studyGroupAPI.getGroupDetails(groupId);
        const { date, time } = formatGroupOverviewDateTime(data.created_at);
        setGroupData({
          name: data.group_name,
          description: data.description,
          createdAtDate: date,
          createdAtTime: time,
          is_restricted: data.is_restricted || false,
        });

        const members = data.members || [];
        const currentMember = members.find((m) => m.user.id === user?.id);
        const role = currentMember?.role || null;
        setCurrentUserRole(role);

        if (role === "Leader" || role === "Admin") {
          setSidebarItems(baseSidebarItems);
        } else {
          setSidebarItems(baseSidebarItems.filter((item) => !item.adminOnly));
        }
      } catch (error) {
        toast.error("Failed to fetch group details.");
        console.error("Error fetching group details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroupData();
  }, [groupId, isOpen, user?.id]);

  const handleSaveName = async (newName) => {
    if (!newName.trim() || newName === groupData.name) {
      setShowEditName(false);
      return;
    }
    setIsUpdating(true);
    try {
      await studyGroupAPI.updateGroupDetails(groupId, { group_name: newName });
      toast.success("Group name updated successfully.");

      // Update local state
      setGroupData((prev) => ({ ...prev, name: newName }));

      // Propagate state up to ChatRoom
      if (onGroupDetailsUpdate) {
        onGroupDetailsUpdate(groupId, { name: newName });
      }

      setShowEditName(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update group name."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // ✨ UPDATED: Connect handleSaveDescription to the API
  const handleSaveDescription = async (newDescription) => {
    if (newDescription === groupData.description) {
      setShowEditDescription(false);
      return;
    }
    setIsUpdating(true);
    try {
      await studyGroupAPI.updateGroupDetails(groupId, {
        description: newDescription,
      });
      toast.success("Group description updated successfully.");

      // Update local state
      setGroupData((prev) => ({ ...prev, description: newDescription }));

      // Propagate state up to ChatRoom (good practice)
      if (onGroupDetailsUpdate) {
        onGroupDetailsUpdate(groupId, { description: newDescription });
      }

      setShowEditDescription(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update group description."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRestrictionUpdate = (newStatus) => {
    setGroupData((prev) => ({ ...prev, is_restricted: newStatus }));
    if (onRestrictionUpdate) {
      onRestrictionUpdate(groupId, newStatus);
    }
  };

  const renderContent = () => {
    if (isLoading || !groupData) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    switch (activeTab) {
      case "overview":
        return (
          <GroupOverview
            groupData={groupData}
            onEditName={() => setShowEditName(true)}
            onEditDescription={() => setShowEditDescription(true)}
          />
        );
      case "permission":
        if (currentUserRole !== "Leader" && currentUserRole !== "Admin") {
          return (
            <div className="p-6 text-center">
              <p className="text-black-normal">
                You do not have permission to view this page.
              </p>
            </div>
          );
        }
        return (
          <GroupPermissions
            groupId={groupId}
            isRestricted={groupData.is_restricted}
            onRestrictionUpdate={handleRestrictionUpdate}
          />
        );
      case "leave":
        return (
          <LeaveGroupConfirmation
            groupId={groupId}
            onCancel={() => setActiveTab("overview")}
            onLeaveSuccess={onLeaveSuccess}
          />
        );
      case "media":
        return <MediaTab groupId={groupId} />;
      case "files":
        return <FilesTab groupId={groupId} />;

      case "screen_sharing":
        return <ShareContentTab />
      default:
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold">{activeTab}</h3>
            <p className="text-black-normal text-center text-lg mt-2">
              Content for {activeTab} goes here.
            </p>
          </div>
        );
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-[589px] p-0 rounded-none"
          showCloseButton={false}
        >
          <div className="flex bg-white rounded-lg">
            {/* Sidebar */}
            <div className="w-44 bg-orange-light rounded-l-lg p-6 pl-2.5 flex flex-col justify-between">
              <div>
                {sidebarItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start text-black-normal gap-0 hover:bg-orange-light-hover text-xs font-medium mb-2 h-10 rounded-none ${
                      activeTab === item.id
                        ? "bg-orange-normal text-white-normal"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveTab(item.id);
                    }}
                  >
                    <span className="w-5 h-5 mr-1.5 flex items-center justify-center">
                      {item.icon}
                    </span>
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 rounded-full text-black-normal hover:bg-gray-100"
                  onClick={onClose}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
              {renderContent()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Nested modals */}
      {groupData && (
        <>
          <EditGroupName
            isOpen={showEditName}
            onClose={() => setShowEditName(false)}
            initialName={groupData.name}
            onSave={handleSaveName}
            isSaving={isUpdating}
          />
          <EditGroupDescription
            isOpen={showEditDescription}
            onClose={() => setShowEditDescription(false)}
            initialDescription={groupData.description}
            onSave={handleSaveDescription}
            isSaving={isUpdating}
          />
        </>
      )}
    </>
  );
};

export default GroupActionsPopup;
