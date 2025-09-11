import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { PiStudentLight } from "react-icons/pi";
import {
  Home, Users, BookOpen, Calendar, FileText,
  ChevronDown, UserPlus, MessageCircle, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = ({ activeItem }) => {
  const [studyGroupExpanded, setStudyGroupExpanded] = useState(true);
  const navigate = useNavigate();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    {
      id: 'study-group',
      label: 'Study group',
      icon: PiStudentLight,
      expandable: true,
      expanded: studyGroupExpanded,
      subItems: [
        { id: 'create-group', label: 'Create Group', path: '/create-group' },
        { id: 'join-group', label: 'Join Group', path: '/join-group' },
        { id: 'chatroom', label: 'Chatroom', path: '/chatroom' },
      ],
    },
    { id: 'my-course', label: 'My Course', icon: BookOpen, path: '/my-course' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
    { id: 'resources', label: 'Resources', icon: FileText, path: '/resources' },
  ];

  const handleItemClick = (item) => {
    if (item.id === 'study-group') {
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
          <span className="text-xl font-semibold text-sidebar-foreground">edifyLMS</span>
        </div>
      </div>


      {/* Navigation */}
      <nav className="mt-6">
        {sidebarItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full flex items-center justify-between px-6 py-3 text-left hover:bg-sidebar-accent transition-colors",
                activeItem === item.id && item.id === 'dashboard'
                  ? 'bg-orange-normal text-white border-r-4 border-orange-dark'
                  : activeItem === item.id && item.id !== 'dashboard'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:text-sidebar-accent-foreground'
              )}
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.expandable && (
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    item.expanded ? 'rotate-180' : ''
                  )}
                />
              )}
            </button>

            {item.expandable && item.expanded && item.subItems && (
              <div className="ml-4 border-l border-sidebar-border">
                {item.subItems.map((subItem) => (
                  <NavLink
                    key={subItem.id}
                    to={subItem.path}
                    className={({ isActive }) =>
                      cn(
                        "w-full flex items-center px-6 py-2 text-left hover:bg-sidebar-accent transition-colors",
                        isActive
                          ? 'bg-orange-normal text-white border-r-4 border-orange-dark'
                          : 'text-sidebar-foreground hover:text-sidebar-accent-foreground'
                      )
                    }
                  >
                    <span className="font-medium text-sm ml-7">{subItem.label}</span>
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
