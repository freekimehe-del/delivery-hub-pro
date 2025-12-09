import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsignmentsTab } from "@/components/customs/ConsignmentsTab";
import { CustomsDashboard } from "@/components/customs/CustomsDashboard";
import { WarehousesTab } from "@/components/customs/WarehousesTab";
import { HSCodesTab } from "@/components/customs/HSCodesTab";
import { AuctionsTab } from "@/components/customs/AuctionsTab";
import { ComplianceAlertsPanel } from "@/components/customs/ComplianceAlertsPanel";
import { FileText, Warehouse, Package, Gavel, AlertTriangle } from "lucide-react";

const Customs = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Customs & Warehousing</h1>
          <p className="text-muted-foreground">
            Manage customs compliance, bonded warehouses, and auction processes under SRO 450(I)/2001
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="consignments" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Consignments</span>
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Declarations</span>
                </TabsTrigger>
                <TabsTrigger value="warehouses" className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4" />
                  <span className="hidden sm:inline">Warehouses</span>
                </TabsTrigger>
                <TabsTrigger value="hs-codes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">HS Codes</span>
                </TabsTrigger>
                <TabsTrigger value="auctions" className="flex items-center gap-2">
                  <Gavel className="h-4 w-4" />
                  <span className="hidden sm:inline">Auctions</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="consignments">
                <ConsignmentsTab />
              </TabsContent>

              <TabsContent value="dashboard">
                <CustomsDashboard />
              </TabsContent>

              <TabsContent value="warehouses">
                <WarehousesTab />
              </TabsContent>

              <TabsContent value="hs-codes">
                <HSCodesTab />
              </TabsContent>

              <TabsContent value="auctions">
                <AuctionsTab />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <ComplianceAlertsPanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Customs;
