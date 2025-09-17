import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { DashboardSquare, Students, Calendar, Book, Course } from "./icons";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = ({ activeItem }) => {
  const [studyGroupExpanded, setStudyGroupExpanded] = useState(true);
  const navigate = useNavigate();

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: DashboardSquare,
      path: "/dashboard",
    },
    {
      id: "study-group",
      label: "Study group",
      icon: Students,
      expandable: true,
      expanded: studyGroupExpanded,
      subItems: [
        { id: "create-group", label: "Create Group", path: "/create-group" },
        { id: "join-group", label: "Join Group", path: "/join-group" },
        { id: "chatroom", label: "Chatroom", path: "/chatroom" },
      ],
    },
    { id: "my-course", label: "My Course", icon: Course, path: "/my-course" },
    { id: "calendar", label: "Calendar", icon: Calendar, path: "/calendar" },
    { id: "resources", label: "Resources", icon: Book, path: "/resources" },
  ];

  const handleItemClick = (item) => {
    if (item.id === "study-group") {
      setStudyGroupExpanded(!studyGroupExpanded);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-sidebar shadow-sm border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center px-6 h-16 border-b border-sidebar-border">
        <div className="flex items-center gap-0.5">
          <img src="src/assets/logo.svg" alt="Logo" className="h-8 w-auto" />
          <span className="text-xl font-medium text-black">edifyLMS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {sidebarItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full flex items-center justify-between px-6 py-3 text-left hover:bg-sidebar-accent transition-colors cursor-pointer",
                activeItem === item.id && item.id === "dashboard"
                  ? "bg-orange-normal text-white-normal rounded-l-2xl mr-4"
                  : activeItem === item.id && item.id !== "dashboard"
                  ? "bg-sidebar-accent text-white-dark-active"
                  : "text-white-dark-active hover:text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-center">
                <item.icon
                  className={cn(
                    "w-5 h-5 mr-3",
                    activeItem === item.id
                      ? "text-white-normal"
                      : "text-white-dark-active"
                  )}
                />
                <span className="font-normal">{item.label}</span>
              </div>
              {item.expandable && (
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    item.expanded ? "rotate-180" : ""
                  )}
                />
              )}
            </button>

            {item.expandable && item.expanded && item.subItems && (
              <div className="ml-10">
                {item.subItems.map((subItem) => (
                  <NavLink
                    key={subItem.id}
                    to={subItem.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center pl-3 pr-4 py-2 text-left hover:bg-sidebar-accent transition-colors",
                        isActive
                          ? "w-auto bg-orange-normal text-white-normal rounded-lg mr-4"
                          : "text-white-dark-active hover:text-sidebar-accent-foreground"
                      )
                    }
                  >
                    <span className="font-normal text-base">
                      {subItem.label}
                    </span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
