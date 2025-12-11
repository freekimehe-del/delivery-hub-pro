// src/pages/customs/HSCodes.tsx
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus } from "lucide-react";

const HSCodes: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [codes, setCodes] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchCodes();
    }, []);

    const fetchCodes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('pct_codes')
                .select('*')
                .order('code', { ascending: true })
                .limit(50);

            if (error) throw error;
            setCodes(data || []);
        } catch (error) {
            console.error('Error fetching HS codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('pct_codes')
                .select('*')
                .or(`code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
                .limit(50);

            if (error) throw error;
            setCodes(data || []);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    // Quick add function for demonstration/seeding
    const addSampleCode = async () => {
        const newCode = {
            code: '8703.2113',
            description: 'Vehicles of a cylinder capacity exceeding 800cc but not exceeding 1000cc',
            customs_duty_rate: 30.0,
            sales_tax_rate: 17.0,
            income_tax_rate: 11.0,
            additional_customs_duty: 6.0,
            unit_of_measure: 'u'
        };

        const { error } = await supabase.from('pct_codes').insert([newCode]);
        if (error) alert("Error adding: " + error.message);
        else {
            alert("Added sample code 8703.2113");
            fetchCodes();
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pakistan Customs Tariff (PCT)</h1>
                    <p className="text-muted-foreground">Manage HS Codes and Duty Rates for compliance.</p>
                </div>
                <button
                    onClick={addSampleCode}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" /> Add Sample Code
                </button>
            </div>

            <div className="bg-white p-4 rounded shadow border mb-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by HS Code (e.g., 8703) or Description..."
                            className="w-full pl-9 border-gray-300 rounded-md shadow-sm p-2 border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded">Search</button>
                </form>
            </div>

            <div className="bg-white rounded shadow border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HS Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CD %</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ST %</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACD %</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IT %</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : codes.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No codes found. Add one to get started.</td></tr>
                        ) : (
                            codes.map((code) => (
                                <tr key={code.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{code.code}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate" title={code.description}>{code.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{code.customs_duty_rate}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{code.sales_tax_rate}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{code.additional_customs_duty}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{code.income_tax_rate}%</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};

export default HSCodes;
