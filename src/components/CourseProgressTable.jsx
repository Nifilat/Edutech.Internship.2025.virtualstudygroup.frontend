// CourseProgressTable.jsx
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Progress } from './ui/progress';

const CourseProgressTable = () => {
  const courseProgressData = [
    { name: 'Cr 001- Criminal Law', assignments: '0 out of 3', quiz: '0 out of 3', forum: '0 out of 3', progress: 15 },
    { name: 'Cr 001- Criminal Law', assignments: '0 out of 3', quiz: '0 out of 3', forum: '0 out of 3', progress: 65 },
    { name: 'Cr 001- Criminal Law', assignments: '0 out of 3', quiz: '0 out of 3', forum: '0 out of 3', progress: 25 },
    { name: 'Cr 001- Criminal Law', assignments: '0 out of 3', quiz: '0 out of 3', forum: '0 out of 3', progress: 35 },
    { name: 'Cr 001- Criminal Law', assignments: '0 out of 3', quiz: '0 out of 3', forum: '0 out of 3', progress: 75 },
    { name: 'Cr 001- Criminal Law', assignments: '0 out of 3', quiz: '0 out of 3', forum: '0 out of 3', progress: 20 },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Course Progress Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Assignment Completion</TableHead>
                <TableHead>Quiz Completion</TableHead>
                <TableHead>Forum Participation</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseProgressData.map((course, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {course.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {course.assignments}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {course.quiz}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {course.forum}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Progress 
                        value={course.progress} 
                        className="w-full max-w-[120px]"
                      />
                      {/* <span className="text-sm font-medium text-foreground min-w-0">
                        {course.progress}%
                      </span> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseProgressTable;