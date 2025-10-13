import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X, Plus, Search } from "lucide-react";
import { useUsers, useParticipantSearch } from "@/hooks/useStudyGroup";
import { toast } from "sonner";

function ParticipantsList({
  participants,
  onParticipantsChange,
  onClose,
  onAddMember, 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([
    ...participants,
  ]);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [adding, setAdding] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get data
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers();
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useParticipantSearch(debouncedSearchQuery);

  const isSearching = debouncedSearchQuery.trim().length > 0;
  const displayData = isSearching ? searchData : usersData;
  const isLoading = isSearching ? searchLoading : usersLoading;
  const error = isSearching ? searchError : usersError;

  useEffect(() => {
    if (error) toast.error("Failed to load users. Please try again.");
  }, [error]);

  const handleImageError = (participantId) =>
    setImageErrors((prev) => new Set([...prev, participantId]));

  const handleAddParticipant = (participant) => {
    if (!selectedParticipants.find((p) => p.id === participant.id)) {
      setSelectedParticipants([...selectedParticipants, participant]);
    }
  };

  const handleRemoveParticipant = (participantId) =>
    setSelectedParticipants(selectedParticipants.filter((p) => p.id !== participantId));

  const handleAdd = async () => {
    try {
      const newMembers = selectedParticipants.filter(
        (sp) => !participants.some((p) => p.id === sp.id)
      );
  
      if (newMembers.length === 0) {
        toast.info("No new members to add");
        return;
      }
  
      let allSuccess = true;
  
      for (const member of newMembers) {
        if (onAddMember) {
          const response = await onAddMember(member);
  
          // ✅ Fail immediately if backend returns error
          if (!response?.member) {
            allSuccess = false;
            throw new Error(response?.message || "Failed to add member");
          }
        }
      }
  
      if (allSuccess) {
        toast.success("Members added successfully");
        onParticipantsChange(selectedParticipants);
        onClose();
      }
    } catch (err) {
      console.error("Error adding members:", err);
      toast.error(err.message || "Failed to add new members");
    }
  };
  

  const handleCancel = () => {
    setSelectedParticipants([...participants]);
    onClose();
  };

  const renderAvatar = (participant, size = "w-12 h-12") => {
    const initials = `${participant.first_name?.[0] || ""}${participant.last_name?.[0] || ""
      }`.toUpperCase();
    const hasValidAvatar =
      participant.avatar_url && !imageErrors.has(participant.id);

    if (hasValidAvatar) {
      return (
        <img
          src={participant.avatar_url}
          alt={`${participant.first_name} ${participant.last_name}`}
          className={`${size} rounded-full object-cover`}
          onError={() => handleImageError(participant.id)}
        />
      );
    }

    return (
      <div
        className={`${size} bg-orange-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700`}
      >
        {initials}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-medium text-black">Participants</h2>
        <Button
          variant="outline"
          onClick={handleCancel}
          className="bg-orange-normal hover:bg-orange-normal-hover text-white-normal border-0 px-4 py-2 rounded-md"
        >
          Cancel
        </Button>
      </div>

      <div className="p-6 space-y-4">
        {/* Selected Participants */}
        {selectedParticipants.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700"
              >
                <span>{`${participant.first_name} ${participant.last_name}`}</span>
                <button
                  onClick={() => handleRemoveParticipant(participant.id)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="relative mb-6">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search participants..."
            className="pl-10 bg-gray-50 border border-gray-200 rounded-lg h-12 focus:border-[#D2401E] focus:ring-[#D2401E]"
          />
        </div>

        {/* Participants List */}
        <div className="max-h-80 overflow-y-auto space-y-3 mb-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-normal mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">
                {isSearching ? "Searching..." : "Loading users..."}
              </p>
            </div>
          ) : displayData && displayData.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              {isSearching
                ? "No users found matching your search"
                : "No users found"}
            </p>
          ) : !displayData ? (
            <p className="text-sm text-gray-500 text-center py-8">
              {error ? "Failed to load users" : "No users available"}
            </p>
          ) : (
            displayData.map((participant) => {
              const isSelected = selectedParticipants.find(
                (p) => p.id === participant.id
              );

              return (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {renderAvatar(participant)}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {`${participant.first_name} ${participant.last_name}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {participant.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddParticipant(participant)}
                    disabled={isSelected}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                        ? "border-gray-300 text-gray-300 cursor-not-allowed"
                        : "border-[#D2401E] text-[#D2401E] hover:bg-[#D2401E] hover:text-white hover:scale-105"
                      }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Add Button */}
        <div className="pt-4 grid place-items-center">
          <Button
            onClick={handleAdd}
            className="w-2/5 bg-orange-normal hover:bg-orange-normal-hover text-white-normal h-10 font-medium rounded-lg"
            disabled={adding}
          >
            {adding ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ParticipantsList;
