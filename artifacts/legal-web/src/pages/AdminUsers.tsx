import { AppLayout } from "@/components/layout/AppLayout";
import { useListUsers, useGetMyProfile, useUpdateUserRole, getListUsersQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { Users } from "lucide-react";

export default function AdminUsers() {
  const { data: profile, isLoading: profileLoading } = useGetMyProfile();
  const isAdmin = profile?.role === "admin";
  const { data: users, isLoading } = useListUsers(undefined, { query: { enabled: isAdmin, queryKey: getListUsersQueryKey() } });
  const updateRole = useUpdateUserRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Block clients from this page entirely
  if (!profileLoading && !isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  function toggleRole(userId: number, currentRole: string) {
    const newRole = currentRole === "admin" ? "client" : "admin";
    if (!confirm(`Change this user to ${newRole}?`)) return;
    updateRole.mutate(
      { userId: String(userId), data: { role: newRole as "client" | "admin" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          toast({ title: `Role updated to ${newRole}` });
        },
        onError: () => toast({ title: "Failed to update role", variant: "destructive" }),
      }
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Client Directory</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all registered users and their access levels.</p>
        </div>

        {isLoading || profileLoading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : !users || users.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg bg-card">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No users registered yet.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(u => (
                  <tr key={u.id} data-testid={`user-row-${u.id}`} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {u.firstName?.[0] || u.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium">
                            {u.firstName || u.lastName ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground sm:hidden truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        data-testid={`badge-role-${u.id}`}
                        className={u.role === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-gray-100 text-gray-700 border-gray-200"}
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {/* Don't let admin demote themselves */}
                      {u.id !== profile?.id ? (
                        <Button
                          data-testid={`button-toggle-role-${u.id}`}
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRole(u.id, u.role)}
                          disabled={updateRole.isPending}
                        >
                          Make {u.role === "admin" ? "Client" : "Admin"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">You</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
