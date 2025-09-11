// src/components/Layout.jsx
import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const Layout = ({ children, pageTitle, activeNavItem, onNavItemClick }) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        activeItem={activeNavItem} 
        onNavItemClick={onNavItemClick}
      />
      
      <div className="ml-64">
        <Header pageTitle={pageTitle} />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;