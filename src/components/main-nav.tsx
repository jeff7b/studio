"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Users, FileText, Settings, BarChart3, ScrollText, UserCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";


interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: Array<'employee' | 'team_leader' | 'admin'>; // Optional roles to show link
}

const navLinks: NavLink[] = [
  { href: "/dashboard", label: "My Dashboard", icon: <Home className="h-5 w-5" />, roles: ['employee', 'team_leader', 'admin'] },
  { href: "/team-dashboard", label: "Team Dashboard", icon: <Users className="h-5 w-5" />, roles: ['team_leader', 'admin'] },
  { href: "/admin/questionnaires", label: "Questionnaires", icon: <ScrollText className="h-5 w-5" />, roles: ['admin'] },
  { href: "/admin/assignments", label: "Assignments", icon: <UserCheck className="h-5 w-5" />, roles: ['admin'] },
];

// Mock current user role
const currentUserRole: 'employee' | 'team_leader' | 'admin' = 'admin'; 

export function MainNav({ isMobile = false, isCollapsed = false }: { isMobile?: boolean; isCollapsed?: boolean }) {
  const pathname = usePathname();

  const filteredNavLinks = navLinks.filter(link => 
    !link.roles || link.roles.includes(currentUserRole)
  );

  if (isCollapsed && !isMobile) {
    return (
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-2 px-2 py-4">
          {filteredNavLinks.map((link) => (
            <Tooltip key={link.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    buttonVariants({ variant: pathname === link.href ? "secondary" : "ghost", size: "icon" }),
                    "h-10 w-10",
                    pathname === link.href && "bg-accent text-accent-foreground"
                  )}
                >
                  {link.icon}
                  <span className="sr-only">{link.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    );
  }
  
  return (
    <nav className={cn("flex gap-2", isMobile ? "flex-col space-y-1" : "items-center space-x-0 lg:space-x-2")}>
      {filteredNavLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            buttonVariants({ variant: pathname === link.href ? "secondary" : "ghost", size: "default" }),
            "w-full justify-start",
            pathname === link.href && "bg-accent text-accent-foreground hover:bg-accent/90",
            isMobile ? "text-base px-4 py-3" : "text-sm px-3 py-2"
          )}
        >
          <div className={cn("mr-2", isMobile ? "h-5 w-5" : "h-4 w-4")}>{link.icon}</div>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
