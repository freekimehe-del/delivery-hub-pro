import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Package,
  Bell,
  Ship,
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
  Anchor,
  CreditCard,
  FileText,
  Search,
  Menu,
  Code2,
  BookOpen,
  Key,
  Globe
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
  { id: 'dashboard', icon: LayoutDashboard, label: "Dashboard", path: "/" },

  // 1. Warehouse Dept
  {
    id: 'warehouse',
    icon: Warehouse,
    label: "Warehouse Dept",
    children: [
      { icon: Box, label: "Inventory Mgmt", path: "/warehousing/inventory" },
      { icon: ArrowDownToLine, label: "Receiving Ops", path: "/warehousing/movements" },
      { icon: Box, label: "Put-away", path: "/warehousing/putaway" },
      { icon: Package, label: "Picking & Packing", path: "/warehousing/picking" },
      { icon: Truck, label: "Shipping Ops", path: "/warehousing/shipping" },
      { icon: Activity, label: "Quality Control", path: "/warehousing/qc" },
    ],
  },

  // 2. Fleet & Transport
  {
    id: 'fleet',
    icon: Truck,
    label: "Fleet & Transport",
    children: [
      { icon: Car, label: "Vehicle Mgmt", path: "/fleet/vehicles" },
      { icon: UserCircle, label: "Driver Mgmt", path: "/fleet/drivers" },
      { icon: Fuel, label: "Fuel Mgmt", path: "/fleet/fuel" },
      { icon: Wrench, label: "Maintenance", path: "/fleet/maintenance" },
      { icon: MapPin, label: "Trip Mgmt", path: "/fleet/trip-management" },
    ],
  },

  // 3. Operations Dept
  {
    id: 'operations',
    icon: Activity,
    label: "Operations & Logistics",
    children: [
      { icon: Package, label: "Order Processing", path: "/orders" },
      { icon: Ship, label: "Shipments (Freight)", path: "/logistics/shipments" },
      { icon: FileText, label: "Bookings", path: "/logistics/bookings" },
      { icon: FileText, label: "Manifests", path: "/logistics/manifests" },
      { icon: Box, label: "Container Mgmt", path: "/logistics/containers" },
      { icon: MapPin, label: "Dispatch Mgmt", path: "/operations/dispatch" },
      { icon: Users, label: "Vendor Mgmt", path: "/operations/vendors" },
      { icon: BarChart3, label: "Performance", path: "/operations/performance" },
      { icon: Globe, label: "Transit Logistics", path: "/logistics/transit" },
      { icon: DollarSign, label: "Demurrage & Detention", path: "/logistics/dnd" },
      { icon: FileText, label: "Urdu Bilty Generator", path: "/logistics/bilty" },
    ]
  },

  // 4. Customs & Compliance
  {
    id: 'customs',
    icon: FileText,
    label: "Customs & Compliance",
    children: [
      { icon: Ship, label: "Import Dashboard", path: "/imports" },
      { icon: Anchor, label: "Export Dashboard", path: "/exports" },
      { icon: FileText, label: "Import/Export Docs", path: "/customs/docs" },
      { icon: Code2, label: "Customs Clearance", path: "/logistics/customs/new-gd" },
      { icon: Activity, label: "Compliance Checks", path: "/logistics/customs/compliance" },
      { icon: DollarSign, label: "Duty Calculation", path: "/customs/calculator" },
      { icon: FileText, label: "Regulatory Reports", path: "/customs/reports" },
    ]
  },

  // 5. Finance Dept
  {
    id: 'finance',
    icon: DollarSign,
    label: "Finance Dept",
    children: [
      { icon: FileText, label: "Billing & Invoicing", path: "/finance/invoices" },
      { icon: CreditCard, label: "Payment Processing", path: "/finance/payments" },
      { icon: DollarSign, label: "Expense Mgmt", path: "/finance/expenses" },
      { icon: BarChart3, label: "Financial Reporting", path: "/finance/reports" },
      { icon: PieChart, label: "Budget Mgmt", path: "/finance/budget" },
    ]
  },

  // 6. Customer Service
  {
    id: 'service',
    icon: Users,
    label: "Customer Service",
    children: [
      { icon: Search, label: "Order Tracking", path: "/service/tracking" },
      { icon: UserCircle, label: "Customer Support", path: "/service/support" },
      { icon: Activity, label: "Complaint Mgmt", path: "/service/complaints" },
      { icon: Bell, label: "Service Updates", path: "/service/updates" },
      { icon: Code2, label: "Customer Portal", path: "/service/portal" },
    ]
  },

  // API & Developers (Restored)
  {
    id: 'api',
    icon: Code2,
    label: "API & Developers",
    children: [
      { icon: BookOpen, label: "Documentation", path: "/api/docs" },
      { icon: Key, label: "API Keys", path: "/api/keys" },
    ],
  },

  // System
  {
    id: 'settings',
    icon: Settings,
    label: "System Settings",
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
