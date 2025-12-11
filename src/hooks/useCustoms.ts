import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type WarehouseType = "private_bonded" | "public_bonded" | "manufacturing_bond";
export type WarehouseLicenseStatus = "active" | "pending" | "suspended" | "expired" | "cancelled";
export type ConsignmentType = "import" | "export" | "transit" | "temporary_import";
export type ConsignmentStatus = "pending" | "cleared" | "held" | "released" | "bonded" | "auctioned";
export type DocumentType = "igm" | "egm" | "bill_of_lading" | "commercial_invoice" | "packing_list" | "certificate_of_origin" | "customs_declaration" | "carnet_de_passage";
export type AuctionStatus = "scheduled" | "active" | "completed" | "cancelled";
export type AuctionType = "public" | "private";

export interface HSCode {
  id: string;
  code: string;
  description: string;
  chapter: string;
  duty_rate: number;
  sales_tax_rate: number;
  additional_duty_rate: number | null;
  regulatory_duty_rate: number | null;
  is_restricted: boolean | null;
  requires_license: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  warehouse_type: WarehouseType;
  address: string;
  city: string;
  postal_code: string | null;
  capacity_sqft: number | null;
  capacity_weight_kg: number | null;
  license_number: string | null;
  license_status: WarehouseLicenseStatus;
  license_issue_date: string | null;
  license_expiry_date: string | null;
  bank_guarantee_amount: number | null;
  bank_guarantee_expiry: string | null;
  fire_safety_certificate: string | null;
  fire_safety_expiry: string | null;
  site_plan_url: string | null;
  owner_name: string | null;
  owner_contact: string | null;
  operator_profile_id: string | null;
  is_active: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Consignment {
  id: string;
  tracking_number: string;
  consignment_type: ConsignmentType;
  status: ConsignmentStatus;
  importer_exporter_name: string;
  importer_exporter_ntn: string | null;
  import_license_number: string | null;
  hs_code_id: string | null;
  goods_description: string;
  quantity: number;
  quantity_unit: string | null;
  declared_value: number;
  currency: string | null;
  country_of_origin: string | null;
  customs_duty_rate: number | null;
  customs_duty_amount: number | null;
  sales_tax_rate: number | null;
  sales_tax_amount: number | null;
  additional_duty_amount: number | null;
  regulatory_duty_amount: number | null;
  total_duty_amount: number | null;
  warehouse_id: string | null;
  bond_start_date: string | null;
  bond_expiry_date: string | null;
  is_perishable: boolean | null;
  is_life_saving_drug: boolean | null;
  requires_urgent_release: boolean | null;
  carnet_number: string | null;
  vehicle_registration: string | null;
  bank_guarantee_amount: number | null;
  vessel_flight_number: string | null;
  port_of_origin: string | null;
  port_of_destination: string | null;
  arrival_date: string | null;
  created_by: string | null;
  cleared_by: string | null;
  cleared_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  hs_codes?: HSCode;
  warehouses?: Warehouse;
}

export interface CustomsDocument {
  id: string;
  consignment_id: string | null;
  document_type: DocumentType;
  document_number: string;
  issue_date: string | null;
  expiry_date: string | null;
  file_url: string | null;
  is_verified: boolean | null;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface Auction {
  id: string;
  auction_number: string;
  auction_type: AuctionType;
  status: AuctionStatus;
  consignment_id: string | null;
  reserve_price: number;
  starting_bid: number | null;
  current_bid: number | null;
  winning_bid: number | null;
  scheduled_date: string;
  started_at: string | null;
  ended_at: string | null;
  auctioneer_name: string | null;
  auctioneer_license: string | null;
  winner_name: string | null;
  winner_ntn: string | null;
  winner_contact: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  consignments?: Consignment;
}

export interface AuctionBid {
  id: string;
  auction_id: string | null;
  bidder_name: string;
  bidder_ntn: string | null;
  bidder_contact: string | null;
  bid_amount: number;
  bid_time: string;
  is_winning: boolean | null;
  created_at: string;
}

export interface ComplianceAlert {
  id: string;
  alert_type: string;
  entity_type: string;
  entity_id: string;
  title: string;
  message: string;
  severity: string;
  due_date: string | null;
  is_resolved: boolean | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

// HS Codes hooks
export function useHSCodes() {
  return useQuery({
    queryKey: ["hs_codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hs_codes")
        .select("*")
        .order("code");
      if (error) throw error;
      return data as HSCode[];
    },
  });
}

export function useCreateHSCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<HSCode, "id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("hs_codes")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hs_codes"] });
      toast.success("HS Code created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create HS Code: " + error.message);
    },
  });
}

