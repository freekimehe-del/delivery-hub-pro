import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Truck,
    Package,
    Map,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: "Home", path: "/" },
        { icon: Truck, label: "Fleet", path: "/fleet" },
        { icon: Package, label: "Orders", path: "/orders" },
        { icon: Map, label: "Logistics", path: "/logistics/tracking" },
        { icon: Settings, label: "Settings", path: "/settings" },
    ];

    const isActive = (path: string) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-[60] md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.path}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
                            isActive(item.path)
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        <item.icon className={cn("w-6 h-6", isActive(item.path) && "fill-current")} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
