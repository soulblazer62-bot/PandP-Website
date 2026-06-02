import { AppLayout } from "@/components/layout/AppLayout";
import { useGetQuery, useUpdateQuery, useGetMyProfile, getGetQueryQueryKey, getListQueriesQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

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

export default function QueryDetail() {
  const { id } = useParams<{ id: string }>();
  const queryId = parseInt(id ?? "0", 10);
  const [, setLocation] = useLocation();
  const { data: profile } = useGetMyProfile();
  const { data: query, isLoading } = useGetQuery(queryId, { query: { enabled: !!queryId, queryKey: getGetQueryQueryKey(queryId) } });
  const updateQuery = useUpdateQuery();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isAdmin = profile?.role === "admin";

  const [status, setStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [editing, setEditing] = useState(false);

  function startEdit() {
    setStatus(query?.status ?? "pending");
    setAdminNotes(query?.adminNotes ?? "");
    setEditing(true);
  }

  function handleSave() {
    updateQuery.mutate(
      { queryId, data: { status: status as "pending" | "in_review" | "resolved" | "closed", adminNotes } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetQueryQueryKey(queryId) });
          queryClient.invalidateQueries({ queryKey: getListQueriesQueryKey() });
          toast({ title: "Query updated" });
          setEditing(false);
        },
        onError: () => toast({ title: "Failed to update", variant: "destructive" }),
      }
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <button
          data-testid="button-back"
          onClick={() => setLocation("/queries")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Queries
        </button>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !query ? (
          <p className="text-muted-foreground">Query not found.</p>
        ) : (
          <>
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-serif font-bold leading-snug">{query.subject}</h1>
                <Badge variant="outline" className={`shrink-0 ${STATUS_COLORS[query.status]}`}>
                  {STATUS_LABELS[query.status]}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>Category: <strong className="text-foreground">{CATEGORY_LABELS[query.category] ?? query.category}</strong></span>
                <span>Submitted: <strong className="text-foreground">{new Date(query.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong></span>
                {isAdmin && query.clientName && (
                  <span>Client: <strong className="text-foreground">{query.clientName}</strong></span>
                )}
                {isAdmin && query.clientEmail && (
                  <span>Email: <strong className="text-foreground">{query.clientEmail}</strong></span>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{query.description}</p>
              </div>

              {/* Admin Notes — visible to both, editable only by admin */}
              {(query.adminNotes || isAdmin) && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {isAdmin ? "Case Notes (admin)" : "Response from P and P Associates"}
                  </p>
                  {isAdmin && editing ? (
                    <Textarea
                      data-testid="input-admin-notes"
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                      placeholder="Add case notes visible to the client..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-blue-800 bg-blue-50 rounded p-3 italic">
                      {query.adminNotes || <span className="text-muted-foreground not-italic">No notes added yet.</span>}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Admin Controls Only */}
            {isAdmin && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Admin Controls</h2>
                {editing ? (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Update Status</label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_review">In Review</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3">
                      <Button data-testid="button-save-query" onClick={handleSave} disabled={updateQuery.isPending}>
                        {updateQuery.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <Button data-testid="button-edit-query" variant="outline" onClick={startEdit}>
                    Edit Status &amp; Notes
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
