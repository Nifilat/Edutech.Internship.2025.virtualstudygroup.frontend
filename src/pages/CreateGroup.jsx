import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AiOutlinePlus } from "react-icons/ai";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [participants, setParticipants] = useState([]);

  const courses = [
    'Criminal Law',
    'Constitutional Law',
    'Contract Law',
    'Tort Law',
    'Administrative Law'
  ];

  const handleCreateGroup = () => {
    // Handle group creation logic here
    console.log({
      groupName,
      selectedCourse,
      groupDescription,
      participants
    });
  };

  const handleCancel = () => {
    // Handle cancel logic - navigate back or clear form
    setGroupName('');
    setSelectedCourse('');
    setGroupDescription('');
    setParticipants([]);
  };

  return (

    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Create Group</h1>
        <Button className="bg-orange-normal hover:bg-orange-dark text-white">
          <AiOutlinePlus className="w-5 h-5" />
          Add Participant
        </Button>
      </div>

      {/* Main Form */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form Fields */}
        <div className="space-y-6">
          {/* Group Name */}
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

          {/* Group Description - Full Width */}
          

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
                  <SelectItem key={course} value={course.toLowerCase().replace(' ', '-')}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>

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
    </div>

  );
};

export default CreateGroup;