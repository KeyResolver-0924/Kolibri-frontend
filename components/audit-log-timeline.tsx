"use client";

import { useEffect, useState } from "react";
import { AuditLog } from "@/lib/types";
import { ApiError, getAuditLogs } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface AuditLogTimelineProps {
  deedId: string;
}

export function AuditLogTimeline({ deedId }: AuditLogTimelineProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setIsLoading(true);
        const data = await getAuditLogs(deedId);
        setLogs(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Ett oväntat fel uppstod");
        }
        console.error("Error fetching audit logs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, [deedId]);

  const getActionBadgeVariant = (actionType: AuditLog["action_type"]) => {
    if (actionType.includes("REMOVED") || actionType.includes("DELETED")) {
      return "destructive";
    }

    switch (actionType) {
      case "DEED_COMPLETED":
        return "default";
      case "DEED_CREATED":
      case "DEED_UPDATED":
        return "secondary";
      case "BORROWER_SIGNED":
      case "COOPERATIVE_SIGNER_SIGNED":
        return "default";
      case "BORROWER_ADDED":
      case "COOPERATIVE_SIGNER_ADDED":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("sv-SE", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const displayedLogs = isExpanded ? logs : logs.slice(0, 5);
  const hasMoreLogs = logs.length > 5;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Audit Log</h3>
          {hasMoreLogs && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-primary hover:underline"
            >
              {isExpanded ? "Visa färre" : "Visa alla"}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {displayedLogs.map((log, index) => (
            <div
              key={log.id}
              className={cn(
                "relative pl-8 pb-4",
                index !== displayedLogs.length - 1 && "border-l-2 border-muted"
              )}
            >
              <div className="absolute left-0 w-4 h-4 -translate-x-[9px] rounded-full bg-background border-2 border-primary" />

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant={getActionBadgeVariant(log.action_type)}>
                    {log.action_type.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(log.timestamp)}
                  </span>
                </div>

                {log.description && (
                  <p className="text-sm font-medium text-foreground">
                    {log.description}
                  </p>
                )}

                {log.user_id && (
                  <p className="text-xs text-muted-foreground">
                    Av: {log.user_id}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
