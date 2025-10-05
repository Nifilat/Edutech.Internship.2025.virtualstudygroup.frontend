import React from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Crown, UserMinus, X } from "lucide-react";

const MemberActionsPopup = ({ isOpen, onClose, member, onMakeAdmin, onRemoveMember }) => {
    if (!member) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xs p-0 gap-0" showCloseButton={false}>
                <DialogTitle className="sr-only">Member Actions</DialogTitle>
                <div className="bg-white rounded-lg">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center">
                            <Avatar className="w-10 h-10 mr-3">
                                <AvatarImage
                                    src={member.avatar}
                                    alt={member.name}
                                />
                                <AvatarFallback className="bg-orange-200 text-orange-800 text-sm">
                                    {member?.name
                                        ? member.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                        : (member?.first_name?.[0] || "") + (member?.last_name?.[0] || "")}
                                </AvatarFallback>

                            </Avatar>
                            <span className="text-base font-medium text-black-normal">
                                {member.name}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-black-normal hover:bg-gray-50 h-auto py-3 font-normal rounded-lg mb-1"
                            onClick={onMakeAdmin}
                        >
                            <Crown className="w-5 h-5 mr-3" />
                            Make group admin
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full justify-start text-black-normal hover:bg-red-50 hover:text-red-600 h-auto py-3 font-normal rounded-lg"
                            onClick={onRemoveMember}
                        >
                            <UserMinus className="w-5 h-5 mr-3" />
                            Remove from group
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MemberActionsPopup;
