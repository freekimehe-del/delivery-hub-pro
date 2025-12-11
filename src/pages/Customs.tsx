import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layers, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export const CustomsContent = () => {
  const [stats, setStats] = useState<any>({
    pendingGDs: 0,
    totalDuty: 0,
    activeLCs: 0,
    gatePasses: 0
  });

  useEffect(() => {
    // Mock Fetch - in real app, one endpoint /api/customs/dashboard-stats
    const fetchStats = async () => {
      const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
      try {
        // We can simulate fetching or actually call our endpoints if we built a summary one
        // For now, we'll just mock based on what we know exists in DB via separate calls or hardcode for demo
        const gdRes = await fetch(`${apiUrl}/api/customs/declarations`);
        const gdJson = await gdRes.json();

        // Duty sum
        const duty = gdJson.declarations.reduce((sum: number, d: any) => sum + (d.total_duty || 0), 0);

        setStats({
          pendingGDs: gdJson.declarations.filter((d: any) => d.status !== 'cleared').length,
          totalDuty: duty,
          activeLCs: 3, // Mock
          gatePasses: 12 // Mock
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Declarations</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingGDs}</div>
            <p className="text-xs text-muted-foreground">In Examination / Filed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Duty Liability</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">PKR {(stats.totalDuty / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">To be paid for clearance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active L/Cs</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLCs}</div>
            <p className="text-xs text-muted-foreground">Letters of Credit Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gate Passes Issued</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gatePasses}</div>
            <p className="text-xs text-muted-foreground">Cleared this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Declarations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="font-medium">GD-2025-001</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">Examination</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="font-medium">GD-2025-002</span>
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Cleared</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Duty Payments Due</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span>Import: 850cc Vehicles</span>
              <span className="font-bold">PKR 1.2M</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Customs = () => {
  return (
    <DashboardLayout>
      <CustomsContent />
    </DashboardLayout>
  );
};

export default Customs;
