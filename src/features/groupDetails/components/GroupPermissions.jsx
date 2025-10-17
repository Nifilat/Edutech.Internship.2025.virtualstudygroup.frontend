import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { permissionsAPI } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const GroupPermissions = ({ groupId, isRestricted, onRestrictionUpdate }) => {
  const [isLocking, setIsLocking] = useState(false);

  const handleLockChatToggle = async () => {
    if (!groupId || isLocking) return;
    setIsLocking(true);
    try {
      const response = await permissionsAPI.limitMessages(groupId);
      toast.success(response.message || "Group restriction updated.");
      if (onRestrictionUpdate && response.data) {
        onRestrictionUpdate(response.data.is_restricted);
      }
    } catch (error) {
      toast.error("Failed to update chat restriction.");
      console.error("Error toggling chat restriction:", error);
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg leading-7 font-semibold mb-7">
        Group Permissions
      </h3>
      <div className="space-y-6">
        <div>
          <h4 className="text-base font-medium mb-6">Members can</h4>
          <div className="space-y-4">
            <PermissionItem
              title="Edit Group Settings"
              description="This includes the name, icon, description, and the ability to pin, keep or unkeep messages"
              isToggled={false} // Assuming this is static for now
              onToggle={() => {}} // No action
            />
            <PermissionItem
              title="Send new messages"
              isToggled={true} // Assuming this is static for now
              onToggle={() => {}} // No action
            />
            <PermissionItem
              title="Invite new members"
              isToggled={false} // Assuming this is static for now
              onToggle={() => {}} // No action
            />
          </div>
        </div>
        <div>
          <hr className="my-6" />
          <h4 className="text-base font-medium mb-4">Admins can</h4>
          <div className="space-y-4">
            <PermissionItem
              title="Approve new members"
              description="When turned on, admins must approve anyone who wants to join the group."
              isToggled={true} // Assuming this is static for now
              onToggle={() => {}} // No action
            />
            <PermissionItem
              title="Lock chat"
              description="When turned on, only admins can send messages in the group."
              isToggled={isRestricted}
              onToggle={handleLockChatToggle}
              disabled={isLocking}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPermissions;

const PermissionItem = ({
  title,
  description,
  isToggled,
  onToggle,
  disabled = false,
}) => (
  <div className="flex items-center justify-between gap-5">
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-[#414141]">{title}</p>
      {description && (
        <p className="text-[10px] text-black-normal mt-1">{description}</p>
      )}
    </div>
    <div className="flex items-center space-x-2">
      <span className="text-xs text-black-normal">
        {disabled ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isToggled ? (
          "On"
        ) : (
          "Off"
        )}
      </span>
      <Switch
        checked={isToggled}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
    </div>
  </div>
);
