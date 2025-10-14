import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { studyGroupAPI } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const LeaveGroupConfirmation = ({ groupId, onCancel, onLeaveSuccess }) => {
  const [removeHistory, setRemoveHistory] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveGroup = async () => {
    if (!groupId) return;
    setIsLeaving(true);
    try {
      const response = await studyGroupAPI.leaveStudyGroup(groupId);
      toast.success(
        response.message || "You have left the group successfully."
      );
      if (onLeaveSuccess) {
        onLeaveSuccess(groupId);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to leave the group.";
      toast.error(errorMessage);
      console.error("Error leaving group:", error);
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="p-2">
      <h3 className="text-base font-medium mb-4 leading-7">
        Are you sure you want to Leave the group?
      </h3>
      <div className="flex items-start justify-start mb-6">
        <Checkbox
          id="remove-history"
          checked={removeHistory}
          onCheckedChange={(checked) => setRemoveHistory(checked)}
          className="mr-2 mt-1 border-black-normal"
          disabled={true} // Disabled as per backend limitation
        />

        <label
          htmlFor="remove-history"
          className="text-xs text-black-normal font-medium mt-1"
        >
          Remove chat history
          <p className="text-[10px] text-black-normal mt-1.5">
            This will remove the chat from your list and search. (Feature not
            available yet)
          </p>
        </label>
      </div>
      <div className="flex justify-end space-x-4 mt-20">
        <Button
          variant="outline"
          className="text-orange-normal border-orange-normal rounded-[3px] font-medium text-sm"
          onClick={onCancel}
          disabled={isLeaving}
        >
          Cancel
        </Button>
        <Button
          className="bg-orange-normal hover:bg-orange-normal-hover text-white-normal rounded-[3px] font-medium text-sm"
          onClick={handleLeaveGroup}
          disabled={isLeaving}
        >
          {isLeaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Leaving...
            </>
          ) : (
            "Leave"
          )}
        </Button>
      </div>
    </div>
  );
};

export default LeaveGroupConfirmation;
