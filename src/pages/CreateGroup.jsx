import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AiOutlinePlus } from "react-icons/ai";
import { mockParticipants } from "../data/participants";
import { addStudyGroup } from "../data/studyGroup";
import ParticipantsList from "@/components/ParticipantsList";
import { toast } from "sonner";

const CreateGroup = ({ onGroupCreated }) => { // Added prop
  const [groupName, setGroupName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [participants, setParticipants] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const courses = [
    "Criminal Law",
    "Constitutional Law",
    "Contract Law",
    "Tort Law",
    "Administrative Law",
  ];

  const handleCreateGroup = () => {
    try {
      // Debug: Log before creating group
      console.log('Creating group with data:', {
        groupName,
        selectedCourse,
        groupDescription,
        participants,
      });

      const newGroup = {
        groupName,
        selectedCourse,
        groupDescription,
        participants,
      };

      // Add the group to mock data
      const createdGroup = addStudyGroup(newGroup);
      console.log('Group created:', createdGroup);

      // Debug: Log before showing toast
      console.log('About to show toast...');
      
      // Show toast BEFORE clearing form (in case form clearing affects anything)
      toast.success('Group created successfully!');
      
      // Debug: Log after showing toast
      console.log('Toast should have been shown');

      // Clear form
      handleCancel();

      // Notify parent component if callback provided
      if (onGroupCreated) {
        onGroupCreated(createdGroup);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group. Please try again.');
    }
  };

  const handleCancel = () => {
    setGroupName("");
    setSelectedCourse("");
    setGroupDescription("");
    setParticipants([]);
  };

  const eligibleParticipants = mockParticipants.filter(
    (p) => p.course === selectedCourse
  );

  const handleParticipantsChange = (newParticipants) => {
    setParticipants(newParticipants);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Create Group</h1>
        <Button
          className="bg-orange-normal hover:bg-orange-dark text-white"
          onClick={() => setOpenModal(true)}
        >
          <AiOutlinePlus className="w-5 h-5" />
          Add Participant
        </Button>
      </div>

      {/* Main Form */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Group Name */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="group-name" className="text-sm font-medium">
                Group Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="group-name"
                placeholder="Enter Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-[#FCFCFC] border border-[#E9E9E9]"
              />
            </div>
          </div>

          {/* Right Column - Course Selection */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="select-course" className="text-sm font-medium">
                Select Course <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full bg-[#FCFCFC] border border-[#E9E9E9]">
                  <SelectValue placeholder="Criminal Law" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem
                      key={course}
                      value={course.toLowerCase().replace(" ", "-")}
                    >
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Group Description */}
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="group-description" className="text-sm font-medium">
              Group Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="group-description"
              placeholder="Description..."
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="w-full min-h-[150px] resize-none bg-[#FCFCFC] border border-[#E9E9E9]"
            />
          </div>
        </div>

        {/* Selected Participants Display */}
        {participants.length > 0 && (
          <div className="mt-6">
            <Label className="text-sm font-medium mb-3 block">
              Selected Participants ({participants.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {participant.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-8 bg-[#E3E3E3]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            className="bg-orange-normal hover:bg-orange-dark text-white px-8"
            disabled={!groupName || !selectedCourse || !groupDescription}
          >
            Create Group
          </Button>
        </div>
      </div>

      {/* Add Participant Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-md p-0 gap-0" showCloseButton={false}>
          <ParticipantsList
            participants={participants}
            availableParticipants={eligibleParticipants}
            onParticipantsChange={handleParticipantsChange}
            onClose={() => setOpenModal(false)}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default CreateGroup;