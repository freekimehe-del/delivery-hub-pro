import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Box, Search, Filter, AlertCircle, ChevronDown, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function WarehouseInventory() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        try {
            const res = await fetch(`${apiUrl}/api/inventory/items`);
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedRows(newExpanded);
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.id.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(items.map(i => i.category)));

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Master Inventory</h1>
                        <p className="text-muted-foreground">Detailed stock levels across all locations.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Box className="w-5 h-5 text-primary" /> Stock List
                            </CardTitle>
                            <div className="flex gap-2">
                                <div className="relative w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search SKU or Name..."
                                        className="pl-8 h-9"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-[180px] h-9">
                                        <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>SKU / Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Available</TableHead>
                                    <TableHead className="text-right">Reserved</TableHead>
                                    <TableHead className="text-right">Total Value</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={7} className="text-center h-24">Loading inventory...</TableCell></TableRow>
                                ) : filteredItems.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No items found.</TableCell></TableRow>
                                ) : (
                                    filteredItems.map((item) => (
                                        <React.Fragment key={item.id}>
                                            <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(item.id)}>
                                                <TableCell>
                                                    {expandedRows.has(item.id) ?
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" /> :
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground">{item.id}</div>
                                                </TableCell>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell className="text-right font-bold text-green-700">
                                                    {item.stock.available}
                                                </TableCell>
                                                <TableCell className="text-right text-orange-600">
                                                    {item.stock.reserved}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    ${(item.stock.available * item.price).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {item.stock.available <= item.safety_stock ? (
                                                        <Badge variant="destructive" className="gap-1">
                                                            <AlertCircle className="h-3 w-3" /> Low Stock
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                            In Stock
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            {/* Details Component loaded directly here for simplicity */}
                                            {expandedRows.has(item.id) && (
                                                <TableRow className="bg-muted/30">
                                                    <TableCell colSpan={7} className="p-0">
                                                        <div className="p-4 pl-12 grid gap-4">
                                                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                                                <MapPin className="h-4 w-4" /> Location Breakdown
                                                            </h4>
                                                            <InventoryDetail sku={item.id} />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

// Sub-component to fetch details on expand
function InventoryDetail({ sku }: { sku: string }) {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/api/inventory/items/${sku}`);
            if (res.ok) setDetails(await res.json());
            setLoading(false);
        };
        fetchDetails();
    }, [sku]);

    if (loading) return <div className="text-sm text-muted-foreground">Loading specific location data...</div>;
    if (!details || details.stock_breakdown.length === 0) return <div className="text-sm text-muted-foreground italic">No stock allocated to specific bins.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {details.stock_breakdown.map((stock: any) => (
                <div key={stock.id} className="border rounded-lg p-3 bg-white text-sm shadow-sm">
                    <div className="flex justify-between items-center mb-2 border-b pb-2">
                        <span className="font-semibold text-gray-700">{stock.warehouse_id}</span>
                        <div className="text-xs space-x-2">
                            <span className="text-green-600 font-medium">Avail: {stock.quantities.available}</span>
                            <span className="text-orange-500">Rsrv: {stock.quantities.reserved}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        {stock.locations.map((loc: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-gray-600 text-xs">
                                <span>Zone {loc.zone} • Rack {loc.rack} • Bin {loc.bin}</span>
                                <span className="font-mono font-medium">{loc.qty} units</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
