import React, { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockStudyGroups } from '../data/studyGroup';

const JoinGroup = ({ onCreateGroupClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = mockStudyGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinRoom = (groupId) => {
    console.log('Joining room:', groupId);
    // Implement join room logic here
  };

  const handleCreateGroupClick = () => {
    if (onCreateGroupClick) {
      onCreateGroupClick();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Tabs defaultValue="study-rooms" className="w-full">
        {/* Custom styled TabsList to match original design */}
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

        {/* Study Rooms Content */}
        <TabsContent value="study-rooms" className="space-y-6 mt-6">
          {/* Search Bar */}
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

          {/* Study Groups List */}
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
                        {group.name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {group.course}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {group.description}
                    </p>
                    {/* Participant Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      {group.participants.map((participant, index) => (
                        <div key={participant.id} className="text-center">
                          <div className="text-sm font-medium text-gray-700">
                            {index + 1}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {participant.name}
                          </div>
                        </div>
                      ))}
                      {/* Fill remaining slots with placeholders */}
                      {Array.from({ length: Math.max(0, 3 - group.participants.length) }).map((_, index) => (
                        <div key={`empty-${index}`} className="text-center">
                          <div className="text-sm font-medium text-gray-400">
                            {group.participants.length + index + 1}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Available
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="ml-6">
                    <Button
                      onClick={() => handleJoinRoom(group.id)}
                      className="bg-orange-normal hover:bg-orange-normal-hover text-white-normal px-5 py-3.5"
                    >
                      Join Room
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredGroups.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">No study groups found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search terms or create a new group.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Create Group Content (placeholder) */}
        <TabsContent value="create-group" className="space-y-6 mt-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Create Group content will be handled by parent component</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JoinGroup;