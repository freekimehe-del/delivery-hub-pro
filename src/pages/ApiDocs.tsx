import { useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Copy,
  Check,
  ChevronRight,
  Key,
  Webhook,
  BookOpen,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const endpoints = [
  {
    method: "GET",
    path: "/v1/drivers",
    description: "List all drivers",
    color: "bg-fleet-green",
  },
  {
    method: "GET",
    path: "/v1/drivers/:id",
    description: "Get driver by ID",
    color: "bg-fleet-green",
  },
  {
    method: "POST",
    path: "/v1/drivers",
    description: "Create a new driver",
    color: "bg-primary",
  },
  {
    method: "GET",
    path: "/v1/vehicles",
    description: "List all vehicles",
    color: "bg-fleet-green",
  },
  {
    method: "POST",
    path: "/v1/orders",
    description: "Create a new order",
    color: "bg-primary",
  },
  {
    method: "GET",
    path: "/v1/orders/:id",
    description: "Get order by ID",
    color: "bg-fleet-green",
  },
  {
    method: "GET",
    path: "/v1/tracking/:id",
    description: "Get live tracking data",
    color: "bg-fleet-green",
  },
  {
    method: "DELETE",
    path: "/v1/orders/:id",
    description: "Cancel an order",
    color: "bg-destructive",
  },
];

const codeExample = `// Example: Create a new order
const response = await fetch('https://api.fleetops.io/v1/orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    pickup: {
      address: '123 Main St, New York, NY',
      coordinates: { lat: 40.7128, lng: -74.006 },
      contact: { name: 'John Doe', phone: '+1234567890' }
    },
    dropoff: {
      address: '456 Oak Ave, Brooklyn, NY',
      coordinates: { lat: 40.6892, lng: -73.9442 },
      contact: { name: 'Jane Smith', phone: '+1234567891' }
    },
    metadata: {
      priority: 'high',
      notes: 'Fragile items'
    }
  })
});

const data = await response.json();
console.log(data);`;

const responseExample = `{
  "data": {
    "id": "ord_123456789",
    "type": "order",
    "attributes": {
      "tracking_number": "FB123456",
      "status": "pending",
      "pickup": {
        "address": "123 Main St, New York, NY",
        "coordinates": { "lat": 40.7128, "lng": -74.006 }
      },
      "dropoff": {
        "address": "456 Oak Ave, Brooklyn, NY",
        "coordinates": { "lat": 40.6892, "lng": -73.9442 }
      },
      "created_at": "2024-01-15T09:30:00Z"
    }
  },
  "meta": {
    "request_id": "req_abc123"
  }
}`;

export default function ApiDocs() {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">API Documentation</h1>
        <p className="text-muted-foreground mt-1">
          Integrate FleetOps into your applications with our REST API.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: BookOpen, label: "Documentation", description: "Full API reference", href: "#" },
          { icon: Key, label: "API Keys", description: "Manage your keys", href: "/api/keys" },
          { icon: Webhook, label: "Webhooks", description: "Configure events", href: "/api/webhooks" },
        ].map((item, index) => (
          <motion.a
            key={item.label}
            href={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </motion.a>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Endpoints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card rounded-xl border border-border shadow-sm"
        >
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Terminal className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">API Endpoints</h3>
                <p className="text-xs text-muted-foreground">Available REST endpoints</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-border">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={endpoint.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.1 * index }}
                className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <Badge
                    className={cn(
                      "font-mono text-xs px-2 py-0.5",
                      endpoint.method === "GET" && "bg-fleet-green text-secondary-foreground",
                      endpoint.method === "POST" && "bg-primary text-primary-foreground",
                      endpoint.method === "DELETE" && "bg-destructive text-destructive-foreground"
                    )}
                  >
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {endpoint.description}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-card rounded-xl border border-border shadow-sm"
        >
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Code2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Code Example</h3>
                  <p className="text-xs text-muted-foreground">JavaScript / Node.js</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(codeExample)}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>
          <Tabs defaultValue="request" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
              <TabsTrigger value="request">Request</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>
            <TabsContent value="request" className="p-0 m-0">
              <pre className="p-4 text-xs overflow-x-auto bg-sidebar text-sidebar-foreground rounded-b-xl">
                <code>{codeExample}</code>
              </pre>
            </TabsContent>
            <TabsContent value="response" className="p-0 m-0">
              <pre className="p-4 text-xs overflow-x-auto bg-sidebar text-sidebar-foreground rounded-b-xl">
                <code>{responseExample}</code>
              </pre>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Base URL Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <ExternalLink className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Base URL</h4>
            <code className="text-sm text-primary mt-1 block">
              https://api.fleetops.io/v1
            </code>
            <p className="text-sm text-muted-foreground mt-2">
              All API requests should be made to this base URL. Authentication is required
              via Bearer token in the Authorization header.
            </p>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
