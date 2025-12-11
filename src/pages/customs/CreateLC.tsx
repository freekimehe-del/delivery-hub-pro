import React, { useState } from "react";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface LCFormValues {
    lc_number: string;
    bank_name: string;
    beneficiary: string;
    amount: number;
    currency: string;
    issue_date: string;
    expiry_date: string;
    description: string;
}

const CreateLC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<LCFormValues>({
        defaultValues: {
            currency: 'USD',
            bank_name: 'Bank Alfalah'
        }
    });

    const onSubmit = async (data: LCFormValues) => {
        setIsSubmitting(true);
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        try {
            const res = await fetch(`${apiUrl}/api/trade/lcs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error("Failed to create LC");

            toast.success("LC Created Successfully");
            setTimeout(() => navigate('/logistics/customs/trade-finance'), 1000);
        } catch (err: any) {
            toast.error("Error", { description: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/logistics/customs/trade-finance"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Open New Letter of Credit</h1>
                    <p className="text-muted-foreground text-sm">Record a new import LC issuing details.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Bank & Beneficiary Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Issuing Bank</Label>
                            <select {...register("bank_name")} className="w-full border rounded-md h-10 px-3 bg-white">
                                <option>Bank Alfalah</option>
                                <option>Habib Bank Limited (HBL)</option>
                                <option>Meezan Bank</option>
                                <option>Standard Chartered</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>LC Number (Bank Ref)</Label>
                            <Input {...register("lc_number", { required: true })} placeholder="LC-2024-XXXX" />
                            {errors.lc_number && <span className="text-red-500 text-xs">Required</span>}
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Beneficiary (Supplier)</Label>
                            <Input {...register("beneficiary", { required: true })} placeholder="Supplier Name" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Financials & Dates</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <select {...register("currency")} className="w-full border rounded-md h-10 px-3 bg-white">
                                <option>USD</option>
                                <option>EUR</option>
                                <option>GBP</option>
                                <option>CNY</option>
                                <option>JPY</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>LC Amount</Label>
                            <Input type="number" {...register("amount", { required: true })} placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label>Issue Date</Label>
                            <Input type="date" {...register("issue_date", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Input type="date" {...register("expiry_date", { required: true })} />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Description / Goods</Label>
                            <Textarea {...register("description")} placeholder="Description of goods..." />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild><Link to="/logistics/customs/trade-finance">Cancel</Link></Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : (
                            <>
                                <Save className="w-4 h-4 mr-2" /> Save Letter of Credit
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateLC;
