import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DndCalculatorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DndCalculatorDialog({ open, onOpenChange }: DndCalculatorDialogProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const [formData, setFormData] = useState({
        terminal_id: 'TERM-QICT',
        shipping_line_id: 'SL-MAERSK',
        discharge_date: '',
        gate_out_date: '',
        empty_return_date: ''
    });

    const handleCalculate = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:4000/api/dnd/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-primary" /> D&D Cost Simulator
                    </DialogTitle>
                    <DialogDescription>
                        Estimate liabilities based on hypothetical dates and tariffs.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Terminal (Demurrage)</Label>
                            <Select value={formData.terminal_id} onValueChange={v => setFormData({ ...formData, terminal_id: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TERM-QICT">QICT (Port Qasim)</SelectItem>
                                    <SelectItem value="TERM-SAPT">SAPT (South Asia)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Shipping Line (Detention)</Label>
                            <Select value={formData.shipping_line_id} onValueChange={v => setFormData({ ...formData, shipping_line_id: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SL-MAERSK">Maersk Line</SelectItem>
                                    <SelectItem value="SL-MSC">MSC</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Discharge Date</Label>
                            <Input
                                type="date"
                                value={formData.discharge_date}
                                onChange={e => setFormData({ ...formData, discharge_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Gate Out (Delivery)</Label>
                            <Input
                                type="date"
                                value={formData.gate_out_date}
                                onChange={e => setFormData({ ...formData, gate_out_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Empty Return</Label>
                            <Input
                                type="date"
                                value={formData.empty_return_date}
                                onChange={e => setFormData({ ...formData, empty_return_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button onClick={handleCalculate} disabled={loading} className="w-full gap-2">
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                        Calculate Liability
                    </Button>

                    {result && (
                        <div className="mt-6 space-y-4 bg-muted/40 p-4 rounded-lg border">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total Estimated Cost</span>
                                <span className="text-red-600">Rs. {result.total.toLocaleString()}</span>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-8 text-sm">
                                <div>
                                    <p className="font-semibold mb-2">Demurrage (Port)</p>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Total:</span>
                                        <span className="font-medium text-foreground">Rs. {result.demurrage.total.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold mb-2">Detention (Line)</p>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Total:</span>
                                        <span className="font-medium text-foreground">Rs. {result.detention.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
