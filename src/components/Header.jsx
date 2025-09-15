// Header.jsx
import React from 'react';
import { Settings, Bell, User, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';

const Header = ({ pageTitle }) => {
  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4 h-16 ">
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {pageTitle && (
            <h1 className="text-2xl font-semibold text-foreground"></h1>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Settings Button */}
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          
          {/* Notifications Button */}
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 px-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-orange-normal text-white">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">Andrew Drey</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;