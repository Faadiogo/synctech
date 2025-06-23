'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';

interface AppLayoutWithSidebarProps {
  children: React.ReactNode;
}

export function AppLayoutWithSidebar({ children }: AppLayoutWithSidebarProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 