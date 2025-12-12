import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  ChevronDown,
  Plus,
  Package,
  Truck,
  Users,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// notifications managed via API

const quickActions = [
  { icon: Package, label: "New Order", color: "bg-primary" },
  { icon: Truck, label: "Add Vehicle", color: "bg-fleet-green" },
  { icon: Users, label: "Add Driver", color: "bg-fleet-purple" },
];

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function TopBar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const queryClient = useQueryClient();
  const apiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:4000";

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/api/notifications`);
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { mutate: markRead } = useMutation({
    mutationFn: async (id: any) => {
      await fetch(`${apiUrl}/api/notifications/${id}/read`, { method: "PUT" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: async () => {
      await fetch(`${apiUrl}/api/notifications/read-all`, { method: "PUT" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div
          className={cn(
            "relative transition-all duration-200",
            searchFocused && "scale-[1.02]"
          )}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders, drivers, vehicles..."
            className="pl-10 bg-muted/50 border-transparent focus:border-primary focus:bg-card"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded border">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="gradient" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Action</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {quickActions.map((action) => (
              <DropdownMenuItem key={action.label} className="gap-3 cursor-pointer">
                <div className={cn("p-1.5 rounded-md", action.color)}>
                  <action.icon className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notifications.some((n: any) => !n.read) && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifications.filter((n: any) => !n.read).length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Notifications</h4>
                <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => markAllRead()}>
                  Mark all read
                </Button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
              ) : (
                notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    onClick={() => markRead(notification.id)}
                    className={cn(
                      "p-4 border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-muted/50",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex gap-3">
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                      )}
                      <div className={cn(notification.read && "ml-5")}>
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.time}
                        </p>
                        <Badge variant={notification.type === 'warning' ? 'destructive' : 'secondary'} className="mt-2 text-[10px] h-5">
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-border">
              <Button variant="ghost" size="sm" className="w-full text-primary">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=fleet" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium leading-none">John Doe</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3 cursor-pointer">
              <User className="w-4 h-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 cursor-pointer">
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3 cursor-pointer text-destructive">
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
