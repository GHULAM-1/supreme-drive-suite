import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, TrendingUp, DollarSign, Car, Users } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface ReportMetrics {
  totalJobs: number;
  completedJobs: number;
  revenue: number;
  totalMiles: number;
  avgJobValue: number;
  driverUtilization: number;
  vehicleUtilization: number;
}

export default function ReportsDashboard() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [metrics, setMetrics] = useState<ReportMetrics>({
    totalJobs: 0,
    completedJobs: 0,
    revenue: 0,
    totalMiles: 0,
    avgJobValue: 0,
    driverUtilization: 0,
    vehicleUtilization: 0,
  });

  useEffect(() => {
    loadReports();
  }, [period]);

  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case "daily":
        return { from: startOfDay(now), to: endOfDay(now) };
      case "weekly":
        return { from: startOfDay(subDays(now, 7)), to: endOfDay(now) };
      case "monthly":
        return { from: startOfDay(subDays(now, 30)), to: endOfDay(now) };
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const { from, to } = getDateRange();

      // Fetch bookings in date range
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .gte("pickup_date", format(from, "yyyy-MM-dd"))
        .lte("pickup_date", format(to, "yyyy-MM-dd"));

      if (bookingsError) throw bookingsError;

      // Fetch total drivers and vehicles
      const [driversRes, vehiclesRes] = await Promise.all([
        supabase.from("drivers").select("id", { count: "exact", head: true }),
        supabase.from("vehicles").select("id", { count: "exact", head: true }),
      ]);

      const totalJobs = bookings?.length || 0;
      const completedJobs = bookings?.filter((b) => b.status === "completed").length || 0;
      const revenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
      const totalMiles = bookings?.reduce((sum, b) => sum + (b.distance_miles || 0), 0) || 0;
      const avgJobValue = totalJobs > 0 ? revenue / totalJobs : 0;

      // Calculate utilization
      const uniqueDrivers = new Set(bookings?.map((b) => b.driver_id).filter(Boolean)).size;
      const uniqueVehicles = new Set(bookings?.map((b) => b.vehicle_id).filter(Boolean)).size;
      const driverUtilization = (driversRes.count || 0) > 0 ? (uniqueDrivers / (driversRes.count || 1)) * 100 : 0;
      const vehicleUtilization = (vehiclesRes.count || 0) > 0 ? (uniqueVehicles / (vehiclesRes.count || 1)) * 100 : 0;

      setMetrics({
        totalJobs,
        completedJobs,
        revenue,
        totalMiles,
        avgJobValue,
        driverUtilization,
        vehicleUtilization,
      });
    } catch (error: any) {
      toast.error("Failed to load reports: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const reportData = [
      ["Metric", "Value"],
      ["Total Jobs", metrics.totalJobs],
      ["Completed Jobs", metrics.completedJobs],
      ["Revenue", `£${metrics.revenue.toFixed(2)}`],
      ["Total Miles", metrics.totalMiles.toFixed(2)],
      ["Avg Job Value", `£${metrics.avgJobValue.toFixed(2)}`],
      ["Driver Utilization", `${metrics.driverUtilization.toFixed(1)}%`],
      ["Vehicle Utilization", `${metrics.vehicleUtilization.toFixed(1)}%`],
    ];

    const csv = reportData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${period}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-bold">Reports & Analytics</h2>
        <div className="flex gap-4">
          <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <p className="text-3xl font-bold mt-2">{metrics.totalJobs}</p>
              <p className="text-sm text-green-500 mt-1">
                {metrics.completedJobs} completed
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-accent/50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-3xl font-bold mt-2">£{metrics.revenue.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Avg: £{metrics.avgJobValue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-accent/50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Driver Utilization</p>
              <p className="text-3xl font-bold mt-2">{metrics.driverUtilization.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">Active drivers</p>
            </div>
            <Users className="w-12 h-12 text-accent/50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Vehicle Utilization</p>
              <p className="text-3xl font-bold mt-2">{metrics.vehicleUtilization.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">
                {metrics.totalMiles.toFixed(0)} miles
              </p>
            </div>
            <Car className="w-12 h-12 text-accent/50" />
          </div>
        </Card>
      </div>

      {/* Additional Analytics */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Performance Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Completion Rate</span>
            <span className="font-semibold">
              {metrics.totalJobs > 0
                ? ((metrics.completedJobs / metrics.totalJobs) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Average Distance per Job</span>
            <span className="font-semibold">
              {metrics.totalJobs > 0 ? (metrics.totalMiles / metrics.totalJobs).toFixed(1) : 0} miles
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Revenue per Mile</span>
            <span className="font-semibold">
              £{metrics.totalMiles > 0 ? (metrics.revenue / metrics.totalMiles).toFixed(2) : 0}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
