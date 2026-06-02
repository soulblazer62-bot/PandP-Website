import { AppLayout } from "@/components/layout/AppLayout";
import { useListQueries, useGetMyProfile, useDeleteQuery, getListQueriesQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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

const CATEGORY_LABELS: Record<string, string> = {
  family_law: "Family Law",
  criminal_law: "Criminal Law",
  corporate_law: "Corporate Law",
  property_law: "Property Law",
  employment_law: "Employment Law",
  immigration_law: "Immigration Law",
  other: "Other",
};

export default function Queries() {
  const { data: profile } = useGetMyProfile();
  const isAdmin = profile?.role === "admin";
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data: queries, isLoading } = useListQueries(statusFilter ? { status: statusFilter as "pending" | "in_review" | "resolved" | "closed" } : undefined);
  const deleteQuery = useDeleteQuery();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  function handleDelete(id: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this query?")) return;
    deleteQuery.mutate({ queryId: id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListQueriesQueryKey() });
        toast({ title: "Query deleted" });
      },
    });
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold">{isAdmin ? "All Client Queries" : "My Legal Queries"}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isAdmin ? "Manage and update all client queries." : "Track the status of your submitted queries."}
            </p>
          </div>
          {!isAdmin && (
            <Link href="/queries/new">
              <Button data-testid="button-new-query">
                <Plus className="h-4 w-4 mr-2" />
                New Query
              </Button>
            </Link>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {["", "pending", "in_review", "resolved", "closed"].map(s => (
            <button
              key={s}
              data-testid={`filter-${s || "all"}`}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {s === "" ? "All" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Query List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : !queries || queries.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg bg-card">
            <p className="text-muted-foreground mb-4">
              {isAdmin ? "No queries found." : "You haven't submitted any queries yet."}
            </p>
            {!isAdmin && (
              <Link href="/queries/new">
                <Button data-testid="button-submit-first-query">Submit your first query</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {queries.map(q => (
              <Link key={q.id} href={`/queries/${q.id}`}>
                <div
                  data-testid={`query-item-${q.id}`}
                  className="p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-all cursor-pointer flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{q.subject}</p>
                      <Badge variant="outline" className={`text-xs ${STATUS_COLORS[q.status]}`}>
                        {STATUS_LABELS[q.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {CATEGORY_LABELS[q.category] ?? q.category}
                      {isAdmin && q.clientName && ` · ${q.clientName}`}
                      {" · "}
                      {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {q.adminNotes && (
                      <p className="text-xs text-blue-700 mt-1 truncate italic">Note: {q.adminNotes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isAdmin && (
                      <Button
                        data-testid={`button-delete-query-${q.id}`}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDelete(q.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
