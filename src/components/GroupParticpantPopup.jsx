import React from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { UserPlus, Link, LogOut } from "lucide-react";

const GroupParticipantsPopup = ({
  isOpen,
  onClose,
  participants = [],
  groupName,
}) => {
  const mockParticipants = [
    { id: 1, name: "Jerry Adison", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Jerry Adison", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, name: "Jerry Adison", avatar: "https://i.pravatar.cc/150?img=3" },
    { id: 4, name: "Jerry Adison", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 5, name: "Jerry Adison", avatar: "https://i.pravatar.cc/150?img=5" },
    { id: 6, name: "Jerry Adison", avatar: "https://i.pravatar.cc/150?img=6" },
    { id: 7, name: "Jerry Adison", avatar: "https://i.pravatar.cc/150?img=7" },
  ];

  const displayParticipants =
    participants.length > 0 ? participants : mockParticipants;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 gap-0" showCloseButton={false}>
        <div className="bg-white rounded-lg">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              course mates ({displayParticipants.length})
            </h2>
          </div>

          {/* Participants List */}
          <div className="max-h-80 overflow-y-auto">
            {displayParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center p-3 hover:bg-gray-50"
              >
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarImage
                    src={participant.avatar}
                    alt={participant.name}
                  />
                  <AvatarFallback className="bg-orange-200 text-orange-800 text-sm">
                    {participant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-900">
                  {participant.name}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-100 space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-gray-50 h-auto py-3"
            >
              <UserPlus className="w-5 h-5 mr-3" />
              Add people
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-gray-50 h-auto py-3"
            >
              <Link className="w-5 h-5 mr-3" />
              Invite to group via link
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 h-auto py-3"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Leave
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupParticipantsPopup;
