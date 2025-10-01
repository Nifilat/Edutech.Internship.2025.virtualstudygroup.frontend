import { useQuery } from "@tanstack/react-query";
import { studyGroupAPI } from "@/lib/api";
import { useMemo } from "react";

export const useStudyRooms = () => {
  return useQuery({
    queryKey: ["study-rooms"],
    queryFn: studyGroupAPI.getAllStudyRooms,
  });
};

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: studyGroupAPI.getCourses,
  });
};


export const useStudyRoomsWithCourses = () => {
  const { data: studyRoomsData, isLoading: roomsLoading, error: roomsError } = useStudyRooms();
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useCourses();

  const studyRoomsWithCourses = useMemo(() => {
    
    if (!studyRoomsData?.data || !coursesData) {
      return [];
    }

    // Create a map of courses by id for quick lookup
    const coursesMap = new Map(
      coursesData.map((course) => [course.id.toString(), course])
    );

    // Map study rooms with their corresponding course data
    return studyRoomsData.data.map((room) => {
      const course = coursesMap.get(room.course_id);
      return {
        ...room,
        course_code: course?.course_code || "N/A",
        course_name: course?.course_name || "Unknown Course",
        course_description: course?.course_description || "",
      };
    });
  }, [studyRoomsData, coursesData]);

  return {
    data: studyRoomsWithCourses,
    isLoading: roomsLoading || coursesLoading,
    error: roomsError || coursesError,
  };
};