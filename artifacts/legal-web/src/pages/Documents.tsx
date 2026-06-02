import { AppLayout } from "@/components/layout/AppLayout";
import { useListDocuments, useGetMyProfile, useUploadDocument, useDeleteDocument, getListDocumentsQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Trash2, Download, X } from "lucide-react";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  fileUrl: z.string().url("Must be a valid URL"),
  fileName: z.string().min(1, "File name is required"),
});

type UploadValues = z.infer<typeof uploadSchema>;

export default function Documents() {
  const { data: profile } = useGetMyProfile();
  const isAdmin = profile?.role === "admin";
  const { data: documents, isLoading } = useListDocuments();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showUpload, setShowUpload] = useState(false);

  const form = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { title: "", description: "", category: "", fileUrl: "", fileName: "" },
  });

  function onUpload(values: UploadValues) {
    uploadDocument.mutate(
      { data: { ...values, description: values.description ?? "" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
          toast({ title: "Document uploaded" });
          form.reset();
          setShowUpload(false);
        },
        onError: () => toast({ title: "Upload failed", variant: "destructive" }),
      }
    );
  }

  function handleDelete(id: number) {
    if (!confirm("Remove this document?")) return;
    deleteDocument.mutate({ documentId: id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        toast({ title: "Document removed" });
      },
    });
  }

  function formatFileSize(bytes?: number | null) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold">Documents</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isAdmin ? "Manage and upload firm documents for clients." : "View and download documents shared by P and P Associates."}
            </p>
          </div>
          {/* Upload button — admin only */}
          {isAdmin && (
            <Button data-testid="button-upload-document" onClick={() => setShowUpload(v => !v)}>
              {showUpload ? <><X className="h-4 w-4 mr-2" />Cancel</> : <><Upload className="h-4 w-4 mr-2" />Upload Document</>}
            </Button>
          )}
        </div>

        {/* Upload Form — admin only */}
        {isAdmin && showUpload && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-base font-semibold mb-4">Upload New Document</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onUpload)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl><Input data-testid="input-doc-title" placeholder="Document title" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl><Input data-testid="input-doc-category" placeholder="e.g. Forms, Contracts, Guides" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="fileUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>File URL</FormLabel>
                    <FormControl><Input data-testid="input-doc-url" placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="fileName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>File Name</FormLabel>
                      <FormControl><Input data-testid="input-doc-filename" placeholder="document.pdf" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl><Input data-testid="input-doc-desc" placeholder="Brief description" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <Button data-testid="button-submit-upload" type="submit" disabled={uploadDocument.isPending}>
                  {uploadDocument.isPending ? "Uploading..." : "Upload Document"}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {/* Document List */}
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
        ) : !documents || documents.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg bg-card">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No documents available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div
                key={doc.id}
                data-testid={`document-item-${doc.id}`}
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{doc.title}</p>
                    <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                  </div>
                  {doc.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{doc.description}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {doc.fileName}{doc.fileSize ? ` · ${formatFileSize(doc.fileSize)}` : ""} · {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button data-testid={`button-download-${doc.id}`} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </a>
                  {isAdmin && (
                    <Button
                      data-testid={`button-delete-doc-${doc.id}`}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
