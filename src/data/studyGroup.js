export const mockStudyGroups = [
  {
    id: 1,
    name: "Organic Study",
    course: "CHEM 101",
    participants: [
      { id: 1, name: "Alice Johnson" },
      { id: 2, name: "Bob Smith" },
      { id: 3, name: "Carol Davis" }
    ],
    description: "Weekly chemistry study group focusing on organic chemistry concepts"
  },
  {
    id: 2,
    name: "Literature Circle",
    course: "ENG 202", 
    participants: [
      { id: 4, name: "David Wilson" },
      { id: 5, name: "Emma Brown" },
      { id: 6, name: "Frank Miller" },
      { id: 7, name: "Grace Lee" }
    ],
    description: "Discussion group for contemporary literature analysis"
  },
  {
    id: 3,
    name: "Math Masters",
    course: "MATH 301",
    participants: [
      { id: 8, name: "Henry Chang" },
      { id: 9, name: "Ivy Rodriguez" }
    ],
    description: "Advanced calculus problem solving sessions"
  },
  {
    id: 4,
    name: "Bio Lab Partners",
    course: "BIO 150",
    participants: [
      { id: 10, name: "Jack Thompson" },
      { id: 11, name: "Katie White" },
      { id: 12, name: "Liam Garcia" }
    ],
    description: "Collaborative biology lab preparation and review"
  },
  {
    id: 5,
    name: "Physics Problem Solvers",
    course: "PHYS 201",
    participants: [
      { id: 13, name: "Mia Anderson" },
      { id: 14, name: "Noah Martinez" }
    ],
    description: "Weekly physics problem solving and concept review"
  }
];

// Function to add a new study group
export const addStudyGroup = (newGroup) => {
  const id = Math.max(...mockStudyGroups.map(g => g.id)) + 1;
  const group = {
    id,
    name: newGroup.groupName,
    course: newGroup.selectedCourse.toUpperCase(),
    participants: newGroup.participants || [],
    description: newGroup.groupDescription
  };
  mockStudyGroups.push(group);
  return group;
};