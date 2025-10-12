import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import {
  ArrowLeft,
  Users,
  BellOff,
  Loader2,
  Settings,
  Image,
  File,
  Link,
  LogOut,
  Monitor,
  Info
} from "lucide-react";
import { studyGroupAPI } from "@/lib/api";
import { toast } from "sonner";
import GroupOverview from "../features/groupDetails/components/GroupOverview";
import GroupPermissions from "../features/groupDetails/components/GroupPermissions";
// import LeaveConfirmationPopup from "./LeaveConfirmationPopup";
import EditGroupName from "../features/groupDetails/components/EditGroupName";
import EditGroupDescription from "../features/groupDetails/components/EditGroupDescription";
import { formatGroupOverviewDateTime } from "@/lib/formatMessageTime";

// Icons for the sidebar
const sidebarItems = [
  { id: "overview", label: "Overview", icon: <Info /> },
  { id: "screen_sharing", label: "Screen sharing", icon: <Monitor /> },
  { id: "media", label: "Media", icon: <Image /> },
  { id: "files", label: "Files", icon: <File /> },
  { id: "links", label: "Links", icon: <Link /> },
  { id: "mute", label: "Mute", icon: <BellOff /> },
  { id: "permission", label: "Permission", icon: <Settings /> },
  { id: "leave", label: "Leave", icon: <LogOut /> },
];

const GroupActionsPopup = ({ isOpen, onClose, groupId }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [showEditDescription, setShowEditDescription] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
        });
      } catch (error) {
        toast.error("Failed to fetch group details.");
        console.error("Error fetching group details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroupData();
  }, [groupId, isOpen]);

  const handleSaveName = (newName) => {
    // API call to save new name
    toast.success("Group name updated successfully.");
    setGroupData((prev) => ({ ...prev, name: newName }));
    setShowEditName(false);
  };

  const handleSaveDescription = (newDescription) => {
    // API call to save new description
    toast.success("Group description updated successfully.");
    setGroupData((prev) => ({ ...prev, description: newDescription }));
    setShowEditDescription(false);
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
            return <GroupPermissions />;
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
        <DialogContent className="max-w-4xl p-0" showCloseButton={false}>
          <div className="flex bg-white rounded-lg">
            {/* Sidebar */}
            <div className="w-64 bg-orange-light rounded-l-lg p-4 flex flex-col justify-between">
              <div>
                {sidebarItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start text-black-normal font-medium mb-2 h-10 rounded-none ${
                      activeTab === item.id ? "bg-orange-normal text-white-normal" : ""
                    }`}
                    onClick={() => {
                      if (item.id === "leave") {
                        setShowLeaveConfirm(true);
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                  >
                    <span className="w-5 h-5 mr-3 flex items-center justify-center">
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
      {/* <LeaveConfirmationPopup
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
      /> */}
      {groupData && (
        <>
          <EditGroupName
            isOpen={showEditName}
            onClose={() => setShowEditName(false)}
            initialName={groupData.name}
            onSave={handleSaveName}
          />
          <EditGroupDescription
            isOpen={showEditDescription}
            onClose={() => setShowEditDescription(false)}
            initialDescription={groupData.description}
            onSave={handleSaveDescription}
          />
        </>
      )}
    </>
  );
};

export default GroupActionsPopup;