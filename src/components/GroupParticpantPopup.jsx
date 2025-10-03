import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { UserPlus, Link, LogOut } from "lucide-react";
import { studyGroupAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

const GroupParticipantsPopup = ({ isOpen, onClose, groupId }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!groupId || !isOpen) return;

    const fetchGroupDetails = async () => {
      setLoading(true);
      try {
        const { data } = await studyGroupAPI.getGroupDetails(groupId);
        const members = data?.members || [];

        const formatted = members.map((m) => ({
          id: m.user.id,
          name: `${m.user.first_name} ${m.user.last_name}`,
          avatar: m.user.avatar_url,
          role: m.role,
        }));

        setParticipants(formatted);
      } catch (err) {
        console.error("Error fetching group details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 gap-0" showCloseButton={false}>
        <div className="bg-white rounded-lg">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              course mates ({participants.length})
            </h2>
          </div>

          {/* Participants List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-orange-normal" />
              </div>
            ) : (
              participants.map((participant) => (
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
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {participant.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {participant.role}
                    </span>
                  </div>
                </div>
              ))
            )}
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
