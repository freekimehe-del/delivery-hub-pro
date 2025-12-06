import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllCustomersTab } from "@/components/customers/AllCustomersTab";
import { BillingTab } from "@/components/customers/BillingTab";
import { InvoicesTab } from "@/components/customers/InvoicesTab";

const metrics = [
  {
    title: "Total Customers",
    value: "248",
    change: 12,
    changeLabel: "this month",
    icon: <Users className="w-5 h-5" />,
    iconColor: "bg-primary/10 text-primary",
  },
  {
    title: "Active Accounts",
    value: "195",
    change: 8,
    changeLabel: "this month",
    icon: <Building2 className="w-5 h-5" />,
    iconColor: "bg-fleet-green/10 text-fleet-green",
  },
  {
    title: "Total Revenue",
    value: "$284K",
    change: 23,
    changeLabel: "this month",
    icon: <DollarSign className="w-5 h-5" />,
    iconColor: "bg-fleet-purple/10 text-fleet-purple",
  },
  {
    title: "Avg. Order Value",
    value: "$156",
    change: 5,
    changeLabel: "vs last month",
    icon: <TrendingUp className="w-5 h-5" />,
    iconColor: "bg-fleet-orange/10 text-fleet-orange",
  },
];

const tabs = [
  { value: "customers", label: "All Customers", path: "/customers", icon: Users },
  { value: "billing", label: "Billing", path: "/customers/billing", icon: CreditCard },
  { value: "invoices", label: "Invoices", path: "/customers/invoices", icon: FileText },
];

export default function Customers() {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentTab = () => {
    if (location.pathname === "/customers/billing") return "billing";
    if (location.pathname === "/customers/invoices") return "invoices";
    return "customers";
  };

  const handleTabChange = (value: string) => {
    const tab = tabs.find((t) => t.value === value);
    if (tab) navigate(tab.path);
  };

  const currentTab = getCurrentTab();

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer accounts, billing, and invoices.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} delay={index * 0.1} />
        ))}
      </div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="h-12 p-1 bg-muted/50">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Tab Content */}
      {currentTab === "customers" && <AllCustomersTab />}
      {currentTab === "billing" && <BillingTab />}
      {currentTab === "invoices" && <InvoicesTab />}
    </DashboardLayout>
  );
}
