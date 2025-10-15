import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";

const EditGroupDescription = ({
  isOpen,
  onClose,
  initialDescription,
  onSave,
  isSaving,
}) => {
  const [description, setDescription] = useState(initialDescription);

  React.useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-96 p-6 rounded-none w-full">
        <DialogTitle className="text-black text-base font-medium mb-3">
          Description
        </DialogTitle>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-4 text-black-normal text-base rounded-[6px] bg-grey-light-active border-transparent transition-all duration-200 focus:bg-white focus:!border-orange-normal-active  focus-visible:!border-orange-normal-activefocus:shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="border border-orange-normal text-sm font-medium text-orange-normal rounded-[3px]"
          >
            Cancel
          </Button>
          <Button
            className="bg-orange-normal text-white-normal text-sm font-medium rounded-[3px]"
            onClick={() => onSave(description)}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupDescription;
