"use client";

// import { useState, useEffect } from "react";
// import { createClient } from "@/lib/supabase";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { DeedStatus } from "@/lib/types";
// import { AlertCircle, FileText, Clock, CheckCircle, User } from "lucide-react";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { useUser } from "@/contexts/user-context";

export function DashboardContent() {
  // const [stats, setStats] = useState<any>(null);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const supabase = createClient();
  // const { user, isLoading: userLoading } = useUser();

  // useEffect(() => {
  //   const fetchStats = async () => {
  //     try {
  //       const { data, error } = await supabase.rpc("get_dashboard_stats");
  //       if (error) throw error;
  //       setStats(data);
  //     } catch (err) {
  //       console.log(err);
  //       setError("error");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   // Only fetch stats if we have a user
  //   if (user && !userLoading) {
  //     fetchStats();
  //   }
  // }, [user, userLoading, supabase]);

  // const totalDeeds = stats?.total_deeds ?? 0;
  // const pendingSignatures =
  //   stats?.status_distribution[DeedStatus.PENDING_COOPERATIVE_SIGNATURE] ?? 0;
  // const completedDeeds = stats?.status_distribution[DeedStatus.COMPLETED] ?? 0;

  // const statsCards = [
  //   {
  //     id: 1,
  //     name: "Total Mortgage Deeds",
  //     stat: totalDeeds,
  //     icon: FileText,
  //   },
  //   {
  //     id: 2,
  //     name: "Pending Signatures",
  //     stat: pendingSignatures,
  //     icon: Clock,
  //   },
  //   {
  //     id: 3,
  //     name: "Completed Deeds",
  //     stat: completedDeeds,
  //     icon: CheckCircle,
  //   },
  // ];

  // if (error) {
  //   return (
  //     <Alert variant="destructive">
  //       <AlertCircle className="h-4 w-4" />
  //       <AlertDescription>
  //         Failed to load dashboard statistics: {error}
  //       </AlertDescription>
  //     </Alert>
  //   );
  // }

  // if (userLoading) {
  //   return (
  //     <div className="space-y-6">
  //       <div className="grid gap-6 md:grid-cols-3">
  //         {[1, 2, 3].map((id) => (
  //           <Card key={id}>
  //             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  //               <Skeleton className="h-4 w-[100px]" />
  //               <Skeleton className="h-4 w-4" />
  //             </CardHeader>
  //             <CardContent>
  //               <Skeleton className="h-8 w-20" />
  //             </CardContent>
  //           </Card>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="">Dashboard</div>
    // <div className="space-y-6">
    //   {user && (
    //     <div className="flex items-center gap-2 mb-6">
    //       <User className="h-5 w-5" />
    //       <span>Welcome, {user.user_name}</span>
    //       {user.role === "cooperative_admin" && (
    //         <span className="text-muted-foreground">(Cooperative Admin)</span>
    //       )}
    //       {user.role === "bank_user" && (
    //         <span className="text-muted-foreground">({user.bank_name})</span>
    //       )}
    //     </div>
    //   )}

    //   <div className="grid gap-6 md:grid-cols-3">
    //     {statsCards.map((stat) => (
    //       <Card key={stat.id}>
    //         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    //           <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
    //           <stat.icon className="h-4 w-4 text-muted-foreground" />
    //         </CardHeader>
    //         <CardContent>
    //           {isLoading ? (
    //             <Skeleton className="h-8 w-20" />
    //           ) : (
    //             <div className="text-2xl font-bold">{stat.stat}</div>
    //           )}
    //         </CardContent>
    //       </Card>
    //     ))}
    //   </div>

    //   <Card>
    //     <CardHeader>
    //       <CardTitle>Action Required</CardTitle>
    //     </CardHeader>
    //     <CardContent>{/* Add deed list or action items here */}</CardContent>
    //   </Card>
    // </div>
  );
}
