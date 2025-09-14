import React from "react";

export default function CourseProgressTable({ courses }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow p-6 mt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Course Progress Information
      </h3>
      <table
        className="w-full text-sm text-left border-separate"
        style={{ borderSpacing: "0 12px" }}
      >
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Assignment Completion</th>
            <th className="px-6 py-3 font-medium">Quiz Completion</th>
            <th className="px-6 py-3 font-medium">Forum Participation</th>
            <th className="px-6 py-3 font-medium">Progress</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c, i) => (
            <tr key={i} className="bg-white rounded-lg shadow-sm">
              <td className="px-6 py-4 rounded-l-lg">{c.name}</td>
              <td className="px-6 py-4">{c.assignment}</td>
              <td className="px-6 py-4">{c.quiz}</td>
              <td className="px-6 py-4">{c.forum}</td>
              <td className="px-6 py-4 rounded-r-lg">
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${c.progress}%` }}
                  ></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
