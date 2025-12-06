import { useComplianceAlerts, useResolveAlert } from "@/hooks/useCustoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Bell, CheckCircle, Calendar, Loader2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const severityConfig: Record<string, { icon: typeof AlertTriangle; color: string; bgColor: string }> = {
  error: { icon: AlertTriangle, color: "text-destructive", bgColor: "bg-destructive/10" },
  warning: { icon: Bell, color: "text-orange-500", bgColor: "bg-orange-50" },
  info: { icon: Bell, color: "text-blue-500", bgColor: "bg-blue-50" },
};

export function ComplianceAlertsPanel() {
  const { data: alerts, isLoading } = useComplianceAlerts();
  const resolveAlert = useResolveAlert();

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, urgent: true };
    if (days === 0) return { text: "Due today", urgent: true };
    if (days <= 7) return { text: `${days} days left`, urgent: true };
    return { text: `${days} days left`, urgent: false };
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Compliance Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : alerts?.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
            <p className="text-sm font-medium">All Clear!</p>
            <p className="text-xs text-muted-foreground">No pending compliance alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts?.map((alert) => {
              const config = severityConfig[alert.severity] || severityConfig.info;
              const daysInfo = getDaysUntilDue(alert.due_date);
              const Icon = config.icon;
              
              return (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border ${config.bgColor}`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`h-4 w-4 mt-0.5 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">{alert.title}</p>
                        <Badge 
                          variant={alert.severity === "error" ? "destructive" : "secondary"}
                          className="text-xs shrink-0"
                        >
                          {alert.alert_type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {alert.message}
                      </p>
                      {alert.due_date && (
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className={`text-xs ${daysInfo?.urgent ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                            {format(new Date(alert.due_date), "dd MMM yyyy")}
                            {daysInfo && ` (${daysInfo.text})`}
                          </span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 text-xs"
                        onClick={() => resolveAlert.mutate(alert.id)}
                        disabled={resolveAlert.isPending}
                      >
                        {resolveAlert.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        Resolve
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Alerts are generated for license expirations, bond expiries, and compliance deadlines per SRO 450(I)/2001.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
