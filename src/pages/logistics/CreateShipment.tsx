import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import ContainerShipHandler from "@/modules/Shipment_Creation_Module/Shipment_Type_Manager/Container_Ship_Handler";
import RoadFreightHandler from "@/modules/Shipment_Creation_Module/Shipment_Type_Manager/Road_Freight_Handler";
import AirFreightHandler from "@/modules/Shipment_Creation_Module/Shipment_Type_Manager/Air_Freight_Handler";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

type FormState = {
  type: "container" | "road" | "air";
  origin: string;
  destination: string;
  value?: number;
};

const storageKey = "mock_shipments";

function persistShipment(record: any) {
  try {
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    existing.unshift(record);
    localStorage.setItem(storageKey, JSON.stringify(existing));
  } catch (e) {
    console.error(e);
  }
}

const CreateShipment: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ type: "container", origin: "", destination: "", value: 0 });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docResult, setDocResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const shipmentRef = `SHP-${Date.now()}`;
    const payload = {
      shipment_ref: shipmentRef,
      type: form.type, // container, road, air
      mode: form.type, // Map type to mode for now
      origin: form.origin,
      destination: form.destination,
      status: 'draft',
      // value is not in schema but we can add it to transit_points JSON or ignore
      transit_points: { value: form.value }
    };

    try {
      const { data, error } = await supabase
        .from('shipment_master')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      // If file exists, we would upload to storage here. For now, we skip it or just log it.
      if (file) {
        console.log("File upload skipped (Bucket not configured yet).");
      }

      alert(`Shipment Created: ${data.shipment_ref}`);
      navigate("/logistics/shipments");
    } catch (err: any) {
      console.error(err);
      alert("Failed to create shipment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create Shipment</h2>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div>
            <label className="block text-sm mb-1">Shipment Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((s) => ({ ...s, type: e.target.value as any }))}
              className="w-full px-3 py-2 rounded border"
            >
              <option value="container">Container (FCL/LCL)</option>
              <option value="road">Road Freight</option>
              <option value="air">Air Freight</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Origin</label>
            <input value={form.origin} onChange={(e) => setForm((s) => ({ ...s, origin: e.target.value }))} className="w-full px-3 py-2 rounded border" />
          </div>

          <div>
            <label className="block text-sm mb-1">Destination</label>
            <input value={form.destination} onChange={(e) => setForm((s) => ({ ...s, destination: e.target.value }))} className="w-full px-3 py-2 rounded border" />
          </div>

          <div>
            <label className="block text-sm mb-1">Value (PKR)</label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setForm((s) => ({ ...s, value: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded border"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-primary text-white">
              {loading ? "Creating..." : "Create Shipment"}
            </button>
          </div>
          <div className="mt-4">
            <label className="block text-sm mb-1">Upload Invoice / Documents</label>
            <input
              type="file"
              accept="application/pdf,image/*,text/*"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="w-full"
            />
            {docResult && (
              <div className="mt-3 p-3 border rounded bg-muted/10">
                <div className="font-medium mb-1">Document OCR & HS Extraction</div>
                <div className="text-xs mb-2">Extracted text (truncated):</div>
                <pre className="text-xs max-h-40 overflow-auto bg-white p-2 rounded">{String(docResult.ocrText).slice(0, 200)}</pre>
                <div className="mt-2 text-sm">
                  <strong>HS Candidates:</strong> {Array.isArray(docResult.hsCodes) ? docResult.hsCodes.join(', ') : '—'}
                </div>
                <div className="mt-2 text-sm">
                  <strong>HS Validation:</strong>
                  <ul className="list-disc ml-5 text-xs">
                    {Array.isArray(docResult.hsValidation) && docResult.hsValidation.length > 0 ? (
                      docResult.hsValidation.map((v: any) => (
                        <li key={v.code}>{v.code} — {v.found ? 'Known' : 'Unknown'}</li>
                      ))
                    ) : (
                      <li>None</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateShipment;
