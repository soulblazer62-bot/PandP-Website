import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMyProfile, useCreateQuery, getListQueriesQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Redirect } from "wouter";

const formSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z.string().min(10, "Please describe your query in at least 10 characters"),
  category: z.enum(["family_law", "criminal_law", "corporate_law", "property_law", "employment_law", "immigration_law", "other"]),
});

type FormValues = z.infer<typeof formSchema>;

const CATEGORIES = [
  { value: "family_law", label: "Family Law" },
  { value: "criminal_law", label: "Criminal Law" },
  { value: "corporate_law", label: "Corporate Law" },
  { value: "property_law", label: "Property Law" },
  { value: "employment_law", label: "Employment Law" },
  { value: "immigration_law", label: "Immigration Law" },
  { value: "other", label: "Other" },
];

export default function NewQuery() {
  const { data: profile, isLoading: profileLoading } = useGetMyProfile();
  const createQuery = useCreateQuery();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { subject: "", description: "", category: "other" },
  });

  // Admins should not submit queries
  if (!profileLoading && profile?.role === "admin") {
    return <Redirect to="/queries" />;
  }

  function onSubmit(values: FormValues) {
    createQuery.mutate(
      { data: values },
      {
        onSuccess: (created) => {
          queryClient.invalidateQueries({ queryKey: getListQueriesQueryKey() });
          toast({ title: "Query submitted successfully" });
          setLocation(`/queries/${created.id}`);
        },
        onError: () => toast({ title: "Failed to submit query", variant: "destructive" }),
      }
    );
  }

  return (
    <AppLayout>
      <div className="max-w-xl space-y-6">
        <button
          data-testid="button-back"
          onClick={() => setLocation("/queries")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Queries
        </button>

        <div>
          <h1 className="text-2xl font-serif font-bold">Submit a Legal Query</h1>
          <p className="text-muted-foreground text-sm mt-1">Describe your legal matter and our team will review it.</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Practice Area</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input data-testid="input-subject" placeholder="Brief subject of your query" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="input-description"
                        placeholder="Explain your legal matter in detail. Include relevant dates, parties involved, and any documents you have..."
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button data-testid="button-submit-query" type="submit" className="w-full" disabled={createQuery.isPending}>
                {createQuery.isPending ? "Submitting..." : "Submit Query"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
