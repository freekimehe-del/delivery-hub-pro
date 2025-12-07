import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  Send,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const invoices = [
  {
    id: "INV-001",
    customer: "Acme Corporation",
    amount: 4580,
    date: "2024-01-15",
    dueDate: "2024-02-15",
    status: "paid" as const,
  },
  {
    id: "INV-002",
    customer: "Tech Solutions Inc.",
    amount: 2340,
    date: "2024-01-14",
    dueDate: "2024-02-14",
    status: "pending" as const,
  },
  {
    id: "INV-003",
    customer: "Global Imports LLC",
    amount: 7890,
    date: "2024-01-13",
    dueDate: "2024-02-13",
    status: "overdue" as const,
  },
  {
    id: "INV-004",
    customer: "Quick Retail Co.",
    amount: 1520,
    date: "2024-01-12",
    dueDate: "2024-02-12",
    status: "paid" as const,
  },
  {
    id: "INV-005",
    customer: "Fresh Foods Market",
    amount: 9850,
    date: "2024-01-11",
    dueDate: "2024-02-11",
    status: "draft" as const,
  },
  {
    id: "INV-006",
    customer: "Metro Logistics",
    amount: 3200,
    date: "2024-01-10",
    dueDate: "2024-02-10",
    status: "sent" as const,
  },
];

const invoiceStats = [
  { label: "Total Invoiced", value: "PKR 284,500", color: "text-foreground" },
  { label: "Paid", value: "PKR 198,200", color: "text-green-600" },
  { label: "Pending", value: "PKR 54,300", color: "text-yellow-600" },
  { label: "Overdue", value: "PKR 32,000", color: "text-red-600" },
];

const statusConfig = {
  paid: { label: "Paid", color: "bg-green-500/10 text-green-600" },
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600" },
  overdue: { label: "Overdue", color: "bg-red-500/10 text-red-600" },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", color: "bg-blue-500/10 text-blue-600" },
};

export function InvoicesTab() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {invoiceStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Invoices Table */}
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
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Invoices</h3>
                <p className="text-xs text-muted-foreground">
                  {invoices.length} invoices total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-9 w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="gradient" size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                New Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice, index) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-mono font-medium">
                    {invoice.id}
                  </TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell className="font-mono font-medium">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[invoice.status].color}>
                      {statusConfig[invoice.status].label}
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
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="w-4 h-4 mr-2" />
                          Send to Customer
                        </DropdownMenuItem>
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
          <span>Showing {filteredInvoices.length} invoices</span>
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
    </div>
  );
}
