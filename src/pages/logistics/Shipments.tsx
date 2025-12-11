import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

const Shipments: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await (supabase as any)
        .from('shipment_master')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setItems(data);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout>
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
              <li key={s.id} className="p-3 border rounded-lg bg-white">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{s.type?.toUpperCase()} — {s.shipment_ref || s.id}</div>
                    <div className="text-sm text-muted-foreground">{s.origin} → {s.destination}</div>
                    <div className="text-xs mt-1">
                      Status: <strong className="uppercase">{s.status}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    {/* Mock Value if missing in schema */}
                    <div className="font-semibold">PKR {Number(s.transit_points?.value || 0).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Shipments;
