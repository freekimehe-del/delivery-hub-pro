import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransitMutations } from "@/hooks/useTransit";

interface CreateGDDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateGDDialog({ open, onOpenChange }: CreateGDDialogProps) {
    const { createShipment } = useTransitMutations();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        gd_number: '',
        type: 'afghan_transit',
        customer_name: '',
        container_no: '',
        bl_number: '',
        route_id: 'RT-KHI-TKM', // default
        carrier_id: 'BC-001' // default
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createShipment.mutateAsync(formData);
            onOpenChange(false);
            setFormData({
                gd_number: '',
                type: 'afghan_transit',
                customer_name: '',
                container_no: '',
                bl_number: '',
                route_id: 'RT-KHI-TKM',
                carrier_id: 'BC-001'
            });
        } catch (err) {
            // Error handled by mutation
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>File New Goods Declaration (GD)</DialogTitle>
                    <DialogDescription>
                        Register a new transit shipment for WeBOC processing and tracking.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>GD Number (WeBOC)</Label>
                            <Input
                                placeholder="e.g., KAP-AT-..."
                                value={formData.gd_number}
                                onChange={e => setFormData({ ...formData, gd_number: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Shipment Type</Label>
                            <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="afghan_transit">Afghan Transit (ATT)</SelectItem>
                                    <SelectItem value="transshipment">Transshipment</SelectItem>
                                    <SelectItem value="local_transit">Local Bonded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Trader / Consignee</Label>
                        <Input
                            placeholder="Company Name"
                            value={formData.customer_name}
                            onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Container No</Label>
                            <Input
                                placeholder="ABCD-1234567"
                                value={formData.container_no}
                                onChange={e => setFormData({ ...formData, container_no: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>BL Number</Label>
                            <Input
                                placeholder="MAEU..."
                                value={formData.bl_number}
                                onChange={e => setFormData({ ...formData, bl_number: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Route</Label>
                        <Select value={formData.route_id} onValueChange={v => setFormData({ ...formData, route_id: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RT-KHI-TKM">Karachi to Torkham (ATT)</SelectItem>
                                <SelectItem value="RT-KHI-CHM">Qasim to Chaman (ATT)</SelectItem>
                                <SelectItem value="RT-LOC-LHR">Karachi to Lahore (Bonded)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading && <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />}
                            Submit GD
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
