import React from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { UsersCheck, UserMinus } from "./icons";
import { X } from "lucide-react";

const MemberActionsPopup = ({
  isOpen,
  onClose,
  member,
  onMakeAdmin,
  onRemoveMember,
}) => {
  if (!member) return null;

  const isAdmin = member.role === "Admin";
  const actionText = isAdmin ? "Remove admin role" : "Make group admin";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs p-0 gap-0" showCloseButton={false}>
        <DialogTitle className="sr-only">Member Actions</DialogTitle>
        <div className="bg-white">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="w-10 h-10 mr-3">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="bg-orange-200 text-orange-800 text-sm">
                  {member?.name
                    ? member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : (member?.first_name?.[0] || "") +
                      (member?.last_name?.[0] || "")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-black-normal">{member.name}</span>
            </div>
            <button
              onClick={onClose}
              className="w-5 h-5 rounded-full flex items-center justify-center border border-orange-light-active text-black-normal hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-between text-black-normal hover:bg-orange-light-hover h-auto py-3 font-normal rounded-[5px] mb-1"
              onClick={onMakeAdmin}
            >
              {actionText}
              <UsersCheck className=" mr-3" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between text-black-normal hover:bg-orange-light-hover h-auto py-3 font-normal rounded-[5px]"
              onClick={onRemoveMember}
            >
              Remove from group
              <UserMinus className=" mr-3" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberActionsPopup;


export const DeleteConfirmationPopup = ({
  isOpen,
  onClose,
  member,
  onConfirmDelete,
}) => {
  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs p-0 gap-0" showCloseButton={false}>
        <DialogTitle className="sr-only">Confirm Removal</DialogTitle>
        <div className="bg-white">

          <div className="p-4">
            <p className="text-[10px] font-medium leading-7 text-black-normal mb-4">
              Are you sure you want to remove {member.name} from the group?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                className="text-black-normal border border-orange-normal text-xs hover:bg-gray-100 rounded-[3px]"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="bg-orange-normal text-white-normal text-xs hover:bg-orange-normal-hover rounded-[3px]"
                onClick={onConfirmDelete}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