// Warehouses hooks
export function useWarehouses() {
  return useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warehouses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Warehouse[];
    },
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Warehouse>) => {
      const { data: result, error } = await supabase
        .from("warehouses")
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create warehouse: " + error.message);
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Warehouse> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("warehouses")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update warehouse: " + error.message);
    },
  });
}

// Consignments hooks
export function useConsignments() {
  return useQuery({
    queryKey: ["consignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consignments")
        .select("*, hs_codes(*), warehouses(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Consignment[];
    },
  });
}

export function useConsignment(id: string) {
  return useQuery({
    queryKey: ["consignment", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consignments")
        .select("*, hs_codes(*), warehouses(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Consignment | null;
    },
    enabled: !!id,
  });
}

export function useCreateConsignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Consignment>) => {
      const { data: result, error } = await supabase
        .from("consignments")
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consignments"] });
      toast.success("Consignment created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create consignment: " + error.message);
    },
  });
}

export function useUpdateConsignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Consignment> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("consignments")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consignments"] });
      toast.success("Consignment updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update consignment: " + error.message);
    },
  });
}

// Customs Documents hooks
export function useCustomsDocuments(consignmentId?: string) {
  return useQuery({
    queryKey: ["customs_documents", consignmentId],
    queryFn: async () => {
      let query = supabase.from("customs_documents").select("*");
      if (consignmentId) {
        query = query.eq("consignment_id", consignmentId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as CustomsDocument[];
    },
  });
}

export function useCreateCustomsDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<CustomsDocument>) => {
      const { data: result, error } = await supabase
        .from("customs_documents")
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customs_documents"] });
      toast.success("Document created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create document: " + error.message);
    },
  });
}

// Auctions hooks
export function useAuctions() {
  return useQuery({
    queryKey: ["auctions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auctions")
        .select("*, consignments(*)")
        .order("scheduled_date", { ascending: false });
      if (error) throw error;
      return data as Auction[];
    },
  });
}

export function useCreateAuction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Auction>) => {
      const { data: result, error } = await supabase
        .from("auctions")
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      toast.success("Auction created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create auction: " + error.message);
    },
  });
}

// Auction Bids hooks
export function useAuctionBids(auctionId: string) {
  return useQuery({
    queryKey: ["auction_bids", auctionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auction_bids")
        .select("*")
        .eq("auction_id", auctionId)
        .order("bid_time", { ascending: false });
      if (error) throw error;
      return data as AuctionBid[];
    },
    enabled: !!auctionId,
  });
}

export function useCreateAuctionBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AuctionBid>) => {
      const { data: result, error } = await supabase
        .from("auction_bids")
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auction_bids"] });
      toast.success("Bid placed successfully");
    },
    onError: (error) => {
      toast.error("Failed to place bid: " + error.message);
    },
  });
}

// Compliance Alerts hooks
export function useComplianceAlerts() {
  return useQuery({
    queryKey: ["compliance_alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_alerts")
        .select("*")
        .eq("is_resolved", false)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as ComplianceAlert[];
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from("compliance_alerts")
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance_alerts"] });
      toast.success("Alert resolved");
    },
    onError: (error) => {
      toast.error("Failed to resolve alert: " + error.message);
    },
  });
}
// Clearance Jobs hooks
export function useClearanceJobs() {
  return useQuery({
    queryKey: ["clearance_jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clearance_jobs" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
