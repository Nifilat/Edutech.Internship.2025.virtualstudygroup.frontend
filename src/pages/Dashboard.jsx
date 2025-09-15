import React from "react";
import { Course, UserGroup, UserMultiple, Students } from "../components/icons";
// import { BookOpen, Users, Folder, Calendar } from "lucide-react";
import CourseProgressTable from "@/components/ui/CourseProgressTable";

const stats = [
  { label: "Courses", value: 4 },
  { label: "Courses Grouping", value: 2 },
  { label: "Courses Grouping", value: 3 },
  { label: "Study Group", value: 4 },
];

const courses = [
    { name: "Cr 001- Criminal Law", assignment: "0 out of 3", quiz: "0 out of 3", forum: "0 out of 3", progress: 20 },
    { name: "Cr 002- Civil Law", assignment: "0 out of 3", quiz: "0 out of 3", forum: "0 out of 3", progress: 40 },
    { name: "Cr 002- Civil Law", assignment: "0 out of 3", quiz: "0 out of 3", forum: "0 out of 3", progress: 60 },
    { name: "Cr 002- crr Law", assignment: "0 out of 3", quiz: "0 out of 3", forum: "0 out of 3", progress: 80 },

];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-orange-normal">Welcome Andrew!</h2>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-black-normal">{s.label}</p>
              <span className="text-xl font-medium text-black-normal">{s.value}</span>
            </div>
            <div className="flex items-center justify-center rounded-full border border-orange-light bg-white-normal p-3.5">
              {i === 0 && <Course size={20} className="text-orange-500" />}
              {i === 1 && <UserGroup size={20} className="text-orange-500" />}
              {i === 2 && <UserMultiple size={20} className="text-orange-500" />}
              {i === 3 && <Students size={20} className="text-orange-500" />}
            </div>
          </div>
        ))}
      </div>

      <CourseProgressTable courses={courses} />
    </div>
  );
}

