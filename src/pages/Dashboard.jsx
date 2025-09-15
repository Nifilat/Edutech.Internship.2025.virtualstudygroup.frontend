import React from "react";
import { BookOpen, Users, Folder, Calendar } from "lucide-react";
import CourseProgressTable from "@/components/ui/CourseProgressTable";
import CourseIcon from "@/components/icons/Course";
import StudentsIcon from "@/components/icons/Students";
import UserGroupIcon from "@/components/icons/UserGroup";
import UserMultipleIcon from "@/components/icons/UserMultiple";

const stats = [
  { label: "Courses", value: 4 },
  { label: "Courses Grouping", value: 2 },
  { label: "Courses Grouping", value: 3 },
  { label: "Study Group", value: 4 },
];

const courses = [
  { name: "Cr 001- Criminal Law", icon: <CourseIcon />, assignment: "0 out of 3", quiz: "0 out of 3", forum: "0 out of 3", progress: 20 },
  { name: "Cr 002- Civil Law", icon: <StudentsIcon />, assignment: "0 out of 3", quiz: "0 out of 3", forum: "0 out of 3", progress: 40 },
  { name: "Cr 002- Civil Law", icon: <UserGroupIcon />, assignment: "0 out of 3", quiz: "0 out of 3", forum: "0 out of 3", progress: 60 },
  { name: "Cr 002- crr Law", icon: <UserMultipleIcon />, assignment: "0 out of 3", quiz: "0 out of 3", forum: "0 out of 3", progress: 80 },

];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-orange-500">Welcome Andrew!</h2>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-800">{s.value}</span>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              {i === 0 && <CourseIcon width={20} height={20} style={{ color: "#f97316" }} />}
              {i === 1 && <StudentsIcon width={20} height={20} style={{ color: "#f97316" }} />}
              {i === 2 && <UserGroupIcon width={20} height={20} style={{ color: "#f97316" }} />}
              {i === 3 && <UserMultipleIcon width={20} height={20} style={{ color: "#f97316" }} />}
            </div>
          </div>
        ))}
      </div>

  <CourseProgressTable courses={courses} />
    </div>
  );
}

