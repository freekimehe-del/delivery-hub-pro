import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import ContainerShipHandler from "@/modules/Shipment_Creation_Module/Shipment_Type_Manager/Container_Ship_Handler";
import RoadFreightHandler from "@/modules/Shipment_Creation_Module/Shipment_Type_Manager/Road_Freight_Handler";
import AirFreightHandler from "@/modules/Shipment_Creation_Module/Shipment_Type_Manager/Air_Freight_Handler";

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
    const id = uuidv4();
    const payload = { id, ...form };

    try {
      // Try to persist via API. If API fails, fallback to localStorage
      const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
      const body = { shipment_ref: `SHP-${Date.now()}`, type: form.type, mode: form.type, origin: form.origin, destination: form.destination, value: form.value };
      let record: any = null;
      try {
        const resp = await fetch(`${apiUrl}/api/shipments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (resp.ok) {
          // server returns the created record
          const json = await resp.json();
          record = json;
        } else {
          throw new Error('api_error');
        }
      } catch (e) {
        // fallback: call local handlers and persist locally
        let resp: any = null;
        if (form.type === "container") {
          const handler = new ContainerShipHandler();
          resp = await handler.createFCL(payload);
        } else if (form.type === "road") {
          const handler = new RoadFreightHandler();
          resp = await handler.createRoadShipment(payload as any);
        } else {
          const handler = new AirFreightHandler();
          resp = await handler.createAirShipment(payload as any);
        }
        record = { id, shipment_ref: `SHP-${Date.now()}`, type: form.type, origin: form.origin, destination: form.destination, value: form.value, createdAt: new Date().toISOString(), meta: resp };
      }

      // If a document was selected, upload and attach metadata
      if (file) {
        try {
          const apiUploadUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
          const formData = new FormData();
          formData.append('file', file as any, file.name);
          formData.append('shipment_id', record.id || record.shipment_ref || 'unlinked');
          const resp = await fetch(`${apiUploadUrl}/api/documents/upload`, { method: 'POST', body: formData });
          if (resp.ok) {
            const json = await resp.json();
            setDocResult(json);
            // Attach to local record meta for quick reference
            record.meta = { ...(record.meta || {}), document: json };
            // Persist updated record locally as well
            persistShipment(record);
          }
        } catch (uploadErr) {
          console.error('document upload failed', uploadErr);
        }
      }

      persistShipment(record);
      navigate("/logistics/shipments");
    } catch (err) {
      console.error(err);
      alert("Failed to create shipment");
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default CreateShipment;
