import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileText, Package, Truck, Plus, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Logistics = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
      try {
        const [manifestsResp, containersResp] = await Promise.all([
          fetch(`${apiUrl}/api/manifests`),
          fetch(`${apiUrl}/api/containers`)
        ]);

        if (manifestsResp.ok && containersResp.ok) {
          const mData = await manifestsResp.json();
          const cData = await containersResp.json();

          const manifests = mData.manifests || [];

          // Group by mode for chart
          const byMode = manifests.reduce((acc: any, curr: any) => {
            acc[curr.transport_mode] = (acc[curr.transport_mode] || 0) + 1;
            return acc;
          }, {});
          const chartData = Object.keys(byMode).map(k => ({ mode: k.toUpperCase(), count: byMode[k] }));

          setStats({
            totalManifests: manifests.length,
            activeManifests: manifests.filter((m: any) => m.status !== 'completed').length,
            containers: cData.stats.total,
            availableContainers: cData.containers.filter((c: any) => c.status === 'available').length,
            chartData
          });
        }
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  if (!stats) return <DashboardLayout><div className="p-8">Loading Logistics Hub...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Logistics Hub</h1>
          <p className="text-gray-500">Manage shipments, BLs, and containers.</p>
        </div>
        <Link to="/logistics/create" className="bg-primary text-white px-4 py-2 rounded flex items-center shadow hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Create BL
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-blue-50 rounded-lg"><FileText className="text-blue-600 w-6 h-6" /></div>
          </div>
          <p className="text-2xl font-bold">{stats.totalManifests}</p>
          <p className="text-sm text-gray-500">Total BLs</p>
          <div className="mt-2 text-xs text-blue-600 font-medium">{stats.activeManifests} Active</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-orange-50 rounded-lg"><Package className="text-orange-600 w-6 h-6" /></div>
          </div>
          <p className="text-2xl font-bold">{stats.containers}</p>
          <p className="text-sm text-gray-500">Total Containers</p>
          <div className="mt-2 text-xs text-orange-600 font-medium">{stats.availableContainers} Available</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-purple-50 rounded-lg"><Truck className="text-purple-600 w-6 h-6" /></div>
          </div>
          <p className="text-2xl font-bold">24</p>
          <p className="text-sm text-gray-500">Pending Deliveries</p>
          <div className="mt-2 text-xs text-purple-600 font-medium">+4 Today</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">BLs by Mode</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData.length > 0 ? stats.chartData : [{ mode: 'No Data', count: 0 }]}>
                <XAxis dataKey="mode" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="space-y-3">
            <Link to="/logistics/manifests" className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
              <span className="text-sm font-medium">View All BLs</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link to="/logistics/containers" className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
              <span className="text-sm font-medium">Container Management</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link to="/logistics/create" className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
              <span className="text-sm font-medium">Book New Shipment</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Logistics;
