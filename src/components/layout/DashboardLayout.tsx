import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

import { MobileNav } from "./MobileNav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-mesh font-sans text-slate-800">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <MobileNav />
      {/* Adjusted margins for desktop (sidebar) and padding for mobile (bottom nav) */}
      <div className="pb-20 md:pb-6 md:ml-[80px] lg:ml-[280px] transition-all duration-300">
        <TopBar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
