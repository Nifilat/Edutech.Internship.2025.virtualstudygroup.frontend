import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const LeaveGroupConfirmation = ({ onCancel }) => {
  const [removeHistory, setRemoveHistory] = useState(false);
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
        />

        <label
          htmlFor="remove-history"
          className="text-xs text-black-normal font-medium mt-1"
        >
          Remove chat history
          <p className="text-[10px] text-black-normal mt-1.5">
            This will remove the chat from your list and search
          </p>
        </label>
      </div>
      <div className="flex justify-end space-x-4 mt-20">
        <Button
          variant="outline"
          className="text-orange-normal border-orange-normal rounded-[3px] font-medium text-sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          className="bg-orange-normal text-white-normal rounded-[3px] font-medium text-sm"
          onClick={() => {
            console.log("Leaving group...", { removeHistory });
            onCancel();
          }}
        >
          Leave
        </Button>
      </div>
    </div>
  );
};

export default LeaveGroupConfirmation;
