import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Briefcase,
  Users,
  Car,
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
  Search,
  LayoutDashboard,
  Image,
  TrendingUp,
  Home,
  BarChart2,
  Tag,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AdminLayoutProps {
  children: ReactNode;
  user: any;
}

interface NavItem {
  label: string;
  icon: any;
  href: string;
  badge?: number;
  dividerBefore?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: Home, href: "/admin" },
  { label: "Jobs", icon: Briefcase, href: "/admin/jobs" },
  { label: "Vehicles", icon: Car, href: "/admin/vehicles" },
  { label: "Drivers", icon: Users, href: "/admin/drivers" },
  { label: "Portfolio", icon: Image, href: "/admin/portfolio" },
  { label: "Analytics & Reports", icon: BarChart2, href: "/admin/analytics" },
  { label: "Pricing", icon: Tag, href: "/admin/pricing" },
  { label: "Testimonials", icon: MessageSquare, href: "/admin/testimonials" },
  { label: "Settings", icon: Settings, href: "/admin/settings", dividerBefore: true },
];

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { open } = useSidebar();
  const [jobsCount, setJobsCount] = useState(0);

  useEffect(() => {
    loadJobsCount();
  }, []);

  const loadJobsCount = async () => {
    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .in("status", ["new", "pending"]);
    setJobsCount(count || 0);
  };

  const isActive = (url: string) => {
    if (url === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(url);
  };

  const getNavItems = (): NavItem[] => {
    return NAV_ITEMS.map((item) => {
      if (item.href === "/admin/jobs") {
        return { ...item, badge: jobsCount };
      }
      return item;
    });
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    const button = (
      <SidebarMenuButton
        onClick={() => navigate(item.href)}
        className={`
          relative h-11 px-3
          ${active 
            ? "bg-primary/[0.14] text-primary border-l-[3px] border-primary font-medium" 
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }
          transition-all duration-200 cursor-pointer
        `}
        aria-current={active ? "page" : undefined}
      >
        <Icon className="h-5 w-5" />
        {open && (
          <>
            <span className="ml-3 text-[13px]">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <Badge 
                className="ml-auto h-5 min-w-[20px] px-1.5 bg-primary/20 text-primary text-xs font-medium"
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </SidebarMenuButton>
    );

    if (!open) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.label}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">({item.badge})</span>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  };

  return (
    <Sidebar 
      className={open ? "w-[260px]" : "w-[72px]"} 
      collapsible="icon"
      style={{ backgroundColor: "#0F1115" }}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            <h2 className="text-xl font-display font-bold text-foreground">
              {open ? "Admin Portal" : "AP"}
            </h2>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <nav aria-label="Admin navigation">
              <SidebarMenu>
                {getNavItems().map((item) => (
                  <div key={item.href}>
                    {item.dividerBefore && (
                      <Separator className="my-2 bg-white/5" />
                    )}
                    <SidebarMenuItem>
                      {renderNavItem(item)}
                    </SidebarMenuItem>
                  </div>
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Persist sidebar state
  useEffect(() => {
    const savedState = localStorage.getItem("admin-sidebar-collapsed");
    if (savedState !== null) {
      // State is managed by SidebarProvider
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching for: ${searchQuery}`);
      // Implement global search logic here
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 border-b border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search jobs, drivers, vehicles..."
                    className="pl-10 bg-background/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              <div className="ml-auto flex items-center gap-3">
                <ThemeToggle />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-accent flex items-center justify-center text-white font-medium">
                        {user?.email?.[0].toUpperCase()}
                      </div>
                      <span className="hidden md:inline text-sm">{user?.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
