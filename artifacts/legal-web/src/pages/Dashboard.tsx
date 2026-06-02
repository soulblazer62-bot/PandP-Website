import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardStats, useGetQueriesByCategory, useGetMyProfile, useListQueries } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FileSearch, Clock, CheckCircle, Users, FileText, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

const CATEGORY_LABELS: Record<string, string> = {
  family_law: "Family Law",
  criminal_law: "Criminal Law",
  corporate_law: "Corporate Law",
  property_law: "Property Law",
  employment_law: "Employment Law",
  immigration_law: "Immigration Law",
  other: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_review: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_review: "In Review",
  resolved: "Resolved",
  closed: "Closed",
};

const CHART_COLORS = ["#1e3a5f", "#2d5986", "#c9a84c", "#4a7fa5", "#8ba5be", "#d4b87a", "#6b8fa8"];

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useGetMyProfile();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: categories, isLoading: catLoading } = useGetQueriesByCategory();
  const { data: queries, isLoading: queriesLoading } = useListQueries();

  const isAdmin = profile?.role === "admin";
  const recentQueries = queries?.slice(0, 5) ?? [];

  if (profileLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Welcome back, {profile?.firstName || "Counsellor"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Admin overview — all client activity at a glance." : "Here's a summary of your legal matters."}
          </p>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className={`grid grid-cols-2 gap-4 ${isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            <Card data-testid="stat-total-queries">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Queries</CardTitle>
                <FileSearch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.totalQueries ?? 0}</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-pending">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">{stats?.pendingQueries ?? 0}</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-in-review">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Review</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{stats?.inReviewQueries ?? 0}</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-resolved">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats?.resolvedQueries ?? 0}</p>
              </CardContent>
            </Card>

            {isAdmin && (
              <>
                <Card data-testid="stat-total-clients">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats?.totalClients ?? 0}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart — admin only */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Queries by Practice Area</CardTitle>
              </CardHeader>
              <CardContent>
                {catLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : categories && categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={categories.map(c => ({ name: CATEGORY_LABELS[c.category] ?? c.category, count: c.count }))}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {categories.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No queries yet</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Queries */}
          <Card className={isAdmin ? "" : "lg:col-span-2"}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Queries</CardTitle>
              <Link href="/queries">
                <span className="text-xs text-primary hover:underline cursor-pointer">View all</span>
              </Link>
            </CardHeader>
            <CardContent>
              {queriesLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
              ) : recentQueries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No queries yet.{" "}
                  {!isAdmin && (
                    <Link href="/queries/new">
                      <span className="text-primary hover:underline cursor-pointer">Submit one now.</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentQueries.map(q => (
                    <Link key={q.id} href={`/queries/${q.id}`}>
                      <div data-testid={`query-row-${q.id}`} className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{q.subject}</p>
                          <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[q.category] ?? q.category}</p>
                        </div>
                        <Badge variant="outline" className={`ml-3 text-xs shrink-0 ${STATUS_COLORS[q.status]}`}>
                          {STATUS_LABELS[q.status]}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
