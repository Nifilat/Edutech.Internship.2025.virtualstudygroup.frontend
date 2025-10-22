import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const Layout = ({ children, pageTitle, activeNavItem, onNavItemClick }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Sidebar
        activeItem={activeNavItem}
        onNavItemClick={onNavItemClick}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          "lg:ml-64" // Default margin for large screens
          // Mobile/Tablet: Margin is 0 when sidebar is closed,
          // but we'll handle overlay/content shift if needed later
        )}
      >
        <Header pageTitle={pageTitle} onToggleSidebar={toggleSidebar} />

        <main className="p-4 md:p-8 pt-20 lg:pt-25">{children}</main>
        <Toaster />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
