import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Target, Users, Car } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ReportsDataTable } from "@/components/admin/ReportsDataTable";
import { supabase } from "@/integrations/supabase/client";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { subDays, endOfDay, startOfDay } from "date-fns";

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState("30");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Date range pickers
  const [revenueDateRange, setRevenueDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [jobsDateRange, setJobsDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [analyticsData, setAnalyticsData] = useState<any>({
    totalRevenue: 0,
    jobsCompleted: 0,
    avgJobValue: 0,
    repeatClients: 0,
    cancellationRate: 0,
    avgRating: 0,
    totalReviews: 0,
    onTimeRate: 0,
    revenueData: [],
    jobsData: [],
    jobTypeData: [],
    driverUtilisation: [],
    fleetData: [],
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, revenueDateRange, jobsDateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch ALL bookings (no time limit for KPIs)
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      // Calculate metrics (count completed and confirmed as revenue-generating)
      const revenueBookings = bookings?.filter(b =>
        b.status === "completed" || b.status === "confirmed"
      ) || [];
      const totalRevenue = revenueBookings.reduce((sum, b) => {
        const price = parseFloat(String(b.total_price || 0));
        return sum + price;
      }, 0);

      const avgJobValue = revenueBookings.length > 0
        ? totalRevenue / revenueBookings.length
        : 0;

      // Jobs completed count includes both completed and confirmed
      const completedBookings = bookings?.filter(b =>
        b.status === "completed" || b.status === "confirmed"
      ) || [];

      // Calculate repeat clients
      const clientEmails = bookings?.map(b => b.customer_email) || [];
      const uniqueClients = new Set(clientEmails);
      const repeatClientsCount = clientEmails.length - uniqueClients.size;
      const repeatRate = clientEmails.length > 0
        ? (repeatClientsCount / clientEmails.length) * 100
        : 0;

      // Calculate cancellation rate
      const cancelledBookings = bookings?.filter(b => b.status === "cancelled") || [];
      const cancellationRate = bookings && bookings.length > 0
        ? (cancelledBookings.length / bookings.length) * 100
        : 0;

      // Calculate average rating from testimonials
      const { data: testimonials } = await supabase
        .from("testimonials")
        .select("rating")
        .not("rating", "is", null);

      const totalRating = testimonials?.reduce((sum, t) => sum + (t.rating || 0), 0) || 0;
      const avgRating = testimonials && testimonials.length > 0
        ? totalRating / testimonials.length
        : 0;

      // Calculate on-time rate
      // For now, we'll use completed jobs as on-time if they don't have a delay field
      // You can add an "actual_pickup_time" field to track delays
      const onTimeBookings = completedBookings.filter(b => !b.delayed && !b.delay_minutes);
      const onTimeRate = completedBookings.length > 0
        ? (onTimeBookings.length / completedBookings.length) * 100
        : 94; // Default placeholder until we track actual pickup times

      // Group by week for revenue chart
      const revenueStartDate = startOfDay(revenueDateRange?.from || subDays(new Date(), 30));
      const revenueEndDate = endOfDay(revenueDateRange?.to || new Date());

      const { data: revenueChartBookings } = await supabase
        .from("bookings")
        .select("*")
        .gte("created_at", revenueStartDate.toISOString())
        .lte("created_at", revenueEndDate.toISOString());

      const revenueWeeklyData = new Map();
      revenueChartBookings?.forEach(booking => {
        const date = new Date(booking.created_at);
        const weekNum = Math.floor((revenueEndDate.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const daysDiff = Math.floor((revenueEndDate.getTime() - revenueStartDate.getTime()) / (24 * 60 * 60 * 1000));
        const weekKey = `Week ${Math.max(0, Math.floor(daysDiff / 7) - weekNum)}`;

        if (!revenueWeeklyData.has(weekKey)) {
          revenueWeeklyData.set(weekKey, { revenue: 0 });
        }

        const week = revenueWeeklyData.get(weekKey);
        // Count completed and confirmed bookings as revenue
        if (booking.status === "completed" || booking.status === "confirmed") {
          week.revenue += parseFloat(String(booking.total_price || 0));
        }
      });

      const revenueData = Array.from(revenueWeeklyData.entries())
        .map(([period, data]) => ({ period, revenue: data.revenue }))
        .sort((a, b) => parseInt(a.period.split(' ')[1]) - parseInt(b.period.split(' ')[1]));

      // Group by week for jobs chart
      const jobsStartDate = startOfDay(jobsDateRange?.from || subDays(new Date(), 30));
      const jobsEndDate = endOfDay(jobsDateRange?.to || new Date());

      const { data: jobsBookings } = await supabase
        .from("bookings")
        .select("*")
        .gte("created_at", jobsStartDate.toISOString())
        .lte("created_at", jobsEndDate.toISOString());

      const jobsWeeklyData = new Map();
      jobsBookings?.forEach(booking => {
        const date = new Date(booking.created_at);
        const weekNum = Math.floor((jobsEndDate.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const daysDiff = Math.floor((jobsEndDate.getTime() - jobsStartDate.getTime()) / (24 * 60 * 60 * 1000));
        const weekKey = `Week ${Math.max(0, Math.floor(daysDiff / 7) - weekNum)}`;

        if (!jobsWeeklyData.has(weekKey)) {
          jobsWeeklyData.set(weekKey, { jobs: 0 });
        }

        const week = jobsWeeklyData.get(weekKey);
        week.jobs++;
      });

      const jobsData = Array.from(jobsWeeklyData.entries())
        .map(([period, data]) => ({ period, jobs: data.jobs }))
        .sort((a, b) => parseInt(a.period.split(' ')[1]) - parseInt(b.period.split(' ')[1]));

      // Job type breakdown
      const serviceTypes = bookings?.reduce((acc: any, b) => {
        const type = b.service_type || "Other";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const totalJobs = bookings?.length || 1;
      const jobTypeData = Object.entries(serviceTypes || {}).map(([name, count]: any, index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
        value: Math.round((count / totalJobs) * 100),
        color: `hsl(45, ${100 - index * 20}%, ${60 - index * 10}%)`
      }));

      // Haversine formula to calculate distance between two coordinates
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 3958.8; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return Math.round(distance * 10) / 10;
      };

      // Fetch completed bookings with all data
      const { data: completedBookingsWithLocation } = await supabase
        .from("bookings")
        .select("*, drivers(name)")
        .in("status", ["completed", "confirmed"]);

      console.log("🔍 Completed bookings with location:", completedBookingsWithLocation);

      // Group bookings by driver name and calculate hours
      const driverHoursMap = new Map<string, { hours: number; jobs: number }>();

      completedBookingsWithLocation?.forEach((booking: any) => {
        const driverName = booking.drivers?.name || "Unassigned";

        let hours = 0;

        // Calculate distance if we have coordinates
        if (booking.pickup_lat && booking.pickup_lon && booking.dropoff_lat && booking.dropoff_lon) {
          const distance = calculateDistance(
            booking.pickup_lat,
            booking.pickup_lon,
            booking.dropoff_lat,
            booking.dropoff_lon
          );
          // Average 40 mph for chauffeur service + 15 minutes prep/end time
          hours = (distance / 40) + 0.25;
          console.log(`  📏 ${driverName} - ${booking.customer_name}: ${distance} miles = ${hours.toFixed(1)}h`);
        } else {
          // Default 2 hours if no location data
          hours = 2;
          console.log(`  🔢 ${driverName} - ${booking.customer_name}: Using default 2h`);
        }

        // Add wait time if specified
        const waitTime = booking.wait_time_hours || 0;
        hours += waitTime;

        // Update driver's total
        const current = driverHoursMap.get(driverName) || { hours: 0, jobs: 0 };
        driverHoursMap.set(driverName, {
          hours: current.hours + hours,
          jobs: current.jobs + 1
        });
      });

      console.log("📊 Driver Hours Map:", Array.from(driverHoursMap.entries()));

      // Convert to array and prepare for display
      const driverUtilisation = Array.from(driverHoursMap.entries()).map(([name, data]) => ({
        name,
        hours: Math.round(data.hours * 10) / 10,
        jobs: data.jobs,
        utilisation: 0
      }));

      console.log("📈 Driver Utilisation:", driverUtilisation);

      // Filter out drivers with 0 hours, sort by hours, and take top 5
      const topDrivers = driverUtilisation
        .filter(d => d.hours > 0)
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5);

      console.log("🏆 Top Drivers (after filter):", topDrivers);

      // Fetch vehicles with job counts
      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("*")
        .limit(5);

      const fleetData = await Promise.all((vehicles || []).map(async (vehicle) => {
        const { data: vehicleBookings, count } = await supabase
          .from("bookings")
          .select("estimated_miles", { count: "exact" })
          .eq("vehicle_id", vehicle.id)
          .gte("created_at", startDate.toISOString());

        // Calculate total mileage from bookings
        const totalMileage = (vehicleBookings || []).reduce((sum, booking) => {
          return sum + (booking.estimated_miles || 0);
        }, 0);

        return {
          vehicle: vehicle.name,
          jobs: count || 0,
          mileage: totalMileage > 0 ? `${totalMileage.toFixed(0)} mi` : "-",
          status: vehicle.is_active ? "Active" : "Inactive"
        };
      }));

      setAnalyticsData({
        totalRevenue,
        jobsCompleted: completedBookings.length,
        avgJobValue,
        repeatClients: repeatRate,
        cancellationRate,
        avgRating,
        totalReviews: testimonials?.length || 0,
        onTimeRate,
        revenueData: revenueData.length > 0 ? revenueData : [{ period: "No data", revenue: 0 }],
        jobsData: jobsData.length > 0 ? jobsData : [{ period: "No data", jobs: 0 }],
        jobTypeData: jobTypeData.length > 0 ? jobTypeData : [{ name: "No data", value: 100, color: "hsl(45, 60%, 50%)" }],
        driverUtilisation: topDrivers.length > 0 ? topDrivers : [{ name: "No drivers with hours tracked", hours: 0, jobs: 0, utilisation: 0 }],
        fleetData: fleetData.length > 0 ? fleetData : [{ vehicle: "No vehicles", jobs: 0, mileage: "0", status: "N/A" }],
      });

    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Real data for KPIs
  const kpis = [
    {
      label: "Total Revenue",
      value: `£${analyticsData.totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      isPositive: true,
      icon: DollarSign,
    },
    {
      label: "Jobs Completed",
      value: analyticsData.jobsCompleted.toString(),
      isPositive: true,
      icon: Briefcase,
    },
    {
      label: "Average Job Value",
      value: `£${analyticsData.avgJobValue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      isPositive: true,
      icon: Target,
    },
    {
      label: "Repeat Clients",
      value: `${analyticsData.repeatClients.toFixed(1)}%`,
      isPositive: true,
      icon: Users,
    },
  ];


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          <p className="text-sm text-accent font-semibold">
            {payload[0].name === "revenue" ? "£" : ""}{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
            <div>
              <h1 className="text-3xl font-display font-bold text-gradient-metal mb-2">
                Analytics & Reports
              </h1>
              <p className="text-muted-foreground">
                Performance insights and detailed operational data
              </p>
            </div>
          </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-glow transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-glow transition-all"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-12 mt-8">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in animation-delay-200">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card
                key={index}
                className="relative overflow-hidden border-accent/20 hover:border-accent/40 transition-all hover-lift group"
              >
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-accent" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground mb-1">{kpi.value}</div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                </CardContent>
              </Card>
            );
            })}
            </div>

            {/* Revenue & Jobs Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in animation-delay-400">
          <Card className="border-accent/20">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-2xl">Revenue Over Time</CardTitle>
                  <CardDescription>Weekly revenue breakdown</CardDescription>
                </div>
                <DateRangePicker
                  date={revenueDateRange}
                  onDateChange={setRevenueDateRange}
                  placeholder="Select date range"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
                  <XAxis
                    dataKey="period"
                    stroke="hsl(0 0% 60%)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="hsl(0 0% 60%)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(45 100% 60%)"
                    strokeWidth={3}
                    dot={{ fill: "hsl(45 100% 60%)", r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(45 100% 70%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-2xl">Jobs Completed</CardTitle>
                  <CardDescription>Weekly breakdown</CardDescription>
                </div>
                <DateRangePicker
                  date={jobsDateRange}
                  onDateChange={setJobsDateRange}
                  placeholder="Select date range"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.jobsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
                  <XAxis
                    dataKey="period"
                    stroke="hsl(0 0% 60%)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="hsl(0 0% 60%)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="jobs"
                    fill="hsl(45 100% 60%)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              </CardContent>
            </Card>
            </div>

            {/* Operations Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in animation-delay-600">
          {/* Job Type Breakdown */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="font-display text-xl">Job Type Breakdown</CardTitle>
              <CardDescription>Distribution by service</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.jobTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {analyticsData.jobTypeData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {analyticsData.jobTypeData.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Driver Utilisation */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="font-display text-xl">Driver Hours Worked</CardTitle>
              <CardDescription>Total hours from completed & confirmed jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.driverUtilisation.length === 0 || analyticsData.driverUtilisation[0]?.hours === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No driver hours tracked yet</p>
                    <p className="text-xs mt-2">Hours will appear when drivers complete confirmed jobs</p>
                  </div>
                ) : (
                  analyticsData.driverUtilisation.map((driver: any, index: number) => {
                    // Calculate max hours for bar width (use the highest driver's hours as 100%)
                    const maxHours = Math.max(...analyticsData.driverUtilisation.map((d: any) => d.hours || 0), 1);
                    const barWidth = (driver.hours / maxHours) * 100;


                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-foreground">{driver.name}</span>
                          <span className="text-sm font-semibold text-accent">{driver.hours}h</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full gradient-accent transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="font-display text-xl">Performance Metrics</CardTitle>
              <CardDescription>Key operational indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Cancellation Rate</span>
                    <span className="text-2xl font-bold text-foreground">{analyticsData.cancellationRate.toFixed(1)}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {analyticsData.cancellationRate <= 5 ? "Within acceptable range" : "Above acceptable range"}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                    <span className="text-2xl font-bold text-accent">
                      {analyticsData.avgRating > 0 ? `${analyticsData.avgRating.toFixed(1)}/5.0` : "N/A"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on {analyticsData.totalReviews} review{analyticsData.totalReviews !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>
            </div>

            {/* Fleet Insights */}
            <Card className="border-accent/20 animate-fade-in">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Fleet Insights</CardTitle>
            <CardDescription>Vehicle performance this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Vehicle</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Jobs</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Mileage</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.fleetData.map((vehicle: any, index: number) => (
                    <tr 
                      key={index} 
                      className="border-b border-border/50 hover:bg-accent/5 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm font-medium text-foreground">{vehicle.vehicle}</td>
                      <td className="py-4 px-4 text-sm text-foreground">{vehicle.jobs}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{vehicle.mileage}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === "Active" 
                            ? "bg-accent/10 text-accent" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            vehicle.status === "Active" ? "bg-accent" : "bg-muted-foreground"
                          }`} />
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-8">
            <ReportsDataTable />
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
