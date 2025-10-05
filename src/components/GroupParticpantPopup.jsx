import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { UserPlus, Link, LogOut, ChevronRight } from "lucide-react";
import { studyGroupAPI } from "@/lib/api";
import { Loader as Loader2 } from "lucide-react";
import ParticipantsList from "./ParticipantsList";
import MemberActionsPopup from "./MemberActionsPopup";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const GroupParticipantsPopup = ({ isOpen, onClose, groupId }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const { getUser } = useAuth();
  const user = getUser();

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
          first_name: m.user.first_name,
          last_name: m.user.last_name,
          name: `${m.user.first_name} ${m.user.last_name}`,
          avatar: m.user.avatar_url,
          role: m.role,
        }));

        const currentMember = formatted.find((m) => m.id === user?.id);
        setCurrentUserRole(currentMember?.role || null);
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
          <div className="bg-white rounded-4xl">
            {/* Header */}
            <div className="p-4 mt-9 border-b border-gray-100">
              <h2 className="text-base font-semibold text-black-normal">
                course mates ({participants.length})
              </h2>
            </div>

            {/* Participants List */}
            <div className="overflow-y-auto space-y-[20px]" style={{ maxHeight: "calc(100vh - 400px)", minHeight: "200px" }}>
              {loading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-normal" />
                </div>
              ) : (
                participants.map((participant) => {
                  const isAdmin = currentUserRole === "Leader" || currentUserRole === "Admin";
                  const canManage = isAdmin && participant.role !== "Leader" && participant.id !== user?.id;

                  return (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between h-10 hover:bg-orange-light-hover px-4 rounded-[5px] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-7.5 h-7.5 rounded-full border">
                          <AvatarImage src={participant.avatar} alt={participant.name} />
                          <AvatarFallback className="bg-orange-200 text-orange-800 text-sm">
                            {participant?.name
                              ? participant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                              : (participant?.first_name?.[0] || "") +
                              (participant?.last_name?.[0] || "")}
                          </AvatarFallback>
                        </Avatar>

                        <span className="text-base font-medium text-black-normal">
                          {participant.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {["Leader", "Admin"].includes(participant.role) && (
                          <span className="text-[10px] text-black-normal font-medium">
                            {participant.role}
                          </span>
                        )}

                        {canManage && (
                          <button
                            onClick={() => setSelectedMember(participant)}
                            className="p-1 rounded transition-colors"
                          >
                            <ChevronRight className="w-5 h-4 text-black-normal cursor-pointer" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
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
              participants={participants.map((p) => ({
                id: p.id,
                first_name: p.first_name || "",
                last_name: p.last_name || "",
                avatar_url: p.avatar,
              }))}
              onParticipantsChange={(newList) => setParticipants(newList)}
              onClose={() => setOpenAddModal(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      <MemberActionsPopup
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        onMakeAdmin={() => {
          toast.success(`${selectedMember?.name} is now an admin`);
          setSelectedMember(null);
        }}
        onRemoveMember={() => {
          toast.success(`${selectedMember?.name} has been removed from the group`);
          setSelectedMember(null);
        }}
      />
    </>
  );
};

export default GroupParticipantsPopup;