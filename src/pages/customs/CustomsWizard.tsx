import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ArrowLeft, Check, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const CustomsWizard: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'GD', // GD or TD
        bl_number: '',
        importer_ntn: '',
        items: [{ hs_code: '', description: '', value: 0 }]
    });
    const [estDuty, setEstDuty] = useState<any>(null);

    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { hs_code: '', description: '', value: 0 }] });
    };

    const calculate = async () => {
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        const resp = await fetch(`${apiUrl}/api/customs/calculate-duty`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: formData.items })
        });
        if (resp.ok) {
            const json = await resp.json();
            setEstDuty(json);
        }
    };

    const submit = async () => {
        setLoading(true);
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';

        // 1. Create Draft
        const resp1 = await fetch(`${apiUrl}/api/customs/declarations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const json1 = await resp1.json();

        if (resp1.ok) {
            // 2. Submit to PSW
            const resp2 = await fetch(`${apiUrl}/api/customs/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ declaration_id: json1.declaration.id })
            });
            if (resp2.ok) {
                navigate('/customs'); // Back to dashboard
            }
        }
        setLoading(false);
    };

    return (
        <DashboardLayout>
            <div className="mb-6 flex items-center space-x-4">
                <Link to="/customs" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">New Declaration</h1>
                    <p className="text-muted-foreground">File Goods Declaration (GD) or Transit Declaration (TD).</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border p-6 max-w-3xl">
                {/* Progress */}
                <div className="flex items-center justify-between mb-8 border-b pb-4">
                    <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}><span className="font-bold mr-2">1</span> Header</div>
                    <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}><span className="font-bold mr-2">2</span> Items</div>
                    <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}><span className="font-bold mr-2">3</span> Assessment</div>
                </div>

                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Declaration Type</label>
                            <select
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="GD">Goods Declaration (Import)</option>
                                <option value="TD">Transit Declaration (Afghan/ICD)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">BL Number</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={formData.bl_number}
                                onChange={e => setFormData({ ...formData, bl_number: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Importer NTN</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={formData.importer_ntn}
                                onChange={e => setFormData({ ...formData, importer_ntn: e.target.value })}
                            />
                        </div>
                        <button onClick={() => setStep(2)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Next: Items</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        {formData.items.map((item, idx) => (
                            <div key={idx} className="p-4 border rounded bg-gray-50 space-y-2">
                                <div>
                                    <label className="text-sm font-medium">HS Code</label>
                                    <input
                                        className="w-full border rounded p-1"
                                        value={item.hs_code}
                                        placeholder="e.g. 8703.2300"
                                        onChange={e => {
                                            const newItems = [...formData.items];
                                            newItems[idx].hs_code = e.target.value;
                                            setFormData({ ...formData, items: newItems });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Declared Value (PKR)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded p-1"
                                        value={item.value}
                                        onChange={e => {
                                            const newItems = [...formData.items];
                                            newItems[idx].value = Number(e.target.value);
                                            setFormData({ ...formData, items: newItems });
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        <button onClick={addItem} className="text-sm text-blue-600 font-medium">+ Add Item</button>
                        <div className="flex justify-between pt-4">
                            <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-600">Back</button>
                            <button onClick={() => { calculate(); setStep(3); }} className="px-4 py-2 bg-blue-600 text-white rounded">Next: Assess</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                            <h3 className="font-semibold text-yellow-800 mb-2">Duty Assessment Preview</h3>
                            {estDuty ? (
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span>Customs Duty:</span> <span>{estDuty.breakdown.customs_duty}</span></div>
                                    <div className="flex justify-between"><span>Add. Duty:</span> <span>{estDuty.breakdown.add_customs_duty}</span></div>
                                    <div className="flex justify-between"><span>Sales Tax:</span> <span>{estDuty.breakdown.sales_tax}</span></div>
                                    <div className="flex justify-between"><span>Income Tax:</span> <span>{estDuty.breakdown.income_tax}</span></div>
                                    <div className="border-t pt-1 mt-1 font-bold flex justify-between"><span>TOTAL PAYABLE:</span> <span>{estDuty.total}</span></div>
                                </div>
                            ) : (
                                <p>Calculating...</p>
                            )}
                        </div>

                        <div className="flex justify-between">
                            <button onClick={() => setStep(2)} className="px-4 py-2 text-gray-600">Back</button>
                            <button
                                onClick={submit}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded flex items-center"
                            >
                                {loading ? 'Submitting...' : <><FileText className="w-4 h-4 mr-2" /> Submit to PSW</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CustomsWizard;
