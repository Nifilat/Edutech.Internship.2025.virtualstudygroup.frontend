import React, { useState, useEffect } from "react";
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
import { studyGroupAPI } from "../lib/api";
import ParticipantsList from "@/components/ParticipantsList";
import { toast } from "sonner";
import { Add } from "../components/icons";

const CreateGroup = ({ onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [participants, setParticipants] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setFetchingCourses(true);
      try {
        const data = await studyGroupAPI.getCourses();
        console.log("Courses response:", data);

        // Handle both response structures
        const coursesList = Array.isArray(data) ? data : data?.data || [];
        setCourses(coursesList);

        if (coursesList.length === 0) {
          toast.info("No courses available");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);

        // Check if it's a 403 but data was still returned
        if (error.response?.status === 403) {
          toast.warning("Authorization issue, but courses were loaded");
          // Try to extract data from error response
          const coursesList = error.response?.data || [];
          if (Array.isArray(coursesList) && coursesList.length > 0) {
            setCourses(coursesList);
          }
        } else {
          toast.error("Failed to load courses. Please try again.");
        }
      } finally {
        setFetchingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCreateGroup = async () => {
    if (
      !groupName.trim() ||
      !selectedCourse ||
      !groupDescription.trim() ||
      participants.length === 0 // 👈 must have at least one participant
    ) {
      toast.error(
        "Please fill in all required fields and add at least one participant"
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        group_name: groupName.trim(),
        course_id: selectedCourse,
        description: groupDescription.trim(),
        members: participants.map((p) => p.id),
      };

      console.log("Create group payload:", payload);

      const response = await studyGroupAPI.create(payload);

      toast.success(response.message || "Group created successfully!");
      handleCancel();

      if (onGroupCreated) {
        onGroupCreated(response.group || response.data);
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create group. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setGroupName("");
    setSelectedCourse("");
    setGroupDescription("");
    setParticipants([]);
  };

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
          <Add className="w-5 h-5" />
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
              <Select
                value={selectedCourse}
                onValueChange={setSelectedCourse}
                disabled={fetchingCourses}
              >
                <SelectTrigger className="w-full bg-white-normal border border-[#E9E9E9]">
                  <SelectValue
                    placeholder={
                      fetchingCourses ? "Loading courses..." : "Select Course"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.course_code} - {course.course_name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      No courses available
                    </div>
                  )}
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
                  {participant.first_name} {participant.last_name}
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
            disabled={
              !groupName ||
              !selectedCourse ||
              !groupDescription ||
              participants.length === 0 ||
              loading
            }
          >
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </div>

      {/* Add Participant Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-md p-0 gap-0" showCloseButton={false}>
          <ParticipantsList
            participants={participants}
            onParticipantsChange={handleParticipantsChange}
            onClose={() => setOpenModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateGroup;
