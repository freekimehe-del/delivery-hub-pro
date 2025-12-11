import React from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileText, Package, Truck, Plus, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchLogisticsStats = async () => {
  // 1. Fetch Manifests
  const { data: manifests } = await supabase
    .from('logistics_manifests')
    .select('*');

  // 2. Fetch Containers
  const { data: containers } = await supabase
    .from('container_inventory')
    .select('*');

  // 3. Fetch Bookings
  const { data: bookings } = await supabase
    .from('logistics_bookings' as any)
    .select(`
      *,
      customer:customers(name)
    `)
    .order('created_at', { ascending: false });

  const mList = manifests || [];
  const cList = containers || [];
  const bList = bookings || [];

  // Group by mode for chart
  const byMode = mList.reduce((acc: any, curr: any) => {
    const mode = curr.transport_mode || 'unknown';
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(byMode).map(k => ({ mode: k.toUpperCase(), count: byMode[k] }));

  return {
    totalManifests: mList.length,
    activeManifests: mList.filter((m: any) => m.status !== 'completed').length,
    containers: cList.length,
    availableContainers: cList.filter((c: any) => c.status === 'available').length,
    totalBookings: bList.length,
    pendingBookings: bList.filter((b: any) => ['draft', 'pending_approval'].includes(b.status)).length,
    chartData,
    bookings: bList
  };
};

const LogisticsDashboard = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['logisticsStats'],
    queryFn: fetchLogisticsStats
  });

  if (isLoading) {
    return <DashboardLayout><div className="p-8">Loading Logistics Hub...</div></DashboardLayout>;
  }

  if (isError || !stats) {
    return <DashboardLayout><div className="p-8 text-red-600">Error loading logistics data.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Logistics Hub</h1>
          <p className="text-gray-500">Manage shipments, manifests, and containers.</p>
        </div>
        <Link to="/logistics/bookings/create" className="bg-primary text-white px-4 py-2 rounded flex items-center shadow hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> New Booking
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-blue-50 rounded-lg"><FileText className="text-blue-600 w-6 h-6" /></div>
          </div>
          <p className="text-2xl font-bold">{stats.totalBookings}</p>
          <p className="text-sm text-gray-500">Total Bookings</p>
          <div className="mt-2 text-xs text-blue-600 font-medium">{stats.pendingBookings} Pending</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg"><Truck className="text-indigo-600 w-6 h-6" /></div>
          </div>
          <p className="text-2xl font-bold">{stats.totalManifests}</p>
          <p className="text-sm text-gray-500">Manifests / BLs</p>
          <div className="mt-2 text-xs text-indigo-600 font-medium">{stats.activeManifests} Active</div>
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
            <div className="p-2 bg-purple-50 rounded-lg"><Package className="text-purple-600 w-6 h-6" /></div>
          </div>
          <p className="text-2xl font-bold">24</p>
          <p className="text-sm text-gray-500">Pending Deliveries</p>
          <div className="mt-2 text-xs text-purple-600 font-medium">+4 Today</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Manifests by Mode</h3>
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
            <Link to="/logistics/bookings" className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
              <span className="text-sm font-medium">Booking Management</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link to="/logistics/manifests" className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
              <span className="text-sm font-medium">View All Manifests</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link to="/logistics/containers" className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
              <span className="text-sm font-medium">Container Management</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link to="/logistics/bookings/create" className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
              <span className="text-sm font-medium">Create New Booking</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
          <Link to="/logistics/bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Booking ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Mode</th>
                <th className="px-6 py-3">Route</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.bookings.slice(0, 5).map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-blue-600">
                    <Link to={`/logistics/bookings/${b.id}`}>{b.booking_number}</Link>
                  </td>
                  <td className="px-6 py-3">{b.customer?.name || '-'}</td>
                  <td className="px-6 py-3 uppercase">{b.transport_mode}</td>
                  <td className="px-6 py-3">{b.origin_location} → {b.destination_location}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                    ${['draft', 'pending_approval'].includes(b.status) ? 'bg-yellow-100 text-yellow-800' :
                        ['approved', 'scheduled'].includes(b.status) ? 'bg-blue-100 text-blue-800' :
                          ['completed', 'delivered'].includes(b.status) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link to={`/logistics/bookings/${b.id}`} className="text-gray-400 hover:text-gray-600">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {stats.bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No recent bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LogisticsDashboard;