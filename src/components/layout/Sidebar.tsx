import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Car,
  UserCircle,
  Wrench,
  Fuel,
  MapPin,
  Map,
  Warehouse,
  Box,
  ArrowDownToLine,
  PieChart,
  DollarSign,
  Activity,
  Ship,
  Anchor,
  CreditCard,
  FileText,
  Search,
  Menu,
  Code2,
  BookOpen,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  path?: string;
  badge?: number;
  children?: { icon: React.ElementType; label: string; path: string; badge?: number }[];
}

const navItems: NavItem[] = [
  { id: 'command-center', icon: Activity, label: "Command Center", path: "/command-center" },
  { id: 'dashboard', icon: LayoutDashboard, label: "Dashboard", path: "/" },
  {
    id: 'fleet',
    icon: Truck,
    label: "Fleet Management",
    children: [
      { icon: Car, label: "Vehicles", path: "/fleet/vehicles" },
      { icon: UserCircle, label: "Drivers", path: "/fleet/drivers" },
      { icon: Wrench, label: "Maintenance", path: "/fleet/maintenance" },
      { icon: Fuel, label: "Fuel Management", path: "/fleet/fuel" },
    ],
  },
  {
    id: 'orders',
    icon: Package,
    label: "Orders Management",
    children: [
      { icon: Package, label: "All Orders", path: "/orders" },
      { icon: MapPin, label: "Dispatch Center", path: "/orders/dispatch" },
      { icon: Map, label: "Route Planning", path: "/orders/routes" },
      { icon: FileText, label: "Proof of Delivery", path: "/orders/pod" },
    ],
  },
  {
    id: 'warehousing',
    icon: Warehouse,
    label: "Warehousing",
    children: [
      { icon: Warehouse, label: "Warehouse View", path: "/warehousing" },
      { icon: Box, label: "Stock Levels", path: "/warehousing/inventory" },
      { icon: ArrowDownToLine, label: "Receiving", path: "/warehousing/movements" },
    ],
  },
  {
    id: 'logistics',
    icon: Map,
    label: "Logistics Hub",
    children: [
      { icon: FileText, label: "Manifests", path: "/logistics/manifests" },
      { icon: Map, label: "Live Tracking", path: "/logistics/tracking" },
    ]
  },
  {
    id: 'global-trade',
    icon: Ship,
    label: "Global Trade",
    children: [
      { icon: Ship, label: "Imports", path: "/imports" },
      { icon: Anchor, label: "Exports", path: "/exports" },
      { icon: FileText, label: "Customs", path: "/logistics/customs/new-gd" },
    ]
  },
  {
    id: 'customers',
    icon: Users,
    label: "Customers",
    children: [
      { icon: Users, label: "All Customers", path: "/customers" },
      { icon: CreditCard, label: "Billing", path: "/customers/billing" },
      { icon: FileText, label: "Invoices", path: "/customers/invoices" },
    ],
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: "Analytics",
    children: [
      { icon: Activity, label: "Performance", path: "/analytics" },
      { icon: DollarSign, label: "Financial", path: "/finance/dashboard" },
      { icon: PieChart, label: "Efficiency", path: "/logistics/ai-optimizer" },
    ],
  },
  {
    id: 'finance',
    icon: CreditCard,
    label: "Finance",
    children: [
      { icon: FileText, label: "Invoices", path: "/finance/invoices" },
      { icon: DollarSign, label: "Settlements", path: "/finance/settlements" },
    ]
  },
  {
    id: 'api',
    icon: Code2,
    label: "API & Developers",
    children: [
      { icon: BookOpen, label: "Documentation", path: "/api/docs" },
      { icon: Key, label: "API Keys", path: "/api/keys" },
    ],
  },
  {
    id: 'settings',
    icon: Settings,
    label: "Settings",
    children: [
      { icon: Users, label: "User Management", path: "/settings/users" },
      { icon: Activity, label: "System Config", path: "/settings/config" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("fleet");
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  // Handle section expansion (Accordion style)
  const toggleSection = (id: string) => {
    if (collapsed) setCollapsed(false);
    setExpandedSection(expandedSection === id ? null : id);
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Filter items based on search
  const filteredItems = navItems.filter(item => {
    if (searchQuery === "") return true;
    const matchLabel = item.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchChildren = item.children?.some(child =>
      child.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchLabel || matchChildren;
  });

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-in-out shadow-xl flex flex-col",
        "bg-gradient-to-b from-[#1E3A8A] to-[#1D4ED8] text-white",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      {/* Brand Area */}
      <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
        <Link to="/" className="flex items-center gap-4 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-400/30 shadow-inner backdrop-blur-sm">
            <Truck className="w-6 h-6 text-blue-100" />
          </div>
          <div className={cn("transition-opacity duration-300", collapsed ? "opacity-0 w-0" : "opacity-100")}>
            <h1 className="font-bold text-lg leading-none tracking-wide text-white">DELIVERY HUB</h1>
            <p className="text-[10px] text-blue-200 uppercase tracking-widest mt-1">Pro Logistics</p>
          </div>
        </Link>
      </div>

      {/* Search Bar - Only visible when expanded */}
      {!collapsed && (
        <div className="px-4 py-4 shrink-0">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-300 group-focus-within:text-white transition-colors" />
            <Input
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white/10 border-white/10 text-white placeholder:text-blue-300/50 focus-visible:ring-blue-400/50 focus-visible:bg-white/20 transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <ScrollArea className="flex-1 px-3 py-2">
        <ul className="space-y-1.5 pb-20">
          {filteredItems.map((item) => {
            const isExpanded = expandedSection === item.id;
            const isItemActive = isActive(item.path) || item.children?.some(c => isActive(c.path));

            return (
              <li key={item.id}>
                {item.children ? (
                  <div className="nav-collapsible">
                    <button
                      onClick={() => toggleSection(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                        isItemActive
                          ? "bg-white/15 text-white shadow-sm"
                          : "text-blue-100 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {/* Active Indicator Bar */}
                      {isItemActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full" />}

                      <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300", isItemActive && !collapsed && "scale-110")} />

                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          <ChevronRight
                            className={cn(
                              "w-4 h-4 transition-transform duration-300 opacity-70",
                              isExpanded && "rotate-90"
                            )}
                          />
                        </>
                      )}

                      {/* Tooltip for collapsed state could go here */}
                    </button>

                    {/* Submenu */}
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        !collapsed && isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/10 pl-3 my-2 mr-2">
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                                isActive(child.path)
                                  ? "bg-blue-500 text-white font-medium shadow-md shadow-blue-900/20"
                                  : "text-blue-200 hover:text-white hover:bg-white/5"
                              )}
                            >
                              <child.icon className="w-4 h-4 opacity-80" />
                              <span className="truncate">{child.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.path!}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      isActive(item.path)
                        ? "bg-white/20 text-white shadow-lg shadow-blue-900/10"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {isActive(item.path) && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full" />}
                    <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </ScrollArea>

      {/* Footer / Toggle */}
      <div className="p-4 border-t border-white/10 bg-[#1a3680] shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-blue-200 hover:text-white hover:bg-white/10 h-10"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Collapse Menu</span>
            </div>
          )}
        </Button>
      </div>
    </aside>
  );
}
