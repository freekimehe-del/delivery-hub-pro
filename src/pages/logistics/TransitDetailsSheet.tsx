import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Truck, CheckCircle, FileText, Printer, Clock } from "lucide-react";
import { useTransitShipment, useTransitMutations } from "@/hooks/useTransit";
import { useState } from "react";

interface TransitDetailsSheetProps {
    shipmentId: string | null;
    onClose: () => void;
}

export function TransitDetailsSheet({ shipmentId, onClose }: TransitDetailsSheetProps) {
    const { data: shipment, isLoading } = useTransitShipment(shipmentId);
    const { updateCheckpoint } = useTransitMutations();

    const [updateForm, setUpdateForm] = useState({
        location: '',
        status: '',
        remarks: ''
    });

    const handleUpdate = () => {
        if (!shipmentId || !updateForm.location) return;
        updateCheckpoint.mutate({
            id: shipmentId,
            data: updateForm
        }, {
            onSuccess: () => {
                setUpdateForm({ location: '', status: '', remarks: '' });
            }
        });
    };

    const handlePrintGatePass = () => {
        window.print(); // Simplification
    };

    if (!shipmentId) return null;

    return (
        <Sheet open={!!shipmentId} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader className="mb-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle>Shipment Details</SheetTitle>
                        <Badge variant="outline">{shipment?.gd_number}</Badge>
                    </div>
                    <SheetDescription>
                        Track status and manage checkpoints for {shipment?.type.replace('_', ' ')}.
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">Loading...</div>
                ) : (
                    <ScrollArea className="flex-1 pr-4 -mr-4">
                        {/* Status Card */}
                        <div className="bg-muted/30 p-4 rounded-lg mb-6 border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Current Status</span>
                                <Badge className={shipment.weboc_status === 'Gate Out Confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>
                                    {shipment.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                <MapPin className="w-5 h-5 text-primary" />
                                {shipment.current_location}
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" /> ETA: {new Date(shipment.eta).toLocaleDateString()}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                            <div>
                                <Label className="text-muted-foreground">Carrier</Label>
                                <div className="font-medium">{shipment.carrier?.name || 'N/A'}</div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Route</Label>
                                <div className="font-medium">{shipment.route?.name || 'Direct'}</div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Container</Label>
                                <div className="font-medium">{shipment.container_no}</div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">BL Number</Label>
                                <div className="font-medium">{shipment.bl_number}</div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Update Action */}
                        <div className="space-y-4 mb-8">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Truck className="w-4 h-4" /> Update Movement
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label>New Location</Label>
                                    <Select
                                        value={updateForm.location}
                                        onValueChange={(v) => setUpdateForm({ ...updateForm, location: v })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select Point" /></SelectTrigger>
                                        <SelectContent>
                                            {shipment.route?.checkpoints?.map((cp: string) => (
                                                <SelectItem key={cp} value={cp}>{cp}</SelectItem>
                                            ))}
                                            <SelectItem value="Torkham Border">Torkham Border</SelectItem>
                                            <SelectItem value="Chaman Border">Chaman Border</SelectItem>
                                            <SelectItem value="Port Terminal">Port Terminal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Status Event</Label>
                                    <Select
                                        value={updateForm.status}
                                        onValueChange={(v) => setUpdateForm({ ...updateForm, status: v })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="in_transit">In Transit</SelectItem>
                                            <SelectItem value="border_arrival">Arrived at Border</SelectItem>
                                            <SelectItem value="crossed_border">Crossed Border (Export)</SelectItem>
                                            <SelectItem value="hold">Customs Hold</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>Remarks</Label>
                                <Input
                                    placeholder="e.g. Seal Verified OK"
                                    value={updateForm.remarks}
                                    onChange={(e) => setUpdateForm({ ...updateForm, remarks: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleUpdate} disabled={updateCheckpoint.isPending} className="w-full">
                                Update Checkpoint
                            </Button>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Activity Log
                            </h3>
                            <div className="relative pl-4 border-l-2 space-y-6">
                                {shipment.logs?.map((log: any) => (
                                    <div key={log.id} className="relative">
                                        <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                                        <div className="text-sm font-medium">{log.location}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                        {log.remarks && (
                                            <div className="text-xs bg-muted p-2 rounded mt-1">
                                                {log.remarks}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>
                )}

                {/* Footer Actions */}
                <div className="pt-4 mt-auto border-t flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2" onClick={handlePrintGatePass}>
                        <Printer className="w-4 h-4" /> Print Gate Pass
                    </Button>
                    <Button className="flex-1" onClick={onClose}>Close</Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
