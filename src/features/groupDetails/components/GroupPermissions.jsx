import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";

const GroupPermissions = () => (
  <div className="p-6">
    <h3 className="text-lg leading-7 font-semibold mb-7">Group Permissions</h3>
    <div className="space-y-6">
      <div>
        <h4 className="text-base font-medium mb-6">Members can</h4>
        <div className="space-y-4">
          <PermissionItem
            title="Edit Group Settings"
            description="This includes the name, icon, description, and the ability to pin, keep or unkeep messages"
            initialState={false}
          />
          <PermissionItem
            title="Send new messages"
            initialState={true}
          />
          <PermissionItem
            title="Add new members"
            initialState={true}
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
            initialState={true}
          />
          <PermissionItem
            title="Lock chat"
            description="Lock and hide this chat in this device."
            initialState={true}
          />
        </div>
      </div>
    </div>
  </div>
);

export default GroupPermissions;

const PermissionItem = ({ title, description, initialState }) => {
  const [isToggled, setIsToggled] = useState(initialState);
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#414141]">{title}</p>
        {description && (
          <p className="text-[10px] text-black-normal mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-black-normal">
          {isToggled ? "On" : "Off"}
        </span>
        <Switch checked={isToggled} onCheckedChange={setIsToggled} />
      </div>
    </div>
  );
};