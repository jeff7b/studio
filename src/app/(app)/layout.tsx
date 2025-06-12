"use client";

import { SiteHeader } from '@/components/site-header';
import { MainNav } from '@/components/main-nav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedSidebarState = localStorage.getItem('sidebarCollapsed');
    if (storedSidebarState) {
      setIsSidebarCollapsed(JSON.parse(storedSidebarState));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
    }
  }, [isSidebarCollapsed, isMounted]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  if (!isMounted) {
    return null; // Or a loading spinner
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="flex flex-1">
        <aside className={cn(
          "hidden md:flex flex-col border-r transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}>
          <ScrollArea className="flex-1 py-4">
            <MainNav isCollapsed={isSidebarCollapsed} />
          </ScrollArea>
          <div className="p-2 border-t">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="w-full justify-center">
              {isSidebarCollapsed ? <PanelRightOpen className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
              <span className="sr-only">{isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>
            </Button>
          </div>
        </aside>
        <main className="flex-1 overflow-x-hidden">
          <ScrollArea className="h-[calc(100vh-4rem)]"> {/* Adjust height based on header */}
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
             {children}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
