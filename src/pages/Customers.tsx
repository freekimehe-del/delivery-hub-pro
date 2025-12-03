import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const customers = [
  {
    id: "cust_001",
    name: "Acme Corporation",
    email: "orders@acme.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    totalOrders: 156,
    totalSpent: 45800,
    status: "active" as const,
  },
  {
    id: "cust_002",
    name: "Tech Solutions Inc.",
    email: "logistics@techsol.com",
    phone: "+1 (555) 234-5678",
    location: "Brooklyn, NY",
    totalOrders: 89,
    totalSpent: 23400,
    status: "active" as const,
  },
  {
    id: "cust_003",
    name: "Global Imports LLC",
    email: "shipping@globalimports.com",
    phone: "+1 (555) 345-6789",
    location: "Manhattan, NY",
    totalOrders: 234,
    totalSpent: 78900,
    status: "premium" as const,
  },
  {
    id: "cust_004",
    name: "Quick Retail Co.",
    email: "delivery@quickretail.com",
    phone: "+1 (555) 456-7890",
    location: "Queens, NY",
    totalOrders: 67,
    totalSpent: 15200,
    status: "active" as const,
  },
  {
    id: "cust_005",
    name: "Fresh Foods Market",
    email: "orders@freshfoods.com",
    phone: "+1 (555) 567-8901",
    location: "Staten Island, NY",
    totalOrders: 312,
    totalSpent: 98500,
    status: "premium" as const,
  },
];

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

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer accounts and billing.
          </p>
        </div>
        <Button variant="gradient" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} delay={index * 0.1} />
        ))}
      </div>

      {/* Customers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm"
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Customer Directory</h3>
                <p className="text-xs text-muted-foreground">
                  {customers.length} customers total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-9 w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`}
                        />
                        <AvatarFallback>
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      {customer.location}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {customer.totalOrders}
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    ${customer.totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={customer.status === "premium" ? "success" : "info"}
                    >
                      {customer.status === "premium" ? "Premium" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>View Orders</DropdownMenuItem>
                        <DropdownMenuItem>Send Invoice</DropdownMenuItem>
                        <DropdownMenuItem>Edit Customer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filteredCustomers.length} customers</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
