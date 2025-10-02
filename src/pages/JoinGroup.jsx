import React, { useState } from "react";
import { Search, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateGroup from "./CreateGroup";
import JoinGroupPopup from "@/components/JoinGroupPopup";
import { useStudyRoomsWithCourses, useJoinGroup } from "@/hooks/useStudyGroup";
import { toast } from "sonner";

const JoinGroup = ({ onCreateGroupClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [joiningGroupId, setJoiningGroupId] = useState(null); 

  const { data: studyGroups, isLoading, error } = useStudyRoomsWithCourses();
  const joinGroupMutation = useJoinGroup();

  const filteredGroups = studyGroups.filter(
    (group) =>
      group.group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.course_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinRoom = async (groupId) => {
    setJoiningGroupId(groupId); 
    try {
      await joinGroupMutation.mutateAsync(groupId);
      setSelectedGroupId(groupId);
      setShowJoinPopup(true);
      toast.success("Join request sent successfully!");
    } catch (err) {
      console.error("Error joining group:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to send join request. Please try again."
      );
    } finally {
      setJoiningGroupId(null); // Clear the joining state
    }
  };

  const handleCancelRequest = () => {
    console.log("Cancelling request for group:", selectedGroupId);
    setShowJoinPopup(false);
    setSelectedGroupId(null);
    toast.info("Request cancelled");
  };

  const handleClosePopup = () => {
    setShowJoinPopup(false);
    setSelectedGroupId(null);
  };

  const handleCreateGroupClick = () => {
    if (onCreateGroupClick) {
      onCreateGroupClick();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Tabs defaultValue="study-rooms" className="w-full">
        <div className="border-t border-b border-gray-200">
          <TabsList className="h-auto p-0 bg-transparent border-0 space-x-8 -mb-px">
            <TabsTrigger
              value="study-rooms"
              className="py-2 px-1 border-b-2 border-t-0 border-l-0 border-r-0 font-medium text-lg data-[state=active]:border-b-orange-normal data-[state=active]:text-orange-normal data-[state=inactive]:border-b-transparent data-[state=inactive]:text-black hover:text-gray-700 hover:border-b-gray-300 bg-transparent data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent data-[state=active]:shadow-none data-[state=inactive]:shadow-none rounded-none ring-0 focus-visible:ring-0 outline-none"
            >
              Study rooms
            </TabsTrigger>
            <TabsTrigger
              value="create-group"
              onClick={handleCreateGroupClick}
              className="py-2 px-1 border-b-2 border-t-0 border-l-0 border-r-0 font-medium text-lg data-[state=active]:border-b-orange-500 data-[state=active]:text-orange-500 data-[state=inactive]:border-b-transparent data-[state=inactive]:text-black hover:text-gray-700 hover:border-b-gray-300 bg-transparent data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent data-[state=active]:shadow-none data-[state=inactive]:shadow-none rounded-none ring-0 focus-visible:ring-0 outline-none"
            >
              Create Group
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="study-rooms" className="space-y-6 mt-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search for rooms (course code, name)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full max-w-lg bg-gray-50 border-gray-200 placeholder:text-xs placeholder:text-black-light-active"
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-normal" />
              <span className="ml-2 text-gray-600">Loading study rooms...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">
                Failed to load study rooms. Please try again.
              </p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="space-y-4">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-black-normal">
                          {group.group_name}
                        </h3>
                        <span className="text-sm font-medium text-orange-normal bg-orange-50 px-3 py-1 rounded">
                          {group.course_code}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {group.course_name}
                      </p>
                      <p className="text-gray-600 text-sm mb-4">
                        {group.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>ID: {group.id}</span>
                        <span>
                          Created:{" "}
                          {new Date(group.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-6">
                      <Button
                        onClick={() => handleJoinRoom(group.id)}
                        disabled={joiningGroupId === group.id}
                        className="bg-orange-normal hover:bg-orange-normal-hover text-white-normal px-5 py-3.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {joiningGroupId === group.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Joining...
                          </>
                        ) : (
                          "Join Room"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && filteredGroups.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">
                No study groups found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search terms or create a new group."
                  : "No study groups available yet. Create one to get started!"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="create-group" className="space-y-6 mt-6">
          <CreateGroup />
        </TabsContent>
      </Tabs>

      <JoinGroupPopup
        isOpen={showJoinPopup}
        onClose={handleClosePopup}
        onCancelRequest={handleCancelRequest}
      />
    </div>
  );
};

export default JoinGroup;
