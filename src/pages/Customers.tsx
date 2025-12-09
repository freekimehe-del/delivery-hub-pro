import { useState, useEffect } from "react";
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

interface CustomerMetrics {
  total_count?: number;
  active_count?: number;
  total_revenue?: number;
  avg_order_value?: number;
}

const tabs = [
  { value: "customers", label: "All Customers", path: "/customers", icon: Users },
  { value: "billing", label: "Billing", path: "/customers/billing", icon: CreditCard },
  { value: "invoices", label: "Invoices", path: "/customers/invoices", icon: FileText },
];

// Hook must be inside component, refactoring structure slightly
const Customers = () => {
  const [metricsData, setMetricsData] = useState<CustomerMetrics | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
      try {
        const resp = await fetch(`${apiUrl}/api/customers`);
        if (resp.ok) {
          const json = await resp.json();
          setMetricsData(json.stats);
        }
      } catch (e) {
        // Ignore errors
      }
    }
    load();
  }, []);

  const metrics = [
    {
      title: "Total Customers",
      value: String(metricsData?.total_count || 0),
      change: 0,
      changeLabel: "this month",
      icon: <Users className="w-5 h-5" />,
      iconColor: "bg-primary/10 text-primary",
    },
    {
      title: "Active Accounts",
      value: String(metricsData?.active_count || 0),
      change: 0,
      changeLabel: "this month",
      icon: <Building2 className="w-5 h-5" />,
      iconColor: "bg-fleet-green/10 text-fleet-green",
    },
    {
      title: "Total Revenue",
      value: `PKR ${metricsData?.total_revenue?.toLocaleString() || '0'}`,
      change: 0,
      changeLabel: "this month",
      icon: <DollarSign className="w-5 h-5" />,
      iconColor: "bg-fleet-purple/10 text-fleet-purple",
    },
    {
      title: "Avg. Order Value",
      value: `PKR ${metricsData?.avg_order_value?.toLocaleString() || '0'}`,
      change: 0,
      changeLabel: "vs last month",
      icon: <TrendingUp className="w-5 h-5" />,
      iconColor: "bg-fleet-orange/10 text-fleet-orange",
    },
  ];


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
};

export default Customers;
