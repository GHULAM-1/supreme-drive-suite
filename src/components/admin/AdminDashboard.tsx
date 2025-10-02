import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Car, DollarSign, TrendingUp, Clock, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface DashboardMetrics {
  upcomingJobs: number;
  activeDrivers: number;
  vehiclesInService: number;
  revenueThisWeek: number;
  totalJobs: number;
  completedJobs: number;
  closeProtectionEnquiries: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    upcomingJobs: 0,
    activeDrivers: 0,
    vehiclesInService: 0,
    revenueThisWeek: 0,
    totalJobs: 0,
    completedJobs: 0,
    closeProtectionEnquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [bookingsRes, driversRes, vehiclesRes] = await Promise.all([
        supabase.from("bookings").select("status, total_price, created_at, service_type"),
        supabase.from("drivers").select("is_active, is_available"),
        supabase.from("vehicles").select("is_active, service_status"),
      ]);

      const bookings = bookingsRes.data || [];
      const drivers = driversRes.data || [];
      const vehicles = vehiclesRes.data || [];

      const upcomingJobs = bookings.filter(
        (b) => b.status === "new" || b.status === "confirmed"
      ).length;

      const activeDrivers = drivers.filter(
        (d) => d.is_active && d.is_available
      ).length;

      const vehiclesInService = vehicles.filter(
        (v) => v.is_active && v.service_status === "active"
      ).length;

      const recentBookings = bookings.filter(
        (b) => new Date(b.created_at) >= weekAgo
      );

      const revenueThisWeek = recentBookings.reduce(
        (sum, b) => sum + (parseFloat(String(b.total_price)) || 0),
        0
      );

      const completedJobs = bookings.filter((b) => b.status === "completed").length;
      const closeProtectionEnquiries = bookings.filter((b) => b.service_type === "close_protection" && b.status === "in_review").length;

      setMetrics({
        upcomingJobs,
        activeDrivers,
        vehiclesInService,
        revenueThisWeek,
        totalJobs: bookings.length,
        completedJobs,
        closeProtectionEnquiries,
      });
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const completionRate = metrics.totalJobs > 0 
    ? (metrics.completedJobs / metrics.totalJobs) * 100 
    : 0;

  const statsCards = [
    {
      title: "Upcoming Jobs",
      value: metrics.upcomingJobs,
      icon: Briefcase,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
    {
      title: "Active Drivers",
      value: metrics.activeDrivers,
      icon: Users,
      gradient: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
    },
    {
      title: "Vehicles in Service",
      value: metrics.vehiclesInService,
      icon: Car,
      gradient: "from-green-500/20 to-green-500/5",
      iconColor: "text-green-500",
    },
    {
      title: "Revenue This Week",
      value: `£${metrics.revenueThisWeek.toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-500",
    },
    {
      title: "Close Protection Enquiries",
      value: metrics.closeProtectionEnquiries,
      icon: Shield,
      gradient: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-500",
      link: "/admin/jobs?serviceType=close_protection&status=in_review",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-gradient-metal mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to your admin portal. Here's an overview of your operations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="relative overflow-hidden border-border/50 bg-card shadow-metal hover-lift transition-smooth"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient}`} />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold font-display text-gradient-metal">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-metal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-metal">
              <TrendingUp className="h-5 w-5 text-primary" />
              Job Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold text-gradient-metal">{metrics.totalJobs}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-500">{metrics.completedJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-metal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-metal">
              <Clock className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/admin/jobs"
              className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <p className="font-medium">View All Jobs</p>
              <p className="text-sm text-muted-foreground">Manage bookings and assignments</p>
            </a>
            <a
              href="/admin/drivers"
              className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <p className="font-medium">Manage Drivers</p>
              <p className="text-sm text-muted-foreground">Update driver information and availability</p>
            </a>
            <a
              href="/admin/reports"
              className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <p className="font-medium">View Reports</p>
              <p className="text-sm text-muted-foreground">Analytics and performance metrics</p>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
