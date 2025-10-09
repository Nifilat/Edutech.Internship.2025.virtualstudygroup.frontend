import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studyGroupAPI, userAPI } from "@/lib/api";
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
  const {
    data: studyRoomsData,
    isLoading: roomsLoading,
    error: roomsError,
  } = useStudyRooms();
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useCourses();

  const studyRoomsWithCourses = useMemo(() => {
  if (!studyRoomsData?.data || !coursesData) {
    return [];
  }

  // Create a map - handle both string and number IDs
  const coursesMap = new Map(
    coursesData.map((course) => [course.id, course])
  );

  // Map study rooms with their corresponding course data
  return studyRoomsData.data.map((room) => {
    // Try both as number and string
    const course = coursesMap.get(room.course_id) || coursesMap.get(String(room.course_id)) || coursesMap.get(Number(room.course_id));
    
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

export const useParticipantSearch = (searchQuery) => {
  return useQuery({
    queryKey: ["participants-search", searchQuery],
    queryFn: () => studyGroupAPI.searchParticipants(searchQuery),
    enabled: !!searchQuery && searchQuery.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

export const useJoinGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (Id) => studyGroupAPI.joinGroup(Id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
    },
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: userAPI.getUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};
