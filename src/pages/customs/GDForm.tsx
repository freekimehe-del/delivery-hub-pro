import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Printer, Search, Calculator, Plus, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function GDForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Header Info
    const [gdType, setGdType] = useState("import");
    const [collectorate, setCollectorate] = useState("KAP");

    // Parties
    const [importer, setImporter] = useState({ name: "", ntn: "", address: "" });
    const [agent, setAgent] = useState({ name: "", license: "" });

    // Consignment
    const [consignment, setConsignment] = useState({
        blNumber: "", blDate: "", indexNumber: "",
        vessel: "", voyage: "", portLoading: "", portDischarge: "KAP"
    });

    // Financials
    const [fin, setFin] = useState({
        invoiceNo: "", invoiceDate: "", currency: "USD",
        exRate: 278.0, totalValue: 0
    });

    // Items
    const [items, setItems] = useState<any[]>([
        { id: 1, hsCode: "", desc: "", qty: 1, uom: "KGS", unitValue: 0, totalValue: 0, duty: 0 }
    ]);

    // Duty Summary
    const [dutySummary, setDutySummary] = useState({
        cd: 0, st: 0, acd: 0, rd: 0, it: 0, total: 0
    });

    const addItem = () => {
        setItems([...items, { id: Date.now(), hsCode: "", desc: "", qty: 1, uom: "KGS", unitValue: 0, totalValue: 0, duty: 0 }]);
    };

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(i => {
            if (i.id === id) {
                const updated = { ...i, [field]: value };
                if (field === 'qty' || field === 'unitValue') {
                    updated.totalValue = updated.qty * updated.unitValue * fin.exRate;
                }
                return updated;
            }
            return i;
        }));
    };

    const calculateDuties = async () => {
        let totalDuty = 0;
        let breakdown = { cd: 0, st: 0, acd: 0, rd: 0, it: 0, total: 0 };

        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';

        // Loop through each item and calc (simulation)
        for (const item of items) {
            if (!item.hsCode) continue;
            try {
                const res = await fetch(`${apiUrl}/api/customs/calculate-duty`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        hs_code: item.hsCode,
                        value_pkr: item.totalValue
                    })
                });
                const data = await res.json();
                if (data.ok) {
                    breakdown.cd += data.breakdown.customs_duty;
                    breakdown.st += data.breakdown.sales_tax;
                    breakdown.acd += data.breakdown.add_customs_duty;
                    breakdown.rd += data.breakdown.reg_duty;
                    breakdown.it += data.breakdown.income_tax;
                    breakdown.total += data.breakdown.total_duty;

                    // Update Item visual duty
                    // Note: We can't easily update state in loop without functional update, simplified here
                    item.duty = data.breakdown.total_duty;
                }
            } catch (e) {
                console.error(e);
            }
        }
        setDutySummary(breakdown);
        setItems([...items]); // Refresh view
        toast.info("Duties Calculated Successfully");
    };

    const handleSubmit = async () => {
        setLoading(true);
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';

        const payload = {
            declaration_type: gdType,
            collectorate: collectorate,
            importer_name: importer.name,
            importer_ntn: importer.ntn,
            importer_address: importer.address,
            agent_name: agent.name,
            agent_license_no: agent.license,
            bl_number: consignment.blNumber,
            manifest_number: consignment.indexNumber,
            vessel_name: consignment.vessel,
            invoice_number: fin.invoiceNo,
            currency: fin.currency,
            items: items.map(i => ({
                hs_code: i.hsCode,
                description: i.desc,
                quantity: i.qty,
                uom: i.uom,
                assessed_unit_value_pkr: i.unitValue * fin.exRate,
                assessed_total_value_pkr: i.totalValue
            }))
        };

        try {
            const res = await fetch(`${apiUrl}/api/customs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.ok) {
                toast.success(`GD Filed Successfully: ${data.gd.gd_number}`);
                setTimeout(() => navigate('/logistics/customs'), 1500);
            } else {
                toast.error("Failed to file GD");
            }
        } catch (e) {
            toast.error("Error submitting form");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-blue-900">Goods Declaration (WeBOC)</h1>
                        <p className="text-muted-foreground">Submit Import/Export Declarations for Customs Clearance.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => calculateDuties()}>
                            <Calculator className="w-4 h-4 mr-2" /> Calculate Duty
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-800 hover:bg-blue-900">
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? "Filing..." : "Submit Declaration"}
                        </Button>
                    </div>
                </div>

                {/* Form Body - replicating the sections from image */}
                <div className="grid grid-cols-12 gap-6">

                    {/* Left Packet (Header Info) */}
                    <div className="col-span-12 md:col-span-4 space-y-4">
                        <Card>
                            <CardHeader className="bg-slate-50 border-b py-3">
                                <CardTitle className="text-sm font-semibold uppercase text-slate-600">Header & Parties</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Collectorate</Label>
                                        <Select value={collectorate} onValueChange={setCollectorate}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="KAP">Appraisement East</SelectItem>
                                                <SelectItem value="KAPW">Appraisement West</SelectItem>
                                                <SelectItem value="PQ1">Port Qasim</SelectItem>
                                                <SelectItem value="AFG">Afghan Transit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Type</Label>
                                        <Select value={gdType} onValueChange={setGdType}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="import">Import (HC)</SelectItem>
                                                <SelectItem value="export">Export</SelectItem>
                                                <SelectItem value="transit">Transit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <hr />
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-blue-700">Importer / Exporter</Label>
                                    <Input placeholder="NTN / STRN" value={importer.ntn} onChange={e => setImporter({ ...importer, ntn: e.target.value })} className="h-8" />
                                    <Input placeholder="Company Name" value={importer.name} onChange={e => setImporter({ ...importer, name: e.target.value })} className="h-8" />
                                    <Input placeholder="Full Address" value={importer.address} onChange={e => setImporter({ ...importer, address: e.target.value })} className="h-8" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-blue-700">Clearing Agent</Label>
                                    <Input placeholder="License No (CHAL)" value={agent.license} onChange={e => setAgent({ ...agent, license: e.target.value })} className="h-8" />
                                    <Input placeholder="Agent Name" value={agent.name} onChange={e => setAgent({ ...agent, name: e.target.value })} className="h-8" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Duty Summary Box */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader className="py-2 border-b border-blue-100">
                                <CardTitle className="text-sm text-blue-800">Duty Breakdown (PKR)</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 text-sm space-y-2">
                                <div className="flex justify-between"><span>Customs Duty:</span> <span className="font-mono">{dutySummary.cd.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>Sales Tax:</span> <span className="font-mono">{dutySummary.st.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>Add. CD:</span> <span className="font-mono">{dutySummary.acd.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>Reg. Duty:</span> <span className="font-mono">{dutySummary.rd.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>Income Tax:</span> <span className="font-mono">{dutySummary.it.toLocaleString()}</span></div>
                                <div className="border-t border-blue-300 pt-2 flex justify-between font-bold text-blue-900 text-lg">
                                    <span>Total:</span> <span>{dutySummary.total.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Packet (Consignment & Items) */}
                    <div className="col-span-12 md:col-span-8 space-y-4">
                        <Card>
                            <CardHeader className="bg-slate-50 border-b py-3">
                                <CardTitle className="text-sm font-semibold uppercase text-slate-600">Consignment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-3 gap-4 pt-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">BL / AWB Number</Label>
                                    <Input value={consignment.blNumber} onChange={e => setConsignment({ ...consignment, blNumber: e.target.value })} className="h-8" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Manifest (IGM)</Label>
                                    <Input value={consignment.indexNumber} onChange={e => setConsignment({ ...consignment, indexNumber: e.target.value })} className="h-8" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Vessel Name</Label>
                                    <Input value={consignment.vessel} onChange={e => setConsignment({ ...consignment, vessel: e.target.value })} className="h-8" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Invoice No</Label>
                                    <Input value={fin.invoiceNo} onChange={e => setFin({ ...fin, invoiceNo: e.target.value })} className="h-8" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Currency</Label>
                                    <Select value={fin.currency} onValueChange={v => setFin({ ...fin, currency: v })}>
                                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="CNY">CNY</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Exchange Rate</Label>
                                    <Input type="number" value={fin.exRate} onChange={e => setFin({ ...fin, exRate: parseFloat(e.target.value) })} className="h-8" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="bg-slate-50 border-b py-3 flex flex-row justify-between items-center">
                                <CardTitle className="text-sm font-semibold uppercase text-slate-600">Items Declaration</CardTitle>
                                <Button size="sm" variant="ghost" onClick={addItem} className="h-6 gap-1 text-blue-600"><Plus className="w-3 h-3" /> Add Item</Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-100 text-slate-500 font-medium">
                                            <tr>
                                                <th className="px-4 py-2 w-32">HS Code</th>
                                                <th className="px-4 py-2">Description</th>
                                                <th className="px-4 py-2 w-20">Qty</th>
                                                <th className="px-4 py-2 w-24">Unit Val</th>
                                                <th className="px-4 py-2 w-32 text-right">Total (PKR)</th>
                                                <th className="px-4 py-2 w-32 text-right">Est. Duty</th>
                                                <th className="px-4 py-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {items.map((item, idx) => (
                                                <tr key={item.id}>
                                                    <td className="p-2">
                                                        <Input
                                                            value={item.hsCode}
                                                            onChange={e => updateItem(item.id, 'hsCode', e.target.value)}
                                                            placeholder="8517.12"
                                                            className="h-8 font-mono bg-white"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <Input
                                                            value={item.desc}
                                                            onChange={e => updateItem(item.id, 'desc', e.target.value)}
                                                            placeholder="Item Name..."
                                                            className="h-8 bg-white"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <Input
                                                            type="number"
                                                            value={item.qty}
                                                            onChange={e => updateItem(item.id, 'qty', parseFloat(e.target.value))}
                                                            className="h-8 bg-white"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <Input
                                                            type="number"
                                                            value={item.unitValue}
                                                            onChange={e => updateItem(item.id, 'unitValue', parseFloat(e.target.value))}
                                                            className="h-8 bg-white"
                                                        />
                                                    </td>
                                                    <td className="p-2 text-right font-mono">
                                                        {Math.round(item.totalValue).toLocaleString()}
                                                    </td>
                                                    <td className="p-2 text-right font-mono text-red-600 font-medium">
                                                        {Math.round(item.duty).toLocaleString()}
                                                    </td>
                                                    <td className="p-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => {
                                                            setItems(items.filter(x => x.id !== item.id));
                                                        }}>
                                                            <Trash className="w-3 h-3" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
