import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { AddTeam } from "./icons";
import { UserPlus, Link, LogOut, ChevronRight } from "lucide-react";
import { studyGroupAPI } from "@/lib/api";
import { Loader as Loader2 } from "lucide-react";
import ParticipantsList from "./ParticipantsList";
import { DeleteConfirmationPopup } from "./MemberActionsPopup";
import MemberActionsPopup from "./MemberActionsPopup";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const GroupParticipantsPopup = ({
  isOpen,
  onClose,
  groupId,
  onTriggerLeaveFlow,
}) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(null);

  const { getUser } = useAuth();
  const user = getUser();

  // fetch group details and members
  const fetchGroupDetails = async () => {
    if (!groupId) return;
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
      toast.error("Failed to fetch group participants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!groupId || !isOpen) return;
    fetchGroupDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, isOpen]);

  const handleParticipantsChange = async (newList) => {
    setParticipants(newList);

    try {
      await fetchGroupDetails();
    } catch (err) {
      console.error("Failed to refresh participants after adding", err);
    }
  };

  const onAddMember = async (selectedUser) => {
    try {
      const resp = await studyGroupAPI.addGroupMember(groupId, selectedUser.id);
      return resp;
    } catch (error) {
      console.error("Add member API error:", error);
      return {
        status: "error",
        message: error.response?.data?.message || "Request failed",
      };
    }
  };

  const handleMakeAdmin = async (member) => {
    if (!member || !groupId) return;
    setIsUpdatingAdmin(member.id); 
    setSelectedMember(null); 

    try {
      const response = await studyGroupAPI.toggleAdminStatus(groupId, member.id);
      toast.success(response.message || `${member.name} role updated.`);

      // Update the participant list locally
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === member.id ? { ...p, role: response.data.role } : p
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role.");
      console.error("Error making admin:", err);
    } finally {
      setIsUpdatingAdmin(null); 
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;

    try {
      await studyGroupAPI.removeGroupMember(groupId, memberToDelete.id);
      toast.success(`${memberToDelete.name} has been removed from the group`);

      // Update list
      setParticipants((prev) => prev.filter((p) => p.id !== memberToDelete.id));
    } catch (err) {
      toast.error("Failed to remove member");
    } finally {
      setShowDeleteConfirm(false);
      setMemberToDelete(null);
    }
  };

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
            <div
              className="overflow-y-auto space-y-[20px]"
              style={{ maxHeight: "calc(100vh - 400px)", minHeight: "200px" }}
            >
              {loading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-normal" />
                </div>
              ) : (
                participants.map((participant) => {
                  const isAdmin =
                    currentUserRole === "Leader" || currentUserRole === "Admin";
                  const canManage =
                    isAdmin &&
                    participant.role !== "Leader" &&
                    participant.id !== user?.id;

                  return (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between h-10 hover:bg-orange-light-hover px-4 rounded-[5px] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 rounded-full border">
                          <AvatarImage
                            src={participant.avatar}
                            alt={participant.name}
                          />
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

                        {isUpdatingAdmin === participant.id && (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                        )}

                        {canManage && isUpdatingAdmin !== participant.id && (
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
              {(currentUserRole === "Leader" ||
                currentUserRole === "Admin") && (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-black-normal hover:bg-gray-50 h-auto py-3 font-semibold"
                    onClick={() => setOpenAddModal(true)}
                  >
                    <AddTeam className="w-5 h-5 mr-3" stroke="#141B34" />
                    Add people
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-black-normal hover:bg-gray-50 font-semibold h-auto py-3"
                  >
                    <Link className="w-5 h-5 mr-3" />
                    Invite to group via link
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                className="w-full justify-start font-semibold text-red-600 hover:bg-red-50 h-auto py-3"
                onClick={onTriggerLeaveFlow}
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
              onParticipantsChange={handleParticipantsChange}
              onClose={() => setOpenAddModal(false)}
              onAddMember={onAddMember}
            />
          </DialogContent>
        </Dialog>
      )}

      <MemberActionsPopup
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        onMakeAdmin={() => handleMakeAdmin(selectedMember)}
        onRemoveMember={() => {
          setMemberToDelete(selectedMember);
          setShowDeleteConfirm(true);
          setSelectedMember(null);
        }}
      />

      <DeleteConfirmationPopup
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setMemberToDelete(null);
        }}
        member={memberToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  );
};

export default GroupParticipantsPopup;
