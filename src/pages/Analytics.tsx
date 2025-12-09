import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
      try {
        const resp = await fetch(`${apiUrl}/api/analytics/advanced`);
        if (resp.ok) {
          const json = await resp.json();
          setData(json.metrics);
        }
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  if (!data) return <DashboardLayout><div>Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Advanced Analytics</h1>
        <p className="text-muted-foreground">Insights on cost savings and operational efficiency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow border">
          <h3 className="text-lg font-medium text-gray-500">Detention Savings</h3>
          <p className="text-3xl font-bold text-green-600">PKR {data.detention_savings.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border">
          <h3 className="text-lg font-medium text-gray-500">Repositioning Costs</h3>
          <p className="text-3xl font-bold text-red-500">PKR {data.repositioning_costs.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border">
          <h3 className="text-lg font-medium text-gray-500">Efficiency Score</h3>
          <p className="text-3xl font-bold text-blue-500">{data.efficiency_score}/100</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow border">
        <h3 className="text-lg font-semibold mb-4">Manifest Volume Trends</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.volume_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="volume" fill="#4f46e5" name="Shipments" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
