import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { BsPlusCircle } from "react-icons/bs";

function ParticipantsList({ 
  participants, 
  availableParticipants, 
  onParticipantsChange, 
  onClose 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([...participants]);

  // Filter available participants based on search query and exclude already selected ones
  const filteredParticipants = useMemo(() => {
    return availableParticipants.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.username.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [availableParticipants, searchQuery]);

  const handleAddParticipant = (participant) => {
    if (!selectedParticipants.find(p => p.id === participant.id)) {
      setSelectedParticipants([...selectedParticipants, participant]);
    }
  };

  const handleRemoveParticipant = (participantId) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.id !== participantId));
  };

  const handleAdd = () => {
    onParticipantsChange(selectedParticipants);
    onClose();
  };

  const handleCancel = () => {
    setSelectedParticipants([...participants]); // Reset to original
    onClose();
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-lg font-semibold">Participants</h2>
        <Button
          variant="outline"
          onClick={handleCancel}
          className="bg-[#D2401E] hover:bg-[#B5361A] text-white border-0 px-4 py-2"
        >
          Cancel
        </Button>
      </div>

      <div className="p-6 space-y-4">
        {/* Selected Participants Tags */}
        {selectedParticipants.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm"
              >
                <span>{participant.name}</span>
                <button
                  onClick={() => handleRemoveParticipant(participant.id)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
              <path
                d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="G"
            className="pl-10 bg-[#FCFCFC] border border-[#E9E9E9]"
          />
        </div>

        {/* Participants List */}
        <div className="max-h-64 overflow-y-auto space-y-3">
          {filteredParticipants.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No participants found
            </p>
          ) : (
            filteredParticipants.map((participant) => {
              const isSelected = selectedParticipants.find(p => p.id === participant.id);
              return (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-[#FCFCFC] border border-[#E9E9E9] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{participant.name}</p>
                      <p className="text-xs text-gray-500">{participant.username}</p>
                    </div>
                  </div>
                  <Button
  size="sm"
  onClick={() => handleAddParticipant(participant)}
  disabled={isSelected}
  className={`w-8 h-8 p-0  ${
    isSelected 
      ? "border-gray-300 text-gray-300"
      : "border-[#D2401E] text-[#D2401E] hover:text-[#B5361A] hover:border-[#B5361A]"
  } bg-transparent`}
>
  <BsPlusCircle className="w-11 h-11" />
</Button>

                </div>
              );
            })
          )}
        </div>

        {/* Add Button */}
        <div className="pt-4">
          <Button
            onClick={handleAdd}
            className="w-full bg-[#D2401E] hover:bg-[#B5361A] text-white"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ParticipantsList;