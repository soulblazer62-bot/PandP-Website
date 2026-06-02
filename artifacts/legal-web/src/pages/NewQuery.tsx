import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMyProfile, useCreateQuery, getListQueriesQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, Redirect } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";

const CATEGORIES = [
  { value: "family_law", label: "Family Law" },
  { value: "criminal_law", label: "Criminal Law" },
  { value: "corporate_law", label: "Corporate Law" },
  { value: "property_law", label: "Property Law" },
  { value: "employment_law", label: "Employment Law" },
  { value: "immigration_law", label: "Immigration Law" },
  { value: "other", label: "Other / Not Sure" },
];

export default function NewQuery() {
  const { data: profile, isLoading: profileLoading } = useGetMyProfile();
  const createQuery = useCreateQuery();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [queryText, setQueryText] = useState("");
  const [category, setCategory] = useState("other");

  if (!profileLoading && profile?.role === "admin") {
    return <Redirect to="/queries" />;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = queryText.trim();
    if (!trimmed) return;

    const firstLine = trimmed.split("\n")[0].slice(0, 80);

    createQuery.mutate(
      {
        data: {
          subject: firstLine,
          description: trimmed,
          category: category as "family_law" | "criminal_law" | "corporate_law" | "property_law" | "employment_law" | "immigration_law" | "other",
        },
      },
      {
        onSuccess: (created) => {
          queryClient.invalidateQueries({ queryKey: getListQueriesQueryKey() });
          toast({ title: "Your query has been submitted. We'll respond shortly." });
          setLocation(`/queries/${created.id}`);
        },
        onError: () => toast({ title: "Failed to submit query", variant: "destructive" }),
      }
    );
  }

  const charCount = queryText.length;
  const isReady = queryText.trim().length >= 10;

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

        <div>
          <h1 className="text-2xl font-serif font-bold">Ask a Legal Query</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Describe your legal matter below. Our team at P and P Associates will review and respond.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">What area of law does this relate to?</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-category" className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Main query textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Describe your query in detail</label>
            <Textarea
              data-testid="input-query"
              placeholder="e.g. I am facing an issue with my landlord who has refused to return my security deposit even after 6 months of vacating the property. I have all rent receipts and the original agreement. What legal steps can I take?

Please include as much detail as possible — relevant dates, documents you have, parties involved, and what outcome you're looking for."
              rows={10}
              value={queryText}
              onChange={e => setQueryText(e.target.value)}
              className="resize-none text-sm leading-relaxed"
            />
            <p className="text-xs text-muted-foreground text-right">{charCount} characters{charCount < 10 && charCount > 0 ? " (min 10)" : ""}</p>
          </div>

          <Button
            data-testid="button-submit-query"
            type="submit"
            className="w-full"
            disabled={!isReady || createQuery.isPending}
          >
            {createQuery.isPending ? (
              "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Query to P and P Associates
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          All queries are treated with strict confidentiality. You will be notified once our team has reviewed your matter.
        </p>
      </div>
    </AppLayout>
  );
}
