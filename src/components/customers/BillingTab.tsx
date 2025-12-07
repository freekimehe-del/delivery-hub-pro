import { motion } from "framer-motion";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Settings,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const billingStats = [
  {
    title: "Total Revenue",
    value: "PKR 284,500",
    change: 12.5,
    trend: "up" as const,
    icon: DollarSign,
    color: "bg-green-500/10 text-green-600",
  },
  {
    title: "Outstanding",
    value: "PKR 42,300",
    change: -8.2,
    trend: "down" as const,
    icon: Clock,
    color: "bg-yellow-500/10 text-yellow-600",
  },
  {
    title: "Paid This Month",
    value: "PKR 156,200",
    change: 18.7,
    trend: "up" as const,
    icon: CheckCircle,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Overdue",
    value: "PKR 12,450",
    change: 5.3,
    trend: "up" as const,
    icon: AlertCircle,
    color: "bg-red-500/10 text-red-600",
  },
];

const recentPayments = [
  {
    id: "pay_001",
    customer: "Acme Corporation",
    amount: 4580,
    date: "2024-01-15",
    status: "completed" as const,
    method: "Bank Transfer",
  },
  {
    id: "pay_002",
    customer: "Tech Solutions Inc.",
    amount: 2340,
    date: "2024-01-14",
    status: "completed" as const,
    method: "Credit Card",
  },
  {
    id: "pay_003",
    customer: "Global Imports LLC",
    amount: 7890,
    date: "2024-01-13",
    status: "pending" as const,
    method: "Bank Transfer",
  },
  {
    id: "pay_004",
    customer: "Quick Retail Co.",
    amount: 1520,
    date: "2024-01-12",
    status: "completed" as const,
    method: "Credit Card",
  },
  {
    id: "pay_005",
    customer: "Fresh Foods Market",
    amount: 9850,
    date: "2024-01-11",
    status: "failed" as const,
    method: "Bank Transfer",
  },
];

const paymentMethods = [
  { name: "Credit Card", percentage: 45, color: "bg-primary" },
  { name: "Bank Transfer", percentage: 35, color: "bg-green-500" },
  { name: "PayPal", percentage: 15, color: "bg-blue-500" },
  { name: "Other", percentage: 5, color: "bg-muted-foreground" },
];

const statusConfig = {
  completed: { label: "Completed", color: "bg-green-500/10 text-green-600" },
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600" },
  failed: { label: "Failed", color: "bg-red-500/10 text-red-600" },
};

export function BillingTab() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {billingStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                      {stat.change}%
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Payments</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  This Month
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CreditCard className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.customer}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.method} • {new Date(payment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusConfig[payment.status].color}>
                        {statusConfig[payment.status].label}
                      </Badge>
                      <span className="font-mono font-medium">
                        ${payment.amount.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Payment Methods</CardTitle>
              <Button variant="ghost" size="icon-sm">
                <Settings className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={method.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{method.name}</span>
                    <span className="font-medium">{method.percentage}%</span>
                  </div>
                  <Progress value={method.percentage} className="h-2" />
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
