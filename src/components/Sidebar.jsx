import React, { act, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { DashboardSquare, Students, Calendar, Book, Course } from "./icons";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const Sidebar = ({ activeItem, isOpen, onClose }) => {
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
      onClose();
    }
  };

  const handleSubItemClick = (subItemPath) => {
    if (subItemPath) {
      navigate(subItemPath);
      onClose();
    }
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full w-64 bg-sidebar shadow-sm border-r border-sidebar-border z-40 transition-transform duration-300 ease-in-out",
      "lg:translate-x-0", // Always visible on large screens
      isOpen ? "translate-x-0" : "-translate-x-full" // Slide in/out on smaller screens
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-sidebar-border">
        <div className="flex items-center gap-0.5">
          <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
          <span className="text-xl font-medium text-black">edifyLMS</span>
        </div>
        {/* Close button for smaller screens */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
           <X className="h-6 w-6 text-gray-600" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 overflow-y-auto h-[calc(100vh-4rem)] pb-6">
        {sidebarItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full flex items-center justify-between px-6 py-3 text-left hover:bg-sidebar-accent transition-colors cursor-pointer text-sm", 
                (activeItem === item.id || item.subItems?.some(sub => activeItem === sub.id))
                  ? "bg-orange-normal text-white-normal"
                  : "text-white-dark-active hover:text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-center">
                <item.icon
                  className={cn(
                    "w-5 h-5 mr-3",
                    activeItem === item.id || item.subItems?.some(sub => activeItem === sub.id)
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
              <div className="ml-8 mt-1 space-y-1">
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
