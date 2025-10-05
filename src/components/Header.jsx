import React, { useState, useEffect } from "react";
import { Settings, Bell, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import NotificationDropdown from "./NotificationDropdown";
import { notificationsAPI } from "@/lib/api";

const Header = ({ pageTitle }) => {
  const { logout, getUser } = useAuth();
  const user = getUser();
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsAPI.getNotifications();
      const notifs = data?.data || [];
      setNotifications(notifs);

      // Count unread notifications
      const unread = notifs.filter((n) => !n.read_at).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationHandled = () => {
    fetchNotifications();
  };

  const handleCloseNotifications = () => {
    setNotificationOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4 h-16 ">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {pageTitle && (
            <h1 className="text-2xl font-semibold text-foreground"></h1>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>

          <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[368px] p-0" align="end">
              <NotificationDropdown
                notifications={notifications}
                onNotificationHandled={handleNotificationHandled}
                onClose={handleCloseNotifications}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-3 px-3"
              >
                <Avatar className="w-8 h-8">
                  {user?.avatar_url && (
                    <AvatarImage
                      src={user.avatar_url}
                      alt={`${user.first_name} ${user.last_name}`}
                    />
                  )}
                  <AvatarFallback className="bg-orange-normal text-white">
                    {user
                      ? `${user.first_name?.[0] || ""}${
                          user.last_name?.[0] || ""
                        }`
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">
                    {user ? `${user.first_name} ${user.last_name}` : "User"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
