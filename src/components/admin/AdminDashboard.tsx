import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Car, PoundSterling, TrendingUp, Clock, Shield, BarChart3, Plus, CheckCircle2, UserCheck, CreditCard, Gauge, Target, AlertCircle, ArrowRight, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardMetrics {
  upcomingJobs: number;
  activeDrivers: number;
  vehiclesInService: number;
  revenueThisWeek: number;
  totalJobs: number;
  completedJobs: number;
  closeProtectionEnquiries: number;
  upcomingJobsTrend?: number;
  activeDriversTrend?: number;
  revenueTrend?: number;
}

interface ActivityItem {
  id: string;
  icon: "completed" | "driver" | "payment" | "vehicle";
  description: string;
  timestamp: Date;
}

interface SystemStatus {
  label: string;
  value: string;
  percentage: number;
  status: "good" | "moderate" | "attention";
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
    upcomingJobsTrend: 12,
    activeDriversTrend: 8,
    revenueTrend: 15,
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activities] = useState<ActivityItem[]>([
    {
      id: "1",
      icon: "completed",
      description: "Job #214 completed – S-Class (London → Heathrow)",
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: "2",
      icon: "driver",
      description: "Driver James O. clocked in (Mayfair)",
      timestamp: new Date(Date.now() - 12 * 60000),
    },
    {
      id: "3",
      icon: "payment",
      description: "Invoice #2034 processed (£320)",
      timestamp: new Date(Date.now() - 60 * 60000),
    },
    {
      id: "4",
      icon: "vehicle",
      description: "Vehicle inspection completed – RR Phantom",
      timestamp: new Date(Date.now() - 2 * 3600000),
    },
  ]);

  const systemStatus: SystemStatus[] = [
    {
      label: "Driver Availability",
      value: `${metrics.activeDrivers} of 5 available`,
      percentage: (metrics.activeDrivers / 5) * 100,
      status: metrics.activeDrivers >= 3 ? "good" : metrics.activeDrivers >= 2 ? "moderate" : "attention",
    },
    {
      label: "Vehicle Utilisation",
      value: "80%",
      percentage: 80,
      status: "moderate",
    },
    {
      label: "On-Time Performance",
      value: "94%",
      percentage: 94,
      status: "good",
    },
    {
      label: "Client Satisfaction",
      value: "4.8/5.0",
      percentage: 96,
      status: "good",
    },
  ];

  useEffect(() => {
    loadMetrics();
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const loadMetrics = async () => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [bookingsRes, driversRes, vehiclesRes] = await Promise.all([
        supabase.from("bookings").select("status, total_price, created_at, service_type"),
        supabase.from("drivers").select("is_available"),
        supabase.from("vehicles").select("is_active, service_status"),
      ]);

      const bookings = bookingsRes.data || [];
      const drivers = (driversRes.data || []) as Array<{ is_available: boolean }>;
      const vehicles = vehiclesRes.data || [];

      const upcomingJobs = bookings.filter(
        (b) => b.status === "new" || b.status === "confirmed"
      ).length;

      const activeDrivers = drivers.filter(
        (d) => d.is_available
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  const getRelativeTime = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-GB");
  };

  const getActivityIcon = (type: ActivityItem["icon"]) => {
    switch (type) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "driver":
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-accent" />;
      case "vehicle":
        return <Car className="h-4 w-4 text-purple-500" />;
    }
  };

  const getStatusColor = (status: SystemStatus["status"]) => {
    switch (status) {
      case "good":
        return "text-green-500";
      case "moderate":
        return "text-yellow-500";
      case "attention":
        return "text-red-500";
    }
  };

  const getStatusIndicator = (status: SystemStatus["status"]) => {
    switch (status) {
      case "good":
        return "🟢";
      case "moderate":
        return "🟡";
      case "attention":
        return "🔴";
    }
  };

  const statsCards = [
    {
      title: "Upcoming Jobs",
      value: metrics.upcomingJobs,
      icon: Briefcase,
      gradient: "from-muted/50 via-muted/30 to-transparent",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      trend: metrics.upcomingJobsTrend,
      trendUp: true,
    },
    {
      title: "Active Drivers",
      value: metrics.activeDrivers,
      icon: Users,
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      trend: metrics.activeDriversTrend,
      trendUp: true,
    },
    {
      title: "Vehicles in Service",
      value: metrics.vehiclesInService,
      icon: Car,
      gradient: "from-green-500/10 via-green-500/5 to-transparent",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-400",
      trend: 0,
      trendUp: false,
    },
    {
      title: "Revenue This Week",
      value: `£${metrics.revenueThisWeek.toFixed(2)}`,
      icon: PoundSterling,
      gradient: "from-accent/10 via-accent/5 to-transparent",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      trend: metrics.revenueTrend,
      trendUp: true,
    },
    {
      title: "Close Protection Enquiries",
      value: metrics.closeProtectionEnquiries,
      icon: Shield,
      gradient: "from-accent/15 via-accent/8 to-transparent",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      link: "/admin/jobs?serviceType=close_protection&status=in_review",
      trend: 0,
      trendUp: false,
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
    <TooltipProvider>
      <div className="space-y-8 pb-8">
        {/* Header with Date/Time */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-gradient-metal mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Your operational overview — live job, driver, and fleet status
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 backdrop-blur-sm px-4 py-3 rounded-lg border border-border/50">
            <Clock className="h-4 w-4 text-accent" />
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{formatTime(currentTime)}</span>
              <span className="text-xs">{formatDate(currentTime)}</span>
            </div>
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statsCards.map((stat, index) => {
            const content = (
              <Card
                className={`group relative overflow-hidden border-border/50 bg-card shadow-metal transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(244,197,66,0.15)] hover:-translate-y-1 animate-fade-in ${
                  stat.link ? "cursor-pointer" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
                
                {/* Gold Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.iconBg} backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                
                <CardContent className="relative space-y-2">
                  <div className="text-3xl font-bold font-display text-gradient-metal">
                    {stat.value}
                  </div>
                  
                  {/* Trend Indicator */}
                  {stat.trend !== undefined && stat.trend > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      {stat.trendUp ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={stat.trendUp ? "text-green-500" : "text-red-500"}>
                        {stat.trend}% vs last week
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );

            return stat.link ? (
              <Link key={stat.title} to={stat.link} className="block">
                {content}
              </Link>
            ) : (
              <div key={stat.title}>{content}</div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Completion Widget - Spans 2 columns on large screens */}
          <Card className="lg:col-span-2 border-border/50 shadow-metal hover:shadow-glow transition-all duration-300 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gradient-metal">
                <TrendingUp className="h-5 w-5 text-accent" />
                Job Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-4xl font-bold font-display text-gradient-metal">
                      {completionRate.toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">Complete</span>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">
                      {metrics.upcomingJobs} Upcoming / {metrics.completedJobs} Completed
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last updated at {formatTime(currentTime)}
                    </p>
                  </div>
                </div>
                
                {/* Custom Gold Gradient Progress Bar */}
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/50">
                  <div
                    className="h-full bg-gradient-to-r from-accent via-accent to-amber-400 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(244,197,66,0.5)]"
                    style={{ 
                      width: `${completionRate}%`,
                      animation: "progressFill 1s ease-out"
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Jobs</p>
                  <p className="text-2xl font-bold text-gradient-metal">{metrics.totalJobs}</p>
                </div>
                <div className="text-center border-l border-r border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-400">{metrics.upcomingJobs}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-400">{metrics.completedJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="border-border/50 shadow-metal hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gradient-metal">
                <Target className="h-5 w-5 text-accent" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/admin/jobs">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto py-3 px-4 hover:bg-muted/50 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                        <Briefcase className="h-4 w-4 text-accent" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-sm">View All Jobs</p>
                        <p className="text-xs text-muted-foreground">Manage bookings</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Assign drivers and track job progress</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/admin/drivers">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto py-3 px-4 hover:bg-muted/50 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                        <Users className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-sm">Manage Drivers</p>
                        <p className="text-xs text-muted-foreground">Update availability</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Update driver schedules and availability</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/admin/analytics">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto py-3 px-4 hover:bg-muted/50 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                        <BarChart3 className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-sm">View Analytics</p>
                        <p className="text-xs text-muted-foreground">Performance insights</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Deep dive into analytics and reports</TooltipContent>
              </Tooltip>

              <div className="pt-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/admin/jobs?action=new">
                      <Button
                        className="w-full justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-[0_0_20px_rgba(244,197,66,0.3)] hover:shadow-[0_0_30px_rgba(244,197,66,0.5)] transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        Add New Job
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Create a new booking</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <Card className="border-border/50 shadow-metal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gradient-metal">
                <Clock className="h-5 w-5 text-accent" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-4 border-b border-border/30 last:border-0 last:pb-0 animate-fade-in hover:bg-muted/30 p-2 rounded-lg transition-colors"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="mt-0.5">{getActivityIcon(activity.icon)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-relaxed">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status Summary */}
          <Card className="border-border/50 shadow-metal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gradient-metal">
                <Gauge className="h-5 w-5 text-accent" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStatus.map((item, index) => (
                  <div
                    key={item.label}
                    className="space-y-2 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getStatusIndicator(item.status)}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${getStatusColor(item.status)}`}>
                        {item.value}
                      </span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/50">
                      <div
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${
                          item.status === "good"
                            ? "bg-gradient-to-r from-green-500 to-green-400"
                            : item.status === "moderate"
                            ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                            : "bg-gradient-to-r from-red-500 to-red-400"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Link */}
        <Card className="border-border/50 shadow-metal bg-gradient-to-r from-card via-accent/5 to-card hover:shadow-glow transition-all duration-300 group cursor-pointer">
          <Link to="/admin/analytics">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-gradient-metal">
                    View Full Analytics
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Deep dive into performance insights, trends, and detailed reports
                  </p>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 text-accent group-hover:translate-x-2 transition-transform" />
            </CardContent>
          </Link>
        </Card>
      </div>
    </TooltipProvider>
  );
}
