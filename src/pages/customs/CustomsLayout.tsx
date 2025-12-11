import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Calculator, FileText, Layers, ShieldCheck, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const CustomsLayout: React.FC = () => {
    const location = useLocation();

    const tabs = [
        { name: "Dashboard", path: "/logistics/customs", icon: Layers },
        { name: "Goods Declaration (GD)", path: "/logistics/customs/new-gd", icon: FileText },
        { name: "Duty Calculator", path: "/logistics/customs/calculator", icon: Calculator },
        { name: "Trade Finance", path: "/logistics/customs/trade-finance", icon: CreditCard },
        { name: "Compliance", path: "/logistics/customs/compliance", icon: ShieldCheck },
    ];

    return (
        <DashboardLayout>
            <div className="flex flex-col space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customs & Trade</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage Pakistan Customs (WeBOC/PSW) compliance, duty calculations, and declarations.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const isActive = location.pathname === tab.path || (tab.path !== "/logistics/customs" && location.pathname.startsWith(tab.path));
                            const Icon = tab.icon;
                            return (
                                <Link
                                    key={tab.name}
                                    to={tab.path}
                                    className={cn(
                                        isActive
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                                        "group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500",
                                            "-ml-0.5 mr-2 h-5 w-5"
                                        )}
                                        aria-hidden="true"
                                    />
                                    <span>{tab.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">
                    <Outlet />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CustomsLayout;
