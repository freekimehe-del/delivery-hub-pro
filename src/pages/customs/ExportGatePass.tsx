import React, { useState } from "react";
import { ArrowLeft, Printer, Truck, Check, FileDown } from "lucide-react";
import { ReportEngine } from "@/lib/reports";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface GPFormValues {
    gd_number: string;
    vehicle_number: string;
    driver_name: string;
    driver_cnic: string;
    no_of_packages: number;
}

const ExportGatePass = () => {
    const navigate = useNavigate();
    const [pass, setPass] = useState<any>(null);
    const [status, setStatus] = useState<any>(null); // null, 'pending', 'allowed', 'denied'
    const { register, handleSubmit, watch, formState: { errors } } = useForm<GPFormValues>();

    const gdNumber = watch('gd_number');

    const checkStatus = async () => {
        // Mock Check - In real app, call API
        // For Demo: If GD starts with 'GD', we say allow. Else pending.
        if (gdNumber && gdNumber.startsWith('GD')) {
            setStatus('allowed');
            toast.success("Ready for Gate-In", { description: "Customs Allow Loading received." });
        } else {
            setStatus('denied');
            toast.error("Not Allowed", { description: "GD status is not cleared or not found." });
        }
    };

    const onSubmit = async (data: GPFormValues) => {
        if (status !== 'allowed') {
            toast.error("Cannot Generate Pass", { description: "You must have 'Allow Loading' status first." });
            return;
        }

        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        try {
            const res = await fetch(`${apiUrl}/api/customs/gate-passes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed");
            }
            const json = await res.json();
            setPass(json.gate_pass);
            toast.success("Gate Pass Generated", { description: json.gate_pass.pass_number });
        } catch (e: any) {
            toast.error("Generation Failed", { description: e.message });
        }
    };

    if (pass) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4 no-print">
                    <Button variant="ghost" size="icon" onClick={() => setPass(null)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Export Gate Pass</h1>
                </div>

                <Card className="border-2 border-dashed border-gray-300 p-8 text-center space-y-4">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Truck className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-mono font-bold tracking-wider">{pass.pass_number}</h2>
                    <div className="grid grid-cols-2 gap-4 text-left mt-8 border-t pt-8">
                        <div>
                            <p className="text-sm text-muted-foreground">GD Number</p>
                            <p className="font-semibold">{pass.gd_number}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Vehicle Number</p>
                            <p className="font-semibold">{pass.vehicle_number}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Driver CNIC</p>
                            <p className="font-semibold">{pass.driver_cnic}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Packages</p>
                            <p className="font-semibold">{pass.no_of_packages}</p>
                        </div>
                    </div>
                    <div className="pt-8 no-print">
                        <Button onClick={() => window.print()} variant="outline" className="w-full">
                            <Printer className="w-4 h-4 mr-2" /> Print Browser
                        </Button>
                        <Button onClick={() => ReportEngine.generateGatePassPDF(pass)} className="w-full">
                            <FileDown className="w-4 h-4 mr-2" /> Download Official PDF
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/logistics/customs/compliance"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Generate Gate Pass (Export)</h1>
                    <p className="text-muted-foreground text-sm">Allow vehicle entry to terminal for export.</p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Export GD Number</Label>
                            <div className="flex gap-2">
                                <Input {...register("gd_number", { required: true })} placeholder="GD-..." />
                                <Button type="button" variant="secondary" onClick={checkStatus}>
                                    Check Status
                                </Button>
                            </div>
                            {status === 'allowed' && <p className="text-xs text-green-600 font-medium flex items-center"><Check className="w-3 h-3 mr-1" /> Allowed for Loading</p>}
                            {status === 'denied' && <p className="text-xs text-red-600 font-medium">Pending or Denied by Customs</p>}
                            {errors.gd_number && <span className="text-red-500 text-xs">Required</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Vehicle Number</Label>
                                <Input {...register("vehicle_number", { required: true })} placeholder="TLA-..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Packages</Label>
                                <Input type="number" {...register("no_of_packages", { required: true })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Driver CNIC</Label>
                            <Input {...register("driver_cnic", { required: true })} placeholder="42101-..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Driver Name</Label>
                            <Input {...register("driver_name")} />
                        </div>

                        <Button type="submit" className="w-full mt-4" disabled={status !== 'allowed'}>Generate Pass</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExportGatePass;
