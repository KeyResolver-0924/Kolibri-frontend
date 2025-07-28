"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeedStatus } from "@/lib/types";
import { AlertCircle, FileText, Clock, CheckCircle, User, Building2, Calculator } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useBankDashboardStats, useCooperativeDashboardStats, useAccountingDashboardStats } from "@/hooks/use-api";

// Bank Dashboard Component
function BankDashboard() {
  const { user } = useUser();
  const { data: stats, isLoading, error } = useBankDashboardStats();

  const statsCards = [
    {
      id: 1,
      name: "Total Mortgage Deeds",
      stat: stats?.total_deeds ?? 0,
      icon: FileText,
    },
    {
      id: 2,
      name: "Pending Signatures",
      stat: stats?.pending_signatures ?? 0,
      icon: Clock,
    },
    {
      id: 3,
      name: "Completed Deeds",
      stat: stats?.completed_deeds ?? 0,
      icon: CheckCircle,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-5 w-5" />
        <span>Welcome, {user?.user_name}</span>
        <span className="text-muted-foreground">({stats?.bank_name || user?.bank_name || "Bank"})</span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {statsCards.map((stat) => (
          <Card key={stat.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.stat}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/skapa-pantbrev">
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Create New Mortgage Deed
              </Button>
            </Link>
            <Link href="/pantbrev">
              <Button variant="outline" className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                View All Deeds
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">New mortgage deed created for Apartment 1201</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Deed MD-2024-001 completed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">{stats?.pending_signatures || 0} deeds pending signatures</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Cooperative Admin Dashboard Component
function CooperativeDashboard() {
  const { user } = useUser();
  const { data: stats, isLoading, error } = useCooperativeDashboardStats();

  const statsCards = [
    {
      id: 1,
      name: "Pending Review",
      stat: stats?.pending_reviews ?? 0,
      icon: Clock,
      description: "Awaiting board approval"
    },
    {
      id: 2,
      name: "Approved This Month",
      stat: stats?.approved_this_month ?? 0,
      icon: CheckCircle,
      description: "Board approvals"
    },
    {
      id: 3,
      name: "Total Units",
      stat: stats?.total_units ?? 0,
      icon: Building2,
      description: "Apartments in cooperative"
    },
    {
      id: 4,
      name: "Active Deeds",
      stat: stats?.active_deeds ?? 0,
      icon: FileText,
      description: "Currently processing"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-5 w-5" />
        <span>Welcome, {user?.user_name}</span>
        <span className="text-muted-foreground">(Cooperative Admin)</span>
        {stats?.cooperative_name && (
          <span className="text-muted-foreground">- {stats.cooperative_name}</span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.stat}</div>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/pantbrev">
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Review Pending Deeds
              </Button>
            </Link>
            <Link href="/my-associations">
              <Button variant="outline" className="w-full">
                <Building2 className="h-4 w-4 mr-2" />
                Manage Cooperative
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">New mortgage deed requires review</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Deed approved for Apartment 0503</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">{stats?.pending_reviews || 0} deeds pending board approval</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Accounting Firm Dashboard Component
function AccountingDashboard() {
  const { user } = useUser();
  const { data: stats, isLoading, error } = useAccountingDashboardStats();

  const statsCards = [
    {
      id: 1,
      name: "Active Cooperatives",
      stat: stats?.active_cooperatives ?? 0,
      icon: Building2,
      description: "Under management"
    },
    {
      id: 2,
      name: "Pending Actions",
      stat: stats?.pending_actions ?? 0,
      icon: Clock,
      description: "Require attention"
    },
    {
      id: 3,
      name: "Processed This Month",
      stat: stats?.processed_this_month ?? 0,
      icon: FileText,
      description: "Mortgage deeds"
    },
    {
      id: 4,
      name: "Avg. Processing",
      stat: stats?.avg_processing ?? "0 days",
      icon: Calculator,
      description: "Turnaround time"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-5 w-5" />
        <span>Welcome, {user?.user_name}</span>
        <span className="text-muted-foreground">(Accounting Firm)</span>
        {stats?.accounting_firm_name && (
          <span className="text-muted-foreground">- {stats.accounting_firm_name}</span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.stat}</div>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/pantbrev">
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Manage Deeds
              </Button>
            </Link>
            <Link href="/my-associations">
              <Button variant="outline" className="w-full">
                <Building2 className="h-4 w-4 mr-2" />
                Manage Cooperatives
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">New deed requires information</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Deed ready for signing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">{stats?.pending_actions || 0} actions require attention</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DashboardContent() {
  const { user, isLoading: userLoading } = useUser();

  if (userLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((id) => (
            <Card key={id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please log in to view your dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  // Render role-based dashboard
  switch (user.role) {
    case "bank_user":
      return <BankDashboard />;
    case "cooperative_admin":
      return <CooperativeDashboard />;
    case "accounting_firm":
      return <AccountingDashboard />;
    default:
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unknown user role. Please contact support.
          </AlertDescription>
        </Alert>
      );
  }
}
