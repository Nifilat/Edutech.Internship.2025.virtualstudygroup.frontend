import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/sonner';

const Layout = ({ children, pageTitle, activeNavItem, onNavItemClick }) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        activeItem={activeNavItem} 
        onNavItemClick={onNavItemClick}
      />
      
      <div className="ml-64">
        <Header pageTitle={pageTitle} />
        
        <main className="p-8">
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  );
};

export default Layout;