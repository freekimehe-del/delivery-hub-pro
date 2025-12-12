import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Clock, AlertTriangle, Calculator, RefreshCw } from "lucide-react";
import { useDndCycles } from "@/hooks/useDnd";
import { DndCalculatorDialog } from "./DndCalculatorDialog";

export default function DndDashboard() {
    const { data: cycles, isLoading, refetch } = useDndCycles();
    const [isCalcOpen, setCalcOpen] = useState(false);

    // Aggregates
    const totalLiability = cycles?.reduce((sum, c) => sum + (c.stats.demurrage_cost + c.stats.detention_cost), 0) || 0;
    const containersAtRisk = cycles?.filter(c => c.stats.days_demurrage > 5 || c.stats.days_detention > 14).length || 0;

    return (
        <DashboardLayout>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Demurrage & Detention (D&D)</h1>
                    <p className="text-muted-foreground mt-1">
                        Track liability for Port Demurrage and Shipping Line Detention.
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="icon" onClick={() => refetch()}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button className="gap-2 w-full sm:w-auto" onClick={() => setCalcOpen(true)}>
                        <Calculator className="w-4 h-4" /> Simulator
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <MetricCard
                    title="Total Liability (Est)"
                    value={`Rs. ${totalLiability.toLocaleString()}`}
                    change={0}
                    changeLabel="cumulative cost"
                    icon={<DollarSign className="w-5 h-5" />}
                    iconColor="bg-red-100 text-red-600"
                />
                <MetricCard
                    title="Containers at Risk"
                    value={String(containersAtRisk)}
                    change={0}
                    changeLabel="exceeding free days"
                    icon={<AlertTriangle className="w-5 h-5" />}
                    iconColor="bg-orange-100 text-orange-600"
                />
                <MetricCard
                    title="Active Cycles"
                    value={String(cycles?.length || 0)}
                    change={0}
                    changeLabel="being monitored"
                    icon={<Clock className="w-5 h-5" />}
                    iconColor="bg-blue-100 text-blue-600"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Container Watchlist</CardTitle>
                    <CardDescription>Real-time cost calculation based on discharge and gate moves.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Container</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Demurrage (Days / Cost)</TableHead>
                                    <TableHead>Detention (Days / Cost)</TableHead>
                                    <TableHead>Total Risk</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : cycles?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No active cycles found.</TableCell>
                                    </TableRow>
                                ) : (
                                    cycles?.map((cycle) => (
                                        <TableRow key={cycle.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{cycle.container_no}</span>
                                                    <span className="text-xs text-muted-foreground">{cycle.bl_number}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {cycle.terminal_id.includes('QICT') ?
                                                        <Badge variant="outline">QICT</Badge> :
                                                        <Badge variant="outline">SAPT</Badge>
                                                    }
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    cycle.status === 'at_terminal' ? 'bg-blue-500' : 'bg-green-500'
                                                }>
                                                    {cycle.status === 'at_terminal' ? 'At Port' : 'Gate Out'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <span className="font-bold whitespace-nowrap">{cycle.stats.days_demurrage} Days</span>
                                                    <div className="text-red-600">Rs. {cycle.stats.demurrage_cost.toLocaleString()}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <span className="font-bold whitespace-nowrap">{cycle.stats.days_detention} Days</span>
                                                    <div className="text-red-600">Rs. {cycle.stats.detention_cost.toLocaleString()}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-red-700 text-lg">
                                                    Rs. {(cycle.stats.demurrage_cost + cycle.stats.detention_cost).toLocaleString()}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <DndCalculatorDialog open={isCalcOpen} onOpenChange={setCalcOpen} />
        </DashboardLayout>
    );
}
