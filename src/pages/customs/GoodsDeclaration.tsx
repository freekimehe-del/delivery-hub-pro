import React, { useState } from "react";
import { ArrowLeft, Check, FileText, Plus, Trash2, Printer, Save, Ship, Plane, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface GDFormValues {
    type: "Import" | "Export" | "Transit";
    sub_type: "Home Consumption" | "Warehouse" | "Into Bond" | "Ex-Bond";
    collectorate: string;
    bl_number: string;
    bl_date: string;
    vessel_name: string;
    importer_ntn: string;
    importer_name: string;
    bank_name: string;
    eif_number: string;
    items: {
        hs_code: string;
        description: string;
        origin_country: string;
        quantity: number;
        uom: string;
        unit_value: number;
        total_value: number;
    }[];
}

const GoodsDeclaration: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manifestVerified, setManifestVerified] = useState(false);

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<GDFormValues>({
        defaultValues: {
            type: "Import",
            sub_type: "Home Consumption",
            items: [{ hs_code: "", description: "", origin_country: "CN", quantity: 0, uom: "KGS", unit_value: 0, total_value: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const watchBL = watch("bl_number");
    const watchCollectorate = watch("collectorate");

    const verifyManifest = async () => {
        // Mock verification call
        // In real app: POST /api/manifests/verify
        // Checking against simple rule for now (Mock BL123 + KPT)
        if (watchBL === 'BL123' && watchCollectorate === 'KPT') {
            setManifestVerified(true);
            toast.success("Manifest Verified", { description: "VIR found in Customs system." });
        } else {
            // We allow bypass for demo, but show warning
            setManifestVerified(true); // Treat as verified for unblock
            toast.warning("Manifest Not Found", { description: "Proceeding with caution. (Demo Bypass)" });
        }
    };

    const checkHSCode = (code: string, index: number) => {
        // Mock checking Logic
        if (code === '1905.9000') {
            toast.error("Restricted Item", { description: "Import is banned under SRO 598" });
        }
    };

    const onSubmit = async (data: GDFormValues) => {
        setIsSubmitting(true);
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';

        try {
            // 1. Create Declaration
            const resp = await fetch(`${apiUrl}/api/customs/declarations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    status: 'filed', // Auto file for demo
                    submit: true
                })
            });

            if (!resp.ok) throw new Error("Failed to create declaration");

            const json = await resp.json();
            toast.success("GD Filed Successfully", { description: `GD Number: ${json.declaration.id}` });
            setTimeout(() => navigate('/logistics/customs'), 1500);

        } catch (error: any) {
            toast.error("Filing Failed", { description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const autoFillFromOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('document', file);

        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        const loadingToast = toast.loading("Scanning Document...");

        try {
            const res = await fetch(`${apiUrl}/api/customs/ocr/scan`, { method: 'POST', body: formData });
            const json = await res.json();

            if (json.extracted) {
                const ex = json.extracted;
                toast.dismiss(loadingToast);
                toast.success("Document Scanned", { description: "Auto-filling fields..." });

                // Auto-populate form using react-hook-form's setValue (needs to be extracted from hook)
                // Since setValue isn't destructured yet, we need to add it.
                // Assuming we will add setValue to the destructuring above.
                if (ex.bl_number) setValue("bl_number", ex.bl_number);
                if (ex.bl_date) setValue("bl_date", ex.bl_date);
                if (ex.vessel_name) setValue("vessel_name", ex.vessel_name);
                if (ex.importer_ntn) setValue("importer_ntn", ex.importer_ntn);
                if (ex.importer_name) setValue("importer_name", ex.importer_name);
                if (ex.eif_number) setValue("eif_number", ex.eif_number);
                if (ex.collectorate) setValue("collectorate", ex.collectorate);
                if (ex.type) setValue("type", ex.type);
                if (ex.sub_type) setValue("sub_type", ex.sub_type);

                if (ex.items && Array.isArray(ex.items)) {
                    // Clear existing items and append new ones
                    remove(); // Remove all current items
                    ex.items.forEach((item: any) => {
                        append({
                            hs_code: item.hs_code || "",
                            description: item.description || "",
                            origin_country: item.origin_country || "CN",
                            quantity: item.quantity || 0,
                            uom: item.uom || "KGS",
                            unit_value: item.unit_value || 0,
                            total_value: item.total_value || 0,
                        });
                    });
                }

            } else {
                toast.dismiss(loadingToast);
                toast.error("No data extracted");
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("OCR Check Failed");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/logistics/customs"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">New Goods Declaration (GD)</h1>
                        <p className="text-muted-foreground">File Customs GD for Import/Export clearance (Weboc Compatible)</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <input
                            type="file"
                            id="ocr-upload"
                            className="hidden"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={autoFillFromOCR}
                        />
                        <Button variant="outline" onClick={() => document.getElementById('ocr-upload')?.click()}>
                            <FileText className="w-4 h-4 mr-2" /> Auto-Fill from Doc
                        </Button>
                    </div>
                    <Button variant="outline" type="button"><Save className="w-4 h-4 mr-2" /> Save Draft</Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {/* Step 1: General Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">1</span>
                            General Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>Declaration Type</Label>
                            <select {...register("type")} className="w-full border rounded-md h-10 px-3 bg-white">
                                <option value="Import">Import</option>
                                <option value="Export">Export</option>
                                <option value="Transit">Transit</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Sub-Type</Label>
                            <select {...register("sub_type")} className="w-full border rounded-md h-10 px-3 bg-white">
                                <option value="Home Consumption">Home Consumption</option>
                                <option value="Warehouse">Into Bond (Warehouse)</option>
                                <option value="Ex-Bond">Ex-Bond</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Collectorate / Port</Label>
                            <select {...register("collectorate")} className="w-full border rounded-md h-10 px-3 bg-white">
                                <option value="KPT">Karachi Port Trust (KPT)</option>
                                <option value="PQA">Port Qasim (PQA)</option>
                                <option value="SAPT">South Asia Pakistan Terminal</option>
                                <option value="LHR">Lahore Dry Port</option>
                                <option value="AIR-KHI">Jinnah Int'l Airport</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Importer NTN</Label>
                            <Input {...register("importer_ntn", { required: true })} placeholder="1234567-8" />
                            {errors.importer_ntn && <span className="text-red-500 text-xs">Required</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Importer Name</Label>
                            <Input {...register("importer_name")} placeholder="Company Name" />
                        </div>

                        <div className="space-y-2">
                            <Label>Payment / Bank</Label>
                            <Input {...register("bank_name")} placeholder="HBL / MCB / UBL" />
                        </div>
                    </CardContent>
                </Card>

                {/* Step 2: Shipping Info (With Verification) */}
                <Card className={manifestVerified ? "border-green-200 bg-green-50/10" : "border-orange-200 bg-orange-50/10"}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">2</span>
                                Shipping Details
                            </div>
                            {manifestVerified && <span className="text-sm font-normal text-green-600 flex items-center"><Check className="w-4 h-4 mr-1" /> Manifest Verified</span>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>BL / AWB Number</Label>
                            <div className="flex gap-2">
                                <Input {...register("bl_number")} placeholder="OSLU12345678" />
                                <Button type="button" size="sm" variant="secondary" onClick={verifyManifest}>Verify</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>BL Date</Label>
                            <Input type="date" {...register("bl_date")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Vessel / Flight Name</Label>
                            <Input {...register("vessel_name")} placeholder="OSL HORIZON V.001" />
                        </div>
                        <div className="space-y-2">
                            <Label>E-Form / EIF Number (SBP)</Label>
                            <Input {...register("eif_number")} placeholder="EIF-0000-000000" />
                        </div>
                    </CardContent>
                </Card>

                {/* Step 3: Items */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">3</span>
                            Item Details
                        </CardTitle>
                        <Button type="button" size="sm" onClick={() => append({ hs_code: "", description: "", origin_country: "CN", quantity: 0, uom: "KGS", unit_value: 0, total_value: 0 })}>
                            <Plus className="w-4 h-4 mr-2" /> Add Item
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[140px]">HS Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-[100px]">Origin</TableHead>
                                        <TableHead className="w-[100px]">Qty</TableHead>
                                        <TableHead className="w-[100px]">Unit Val ($)</TableHead>
                                        <TableHead className="w-[120px]">Total ($)</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>
                                                <Input
                                                    {...register(`items.${index}.hs_code` as const)}
                                                    placeholder="8703.2190"
                                                    className="h-8"
                                                    onBlur={(e) => checkHSCode(e.target.value, index)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input {...register(`items.${index}.description` as const)} placeholder="Item description" className="h-8" />
                                            </TableCell>
                                            <TableCell>
                                                <Input {...register(`items.${index}.origin_country` as const)} placeholder="CN" className="h-8" />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" {...register(`items.${index}.quantity` as const, { valueAsNumber: true })} className="h-8" />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" {...register(`items.${index}.unit_value` as const, { valueAsNumber: true })} className="h-8" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-right">
                                                    {/* Auto calc total value roughly */}
                                                    {(watch(`items.${index}.quantity`) * watch(`items.${index}.unit_value`)).toFixed(2)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4 pb-12">
                    <Button variant="outline" type="button" asChild>
                        <Link to="/logistics/customs">Cancel</Link>
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : (
                            <>
                                <FileText className="w-4 h-4 mr-2" /> File Declaration
                            </>
                        )}
                    </Button>
                </div>

            </form>
        </div>
    );
};

export default GoodsDeclaration;
