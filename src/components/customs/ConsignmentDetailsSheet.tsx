import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Consignment, type ConsignmentStatus, useCustomsDocuments, useUpdateConsignment } from "@/hooks/useCustoms";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/formatCurrency";
import { FileText, Package, Calculator, Warehouse, AlertTriangle, CheckCircle, XCircle, Download, Plus } from "lucide-react";
import { GenerateDocumentDialog } from "./GenerateDocumentDialog";
import { useState } from "react";

interface ConsignmentDetailsSheetProps {
  consignment: Consignment | null;
  onClose: () => void;
}

const statusConfig: Record<ConsignmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  cleared: { label: "Cleared", variant: "default" },
  held: { label: "Held", variant: "destructive" },
  released: { label: "Released", variant: "default" },
  bonded: { label: "Bonded", variant: "outline" },
  auctioned: { label: "Auctioned", variant: "secondary" },
};

export function ConsignmentDetailsSheet({ consignment, onClose }: ConsignmentDetailsSheetProps) {
  const [isGenerateDocOpen, setIsGenerateDocOpen] = useState(false);
  const { data: documents } = useCustomsDocuments(consignment?.id);
  const updateConsignment = useUpdateConsignment();

  if (!consignment) return null;

  // Use centralized formatCurrency util

  const handleStatusChange = async (newStatus: ConsignmentStatus) => {
    await updateConsignment.mutateAsync({
      id: consignment.id,
      status: newStatus,
      ...(newStatus === "cleared" ? { cleared_at: new Date().toISOString() } : {}),
    });
  };

  return (
    <>
      <Sheet open={!!consignment} onOpenChange={() => onClose()}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {consignment.tracking_number}
              </SheetTitle>
              <Badge variant={statusConfig[consignment.status].variant}>
                {statusConfig[consignment.status].label}
              </Badge>
            </div>
          </SheetHeader>

          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="duties">Duties</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-4">
              {/* Alerts */}
              {(consignment.is_perishable || consignment.is_life_saving_drug || consignment.requires_urgent_release) && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold">Priority Consignment</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {consignment.is_perishable && <Badge variant="destructive">Perishable</Badge>}
                    {consignment.is_life_saving_drug && <Badge variant="destructive">Life-Saving Drug</Badge>}
                    {consignment.requires_urgent_release && <Badge variant="destructive">Urgent Release</Badge>}
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Consignment Information
                </h4>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium capitalize">{consignment.consignment_type.replace("_", " ")}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Importer/Exporter</dt>
                    <dd className="font-medium">{consignment.importer_exporter_name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">NTN</dt>
                    <dd className="font-medium">{consignment.importer_exporter_ntn || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Import License</dt>
                    <dd className="font-medium">{consignment.import_license_number || "-"}</dd>
                  </div>
                </dl>
              </div>

              <Separator />

              {/* Goods Details */}
              <div>
                <h4 className="font-semibold mb-3">Goods Details</h4>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Description</dt>
                    <dd className="font-medium">{consignment.goods_description}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">HS Code</dt>
                    <dd className="font-mono font-medium">{consignment.hs_codes?.code || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Country of Origin</dt>
                    <dd className="font-medium">{consignment.country_of_origin || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Quantity</dt>
                    <dd className="font-medium">{consignment.quantity} {consignment.quantity_unit}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Declared Value</dt>
                    <dd className="font-medium">{formatCurrency(consignment.declared_value, consignment.currency || "PKR")}</dd>
                  </div>
                </dl>
              </div>

              <Separator />

              {/* Transport */}
              <div>
                <h4 className="font-semibold mb-3">Transport Details</h4>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Vessel/Flight</dt>
                    <dd className="font-medium">{consignment.vessel_flight_number || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Arrival Date</dt>
                    <dd className="font-medium">
                      {consignment.arrival_date ? format(new Date(consignment.arrival_date), "dd MMM yyyy") : "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Port of Origin</dt>
                    <dd className="font-medium">{consignment.port_of_origin || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Port of Destination</dt>
                    <dd className="font-medium">{consignment.port_of_destination || "-"}</dd>
                  </div>
                </dl>
              </div>

              {/* Carnet details for temporary imports */}
              {consignment.consignment_type === "temporary_import" && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">Temporary Import Details</h4>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Carnet Number</dt>
                        <dd className="font-medium">{consignment.carnet_number || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Vehicle Registration</dt>
                        <dd className="font-medium">{consignment.vehicle_registration || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Bank Guarantee</dt>
                        <dd className="font-medium">{formatCurrency(consignment.bank_guarantee_amount)}</dd>
                      </div>
                    </dl>
                  </div>
                </>
              )}

              {/* Warehousing */}
              {consignment.warehouse_id && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Warehouse className="h-4 w-4" />
                      Bonded Warehouse
                    </h4>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Warehouse</dt>
                        <dd className="font-medium">{consignment.warehouses?.name || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Bond Expiry</dt>
                        <dd className="font-medium">
                          {consignment.bond_expiry_date 
                            ? format(new Date(consignment.bond_expiry_date), "dd MMM yyyy")
                            : "-"
                          }
                        </dd>
                      </div>
                    </dl>
                  </div>
                </>
              )}

              {/* Actions */}
              <Separator />
              <div className="flex flex-wrap gap-2">
                {consignment.status === "pending" && (
                  <>
                    <Button onClick={() => handleStatusChange("cleared")} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Clear Consignment
                    </Button>
                    <Button variant="outline" onClick={() => handleStatusChange("held")}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Hold
                    </Button>
                    <Button variant="outline" onClick={() => handleStatusChange("bonded")}>
                      <Warehouse className="h-4 w-4 mr-2" />
                      Bond to Warehouse
                    </Button>
                  </>
                )}
                {consignment.status === "held" && (
                  <Button onClick={() => handleStatusChange("released")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Release
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="duties" className="space-y-6 mt-4">
              <div className="bg-muted/50 rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Duty Calculation
                </h4>
                
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Declared Value</dt>
                    <dd className="font-medium">{formatCurrency(consignment.declared_value, consignment.currency || "PKR")}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Customs Duty ({consignment.customs_duty_rate}%)</dt>
                    <dd className="font-medium">{formatCurrency(consignment.customs_duty_amount, consignment.currency || "PKR")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Sales Tax ({consignment.sales_tax_rate}%)</dt>
                    <dd className="font-medium">{formatCurrency(consignment.sales_tax_amount, consignment.currency || "PKR")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Additional Duty</dt>
                    <dd className="font-medium">{formatCurrency(consignment.additional_duty_amount, consignment.currency || "PKR")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Regulatory Duty</dt>
                    <dd className="font-medium">{formatCurrency(consignment.regulatory_duty_amount, consignment.currency || "PKR")}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <dt className="font-semibold">Total Payable</dt>
                    <dd className="font-bold text-primary">{formatCurrency(consignment.total_duty_amount, consignment.currency || "PKR")}</dd>
                  </div>
                </dl>
              </div>

              {consignment.hs_codes && (
                <div className="bg-card border rounded-lg p-4">
                  <h5 className="font-medium mb-2">HS Code Details</h5>
                  <p className="text-sm text-muted-foreground mb-1">
                    <span className="font-mono">{consignment.hs_codes.code}</span> - Chapter {consignment.hs_codes.chapter}
                  </p>
                  <p className="text-sm">{consignment.hs_codes.description}</p>
                  {consignment.hs_codes.is_restricted && (
                    <Badge variant="destructive" className="mt-2">Restricted Item</Badge>
                  )}
                  {consignment.hs_codes.requires_license && (
                    <Badge variant="outline" className="mt-2 ml-2">License Required</Badge>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Customs Documents</h4>
                <Button size="sm" onClick={() => setIsGenerateDocOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Document
                </Button>
              </div>

              {documents?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No documents generated yet</p>
                  <p className="text-sm">Generate IGM, EGM, or other customs documents</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents?.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium uppercase">{doc.document_type.replace("_", " ")}</p>
                          <p className="text-sm text-muted-foreground">{doc.document_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.is_verified ? (
                          <Badge variant="default">Verified</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        {doc.file_url && (
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <GenerateDocumentDialog 
        open={isGenerateDocOpen} 
        onOpenChange={setIsGenerateDocOpen}
        consignmentId={consignment.id}
      />
    </>
  );
}
