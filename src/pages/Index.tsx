import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Activity,
  Truck,
  DollarSign,
  FileText,
  AlertCircle,
  Package,
  ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  revenue?: number;
  activeShipments?: number;
  containerPool?: number;
  efficiency?: number;
  volumeTrend?: unknown[];
  activeDeclarations?: number;
}

const Index: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function load() {
      const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
      try {
        // Fetch centralized stats (aggregated from different endpoints or a new summary endpoint)
        const [analyticsResp, fleetResp, logisticsResp] = await Promise.all([
          fetch(`${apiUrl}/api/analytics/advanced`), // for revenue
          fetch(`${apiUrl}/api/shipments`), // for logistics volume
          fetch(`${apiUrl}/api/containers`) // for fleet/assets
        ]);

        if (analyticsResp.ok && fleetResp.ok && logisticsResp.ok) {
          const analytics = await analyticsResp.json();
          const shipments = await fleetResp.json();
          const containers = await logisticsResp.json();

          // Fetch Customs Data separately (handling potential failures gracefully if module not ready)
          let activeDeclarations = 0;
          try {
            const customsResp = await fetch(`${apiUrl}/api/customs/declarations`);
            if (customsResp.ok) {
              const cData = await customsResp.json();
              activeDeclarations = cData.declarations ? cData.declarations.filter((d: any) => d.status !== 'cleared').length : 0;
            }
          } catch (e) {
            // Ignore errors
          }

          setStats({
            revenue: analytics.metrics.revenue_pipeline,
            activeShipments: shipments.shipments ? shipments.shipments.length : 0,
            containerPool: containers.stats.total,
            efficiency: analytics.metrics.efficiency_score,
            volumeTrend: analytics.metrics.volume_trend,
            activeDeclarations
          });
        }
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  if (!stats) return <DashboardLayout><div className="p-8">Loading Command Center...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Command Center</h1>
          <p className="text-gray-500 mt-1">System-wide operational overview.</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-green-600">System Online</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">+12%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Active Shipments</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.activeShipments}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+8%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Revenue Pipeline</h3>
          <p className="text-2xl font-bold text-gray-900">PKR {stats.revenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Fleet Efficiency</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.efficiency}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Container Pool</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.containerPool}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Pending Customs</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.activeDeclarations}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Volume Trends</h3>
            <Link to="/analytics" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
              View Report <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.volumeTrend}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="volume" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Integration Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-6">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Fleet Bridge</p>
                <p className="text-xs text-gray-500">Auto-Dispatch Active</p>
              </div>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Billing Bridge</p>
                <p className="text-xs text-gray-500">Invoice Sync Active</p>
              </div>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Customs Bridge</p>
                <p className="text-xs text-gray-500">PSW Link Active</p>
              </div>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/logistics/create" className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
                <FileText className="h-5 w-5 text-gray-600 mb-1" />
                <span className="text-xs font-medium text-gray-900">New Manifest</span>
              </Link>
              <Link to="/customs/filing" className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
                <FileText className="h-5 w-5 text-gray-600 mb-1" />
                <span className="text-xs font-medium text-gray-900">File Customs</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
