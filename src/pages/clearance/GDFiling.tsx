// src/pages/clearance/GDFiling.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Save, CheckCircle } from "lucide-react";

const GDFiling: React.FC = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [job, setJob] = useState<any>(null);

    // GD Form state
    const [formData, setFormData] = useState({
        gd_type: "IM", // Import
        consignment_category: "commercial",
        declaration_type: "home_consumption", // HC
        payment_mode: "cash",
        trader_ntn: "1234567-8", // Mock
        consignor_name: "",
        consignor_address: "",
        total_packages: "",
        gross_weight: "",
    });

    const [lineItems, setLineItems] = useState([
        { description: "", hs_code: "", quantity: "", unit_value: "", total_value: 0 }
    ]);

    const addLineItem = () => {
        setLineItems([...lineItems, { description: "", hs_code: "", quantity: "", unit_value: "", total_value: 0 }]);
    };

    const removeLineItem = (index: number) => {
        const newItems = [...lineItems];
        newItems.splice(index, 1);
        setLineItems(newItems);
    };

    const updateLineItem = (index: number, field: string, value: any) => {
        const newItems = [...lineItems];
        (newItems[index] as any)[field] = value;
        // Auto-calc total
        if (field === 'quantity' || field === 'unit_value') {
            const qty = parseFloat(newItems[index].quantity) || 0;
            const val = parseFloat(newItems[index].unit_value) || 0;
            newItems[index].total_value = qty * val;
        }
        setLineItems(newItems);
    };

    useEffect(() => {
        if (jobId) fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('clearance_jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            if (error) throw error;
            setJob(data);
            setFormData(prev => ({
                ...prev,
                consignor_name: data.vessel_name || "",
            }));
        } catch (error) {
            console.error(error);
            alert("Error loading job");
        } finally {
            setLoading(false);
        }
    };

    const handleFileGD = async () => {
        setSubmitting(true);
        try {
            // 1. Create GD Record
            const { data: gd, error: gdError } = await supabase
                .from('goods_declarations')
                .insert([{
                    job_id: jobId,
                    gd_number: `GD-${Math.floor(Math.random() * 90000) + 10000}`,
                    status: 'submitted',
                    submission_date: new Date().toISOString(),
                    package_count: parseInt(formData.total_packages) || 0,
                    gross_weight: parseFloat(formData.gross_weight) || 0,
                    package_type: 'CT',
                    psid_number: `PSID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                }])
                .select()
                .single();

            if (gdError) throw gdError;

            // 2. Insert Line Items
            if (lineItems.length > 0) {
                const itemsToInsert = lineItems.map(item => ({
                    gd_id: gd.id,
                    description: item.description,
                    quantity: parseFloat(item.quantity) || 0,
                    unit_value_usd: parseFloat(item.unit_value) || 0,
                    assessable_value_pkr: (parseFloat(item.quantity) * parseFloat(item.unit_value)) * 278,
                }));

                const { error: itemsError } = await supabase
                    .from('gd_line_items')
                    .insert(itemsToInsert);

                if (itemsError) throw itemsError;
            }

            // 3. Update Job Status
            const { error: jobError } = await supabase
                .from('clearance_jobs')
                .update({ status: 'gd_filed' })
                .eq('id', jobId);

            if (jobError) throw jobError;

            alert(`GD Filed Successfully! GD #: ${gd.gd_number}`);
            navigate('/clearance');

        } catch (error: any) {
            alert("Filing Failed: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div>Loading Job...</div>;

    return (
        <DashboardLayout>
            <style>{`
                @media print {
                    @page { size: A4; margin: 1cm; }
                    body * { visibility: hidden; }
                    #gd-print-area, #gd-print-area * { visibility: visible; }
                    #gd-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="mb-6 flex justify-between items-center no-print">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">File Goods Declaration (GD)</h1>
                    <p className="text-muted-foreground">Submit declaration to Pakistan Single Window (PSW/WeBOC).</p>
                </div>
                {job?.status === 'gd_filed' && (
                    <button
                        onClick={handlePrint}
                        className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-900 transition flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" /> Print GD
                    </button>
                )}
            </div>

            <div id="gd-print-area" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Print Header (Visible only in print) */}
                <div className="hidden print:block col-span-3 mb-4 text-center border-b pb-4">
                    <h2 className="text-xl font-bold uppercase">Pakistan Customs Service</h2>
                    <h3 className="text-lg">Goods Declaration (Import)</h3>
                    <p className="text-sm">WeBOC System Generated</p>
                </div>

                {/* Job Info Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-2">Job Summary</h3>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between"><span>Job #:</span> <span className="font-medium">{job?.job_number}</span></div>
                            <div className="flex justify-between"><span>BL Info:</span> <span className="font-medium">{job?.bl_number}</span></div>
                            <div className="flex justify-between"><span>Port:</span> <span className="font-medium">{job?.port_of_discharge}</span></div>
                            <div className="flex justify-between"><span>Mode:</span> <span className="font-medium uppercase">{job?.transport_mode}</span></div>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="lg:col-span-2 bg-white p-6 rounded shadow border">
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                            <FileText className="w-5 h-5" /> Declaration Details
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Declaration Type</label>
                                <select
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border bg-gray-50"
                                    value={formData.declaration_type}
                                    onChange={e => setFormData({ ...formData, declaration_type: e.target.value })}
                                >
                                    <option value="home_consumption">Home Consumption (HC)</option>
                                    <option value="warehouse">Into Bond (IB)</option>
                                    <option value="transshipment">Transshipment (TP)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Consignment Category</label>
                                <select
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border bg-gray-50"
                                    value={formData.consignment_category}
                                    onChange={e => setFormData({ ...formData, consignment_category: e.target.value })}
                                >
                                    <option value="commercial">Commercial</option>
                                    <option value="non_commercial">Non-Commercial</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Total Packages</label>
                                <input
                                    type="number"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                    value={formData.total_packages}
                                    onChange={e => setFormData({ ...formData, total_packages: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gross Weight (KG)</label>
                                <input
                                    type="number"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                    value={formData.gross_weight}
                                    onChange={e => setFormData({ ...formData, gross_weight: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Exporter / Consignor Name</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={formData.consignor_name}
                                onChange={e => setFormData({ ...formData, consignor_name: e.target.value })}
                            />
                        </div>

                        {/* Line Items Section */}
                        <div className="border-t pt-4">
                            <h3 className="text-md font-semibold mb-3">Line Items</h3>
                            <div className="space-y-3">
                                {lineItems.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded">
                                        <div className="col-span-4">
                                            <label className="text-xs font-medium block">Description</label>
                                            <input
                                                className="w-full p-1 border rounded text-sm"
                                                placeholder="Item Name"
                                                value={item.description}
                                                onChange={e => updateLineItem(idx, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-medium block">HS Code</label>
                                            <input
                                                className="w-full p-1 border rounded text-sm"
                                                placeholder="8703.21"
                                                value={item.hs_code}
                                                onChange={e => updateLineItem(idx, 'hs_code', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-medium block">Qty</label>
                                            <input
                                                type="number"
                                                className="w-full p-1 border rounded text-sm"
                                                placeholder="0"
                                                value={item.quantity}
                                                onChange={e => updateLineItem(idx, 'quantity', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-medium block">Unit Val ($)</label>
                                            <input
                                                type="number"
                                                className="w-full p-1 border rounded text-sm"
                                                placeholder="0.00"
                                                value={item.unit_value}
                                                onChange={e => updateLineItem(idx, 'unit_value', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            <button
                                                onClick={() => removeLineItem(idx)}
                                                disabled={lineItems.length === 1}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addLineItem}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    + Add Line Item
                                </button>
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm">
                            <h4 className="font-semibold text-yellow-800 mb-1">Simulated Filing</h4>
                            <p>Clicking "File GD" will submit this data to our internal simulation engine, generate a specific GD Number, and move the job status to <strong>GD Filed</strong>.</p>
                        </div>

                        <div className="pt-4 flex justify-end no-print">
                            <button
                                onClick={handleFileGD}
                                disabled={submitting || job?.status === 'gd_filed'}
                                className={`px-6 py-2 rounded shadow transition flex items-center gap-2 font-medium ${job?.status === 'gd_filed'
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {job?.status === 'gd_filed' ? 'GD Already Filed' : (submitting ? 'Submitting...' : (
                                    <>
                                        <CheckCircle className="w-4 h-4" /> File GD
                                    </>
                                ))}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default GDFiling;
