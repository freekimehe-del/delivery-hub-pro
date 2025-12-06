import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  BarChart3,
  Code2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Car,
  UserCircle,
  Wrench,
  Fuel,
  MapPin,
  FileText,
  CreditCard,
  Bell,
  Building2,
  Map,
  Webhook,
  Key,
  BookOpen,
  Warehouse,
  Gavel,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  children?: { icon: React.ElementType; label: string; path: string }[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  {
    icon: Truck,
    label: "Fleet",
    path: "/fleet",
    children: [
      { icon: Car, label: "Vehicles", path: "/fleet/vehicles" },
      { icon: UserCircle, label: "Drivers", path: "/fleet/drivers" },
      { icon: Wrench, label: "Maintenance", path: "/fleet/maintenance" },
      { icon: Fuel, label: "Fuel", path: "/fleet/fuel" },
    ],
  },
  {
    icon: Package,
    label: "Orders",
    path: "/orders",
    children: [
      { icon: Package, label: "All Orders", path: "/orders" },
      { icon: MapPin, label: "Dispatch", path: "/orders/dispatch" },
      { icon: Map, label: "Routes", path: "/orders/routes" },
      { icon: FileText, label: "Proof of Delivery", path: "/orders/pod" },
    ],
  },
  {
    icon: Users,
    label: "Customers",
    path: "/customers",
    children: [
      { icon: Users, label: "All Customers", path: "/customers" },
      { icon: CreditCard, label: "Billing", path: "/customers/billing" },
      { icon: FileText, label: "Invoices", path: "/customers/invoices" },
    ],
  },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  {
    icon: Warehouse,
    label: "Customs",
    path: "/customs",
    children: [
      { icon: Package, label: "Consignments", path: "/customs/consignments" },
      { icon: Warehouse, label: "Warehouses", path: "/customs/warehouses" },
      { icon: ScrollText, label: "HS Codes", path: "/customs/hs-codes" },
      { icon: Gavel, label: "Auctions", path: "/customs/auctions" },
    ],
  },
  {
    icon: Code2,
    label: "API",
    path: "/api",
    children: [
      { icon: BookOpen, label: "Documentation", path: "/api/docs" },
      { icon: Key, label: "API Keys", path: "/api/keys" },
      { icon: Webhook, label: "Webhooks", path: "/api/webhooks" },
    ],
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
    children: [
      { icon: Building2, label: "Company", path: "/settings/company" },
      { icon: Bell, label: "Notifications", path: "/settings/notifications" },
      { icon: Map, label: "Service Areas", path: "/settings/areas" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Fleet", "Orders"]);
  const location = useLocation();

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col z-50 border-r border-sidebar-border"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <Truck className="w-5 h-5 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg tracking-tight"
              >
                FleetOps
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive(item.path)
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex-1 flex items-center justify-between"
                        >
                          <span>{item.label}</span>
                          <ChevronRight
                            className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              expandedItems.includes(item.label) && "rotate-90"
                            )}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                  <AnimatePresence>
                    {!collapsed && expandedItems.includes(item.label) && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden ml-4 mt-1 space-y-1"
                      >
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                location.pathname === child.path
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                              )}
                            >
                              <child.icon className="w-4 h-4" />
                              <span>{child.label}</span>
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(item.path)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>
    </motion.aside>
  );
}
