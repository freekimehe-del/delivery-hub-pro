import { motion } from "framer-motion";
import {
  Building2,
  Bell,
  Map,
  Shield,
  CreditCard,
  Users,
  Save,
  Upload,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Settings() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your company profile and preferences.
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="w-4 h-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-6"
          >
            {/* Company Profile */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold mb-6">Company Profile</h3>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=imatech" />
                    <AvatarFallback>IM</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </Button>
                </div>
                <div className="flex-1 grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" defaultValue="imatech Inc." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" defaultValue="https://imatech.io" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue="contact@imatech.io" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" defaultValue="+1 (555) 123-4567" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue="123 Fleet Street, New York, NY 10001" />
                  </div>
                </div>
              </div>
            </div>

            {/* Fleet Configuration */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold mb-6">Fleet Configuration</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="America/New_York" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" defaultValue="USD" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distanceUnit">Distance Unit</Label>
                  <Input id="distanceUnit" defaultValue="Miles" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightUnit">Weight Unit</Label>
                  <Input id="weightUnit" defaultValue="Pounds (lbs)" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="gradient" className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card rounded-xl border border-border p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              {[
                {
                  title: "Order Updates",
                  description: "Receive notifications for new orders and status changes",
                  enabled: true,
                },
                {
                  title: "Driver Alerts",
                  description: "Get notified when drivers go online/offline",
                  enabled: true,
                },
                {
                  title: "Delivery Confirmations",
                  description: "Receive proof of delivery notifications",
                  enabled: true,
                },
                {
                  title: "Maintenance Reminders",
                  description: "Get alerts for upcoming vehicle maintenance",
                  enabled: false,
                },
                {
                  title: "Weekly Reports",
                  description: "Receive weekly performance summary emails",
                  enabled: true,
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between py-4 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked={item.enabled} />
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold mb-6">Security Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <p className="font-medium">Session Management</p>
                    <p className="text-sm text-muted-foreground">
                      View and manage active sessions
                    </p>
                  </div>
                  <Button variant="outline">View Sessions</Button>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">
                      Update your account password
                    </p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Current Plan</h3>
                <Button variant="gradient">Upgrade Plan</Button>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-fleet-purple/10 rounded-xl p-6 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">You're currently on</p>
                    <p className="text-2xl font-bold mt-1">Growth Plan</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      $299/month • Billed monthly
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Next billing date</p>
                    <p className="font-semibold mt-1">February 15, 2024</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold mb-6">Usage This Month</h3>
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">API Calls</p>
                  <p className="text-2xl font-bold mt-1">8,432</p>
                  <p className="text-xs text-muted-foreground">of 10,000 included</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Drivers</p>
                  <p className="text-2xl font-bold mt-1">38</p>
                  <p className="text-xs text-muted-foreground">of 50 seats</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold mt-1">12.4 GB</p>
                  <p className="text-xs text-muted-foreground">of 50 GB included</p>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
