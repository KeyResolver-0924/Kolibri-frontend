"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeedList } from "./deed-list";
import { useState, useEffect } from "react";
import { DeedStatus, StatsSummary } from "@/lib/types";
import { getStatisticsSummary } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DashboardContent() {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStatisticsSummary();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    { title: "Totalt antal pantbrev", value: stats?.total_deeds ?? 0 },
    { title: "Totalt antal föreningar", value: stats?.total_cooperatives ?? 0 },
    {
      title: "Väntar på låntagares signering",
      value:
        stats?.status_distribution[DeedStatus.PENDING_BORROWER_SIGNATURE] ?? 0,
    },
    {
      title: "Väntar på föreningens signering",
      value:
        stats?.status_distribution[
          DeedStatus.PENDING_HOUSING_COOPERATIVE_SIGNATURE
        ] ?? 0,
    },
    {
      title: "Slutförda",
      value: stats?.status_distribution[DeedStatus.COMPLETED] ?? 0,
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pantbrev som kräver åtgärd</CardTitle>
        </CardHeader>
        <CardContent>
          <DeedList />
        </CardContent>
      </Card>
    </div>
  );
}
