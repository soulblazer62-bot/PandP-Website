import { useGetMyProfile } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutDashboard, FileText, FileSearch, Users, User, Phone, LogOut } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading } = useGetMyProfile();
  const [location] = useLocation();
  const { signOut } = useClerk();

  const isAdmin = profile?.role === "admin";

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Legal Queries", path: "/queries", icon: <FileSearch className="h-4 w-4" /> },
    ...(isAdmin ? [{ label: "Client Directory", path: "/admin/users", icon: <Users className="h-4 w-4" /> }] : []),
    { label: "Contact Firm", path: "/contact", icon: <Phone className="h-4 w-4" /> },
    { label: "My Profile", path: "/profile", icon: <User className="h-4 w-4" /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border bg-sidebar text-sidebar-foreground">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="h-6 w-6" />
            <span className="font-serif font-bold tracking-tight text-lg">P and P Associates</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full rounded-md" />)}
            </div>
          ) : (
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    location === item.path || location.startsWith(item.path + "/")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                    {item.icon}
                    {item.label}
                  </div>
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {profile?.firstName?.[0] || profile?.email?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{profile?.firstName} {profile?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="md:hidden h-16 border-b border-border bg-card flex items-center px-4 justify-between">
           <Link href="/dashboard" className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="h-6 w-6" />
            <span className="font-serif font-bold tracking-tight">P and P Associates</span>
          </Link>
           <Button variant="ghost" size="icon" onClick={() => signOut()}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}