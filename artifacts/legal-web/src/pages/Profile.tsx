import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMyProfile, useUpdateMyProfile, getGetMyProfileQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { data: profile, isLoading } = useGetMyProfile();
  const updateProfile = useUpdateMyProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", phone: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile, form]);

  function onSubmit(values: ProfileValues) {
    updateProfile.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
          toast({ title: "Profile updated" });
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  }

  return (
    <AppLayout>
      <div className="max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Update your personal details.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4"><Skeleton className="h-40" /></div>
        ) : (
          <>
            <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {profile?.firstName?.[0] || profile?.email?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {profile?.firstName || profile?.lastName
                    ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
                    : "No name set"}
                </p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <Badge
                  variant="outline"
                  className={`mt-1 text-xs ${profile?.role === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-gray-100 text-gray-700 border-gray-200"}`}
                >
                  {profile?.role}
                </Badge>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Edit Details</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl><Input data-testid="input-first-name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl><Input data-testid="input-last-name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input data-testid="input-phone" placeholder="+91 98765 43210" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button data-testid="button-save-profile" type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
