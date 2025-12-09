import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-[72px] lg:ml-[260px] transition-all duration-300">
        <TopBar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
