import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const storageKey = "mock_shipments";

const Shipments: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      // Prefer API-backed list if available
      const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4001';
      try {
        const resp = await fetch(`${apiUrl}/api/shipments`);
        if (resp.ok) {
          const json = await resp.json();
          if (mounted && Array.isArray(json.shipments)) {
            setItems(json.shipments);
            return;
          }
        }
      } catch (e) {
        // ignore and fallback to localStorage
      }

      try {
        const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (mounted) setItems(stored);
      } catch (e) {
        if (mounted) setItems([]);
      }
    }

    load();
    return () => { mounted = false };
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Shipments</h2>
        <Link to="/logistics/create" className="px-3 py-2 rounded bg-primary text-white">
          Create
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No shipments created yet.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={s.id} className="p-3 border rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{s.type.toUpperCase()} — {s.shipment_ref || s.id}</div>
                    <div className="text-sm text-muted-foreground">{s.origin} → {s.destination}</div>
                    <div className="text-xs mt-1">Status: <strong className="uppercase">{(s.status || 'created')}</strong></div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">PKR {Number(s.value || 0).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{new Date(s.created_at || s.createdAt || Date.now()).toLocaleString()}</div>
                  </div>
                </div>
              </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Shipments;
