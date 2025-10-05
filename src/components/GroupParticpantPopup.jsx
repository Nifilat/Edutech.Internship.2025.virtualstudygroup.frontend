import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { UserPlus, Link, LogOut } from "lucide-react";
import { studyGroupAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";
import ParticipantsList from "./ParticipantsList";

const GroupParticipantsPopup = ({ isOpen, onClose, groupId }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  useEffect(() => {
    if (!groupId || !isOpen) return;

    const fetchGroupDetails = async () => {
      setLoading(true);
      try {
        const { data } = await studyGroupAPI.getGroupDetails(groupId);
        const members = data?.members || [];

        // Sort leader first
        const sortedMembers = members.sort((a, b) => {
          if (a.role === "Leader") return -1;
          if (b.role === "Leader") return 1;
          return 0;
        });

        const formatted = sortedMembers.map((m) => ({
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
    <>
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
                    <div className="flex justify-between w-full">
                      <span className="text-base font-medium text-black-normal">
                        {participant.name}
                      </span>
                      <span className="text-[10px] text-black-normal font-medium">
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
                className="w-full justify-start text-black-normal hover:bg-gray-50 h-auto py-3 font-semibold"
                onClick={() => setOpenAddModal(true)}
              >
                <UserPlus className="w-5 h-5 mr-3" />
                Add people
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-black-normal hover:bg-gray-50 font-semibold h-auto py-3"
              >
                <Link className="w-5 h-5 mr-3" />
                Invite to group via link
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start font-semibold text-red-600 hover:bg-red-50 h-auto py-3"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Leave
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {openAddModal && (
        <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
          <DialogContent showCloseButton={false} className="max-w-md p-0">
            <ParticipantsList
              participants={participants.map((p) => {
                const [first, last = ""] = (p.name || "").split(" ");
                return {
                  id: p.id,
                  first_name: first,
                  last_name: last,
                  avatar_url: p.avatar,
                };
              })}
              onParticipantsChange={(newList) => setParticipants(newList)}
              onClose={() => setOpenAddModal(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default GroupParticipantsPopup;
