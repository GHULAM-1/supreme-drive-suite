import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, Search, Filter, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  pickup_time: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  status: string | null;
  driver_id: string | null;
  vehicle_id: string | null;
  total_price: number | null;
  created_at: string | null;
  service_type: string | null;
  priority: string | null;
  protection_details: any;
}

interface Driver {
  id: string;
  name: string;
  is_available: boolean;
}

interface Vehicle {
  id: string;
  name: string;
  category: string;
}

export default function EnhancedJobsDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Sorting
  const [sortField, setSortField] = useState<keyof Booking>("pickup_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchTerm, statusFilter, serviceTypeFilter, driverFilter, vehicleFilter, dateRange, sortField, sortDirection]);

  const loadData = async () => {
    try {
      const [bookingsRes, driversRes, vehiclesRes] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("drivers").select("id, name, is_available").eq("is_active", true),
        supabase.from("vehicles").select("id, name, category").eq("is_active", true),
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (driversRes.error) throw driversRes.error;
      if (vehiclesRes.error) throw vehiclesRes.error;

      setBookings(bookingsRes.data || []);
      setDrivers(driversRes.data || []);
      setVehicles(vehiclesRes.data || []);
    } catch (error: any) {
      toast.error("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.pickup_location?.toLowerCase().includes(term) ||
          b.dropoff_location?.toLowerCase().includes(term) ||
          b.customer_name?.toLowerCase().includes(term) ||
          b.customer_email?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Service type filter
    if (serviceTypeFilter !== "all") {
      filtered = filtered.filter((b) => b.service_type === serviceTypeFilter);
    }

    // Driver filter
    if (driverFilter !== "all") {
      filtered = filtered.filter((b) => b.driver_id === driverFilter);
    }

    // Vehicle filter
    if (vehicleFilter !== "all") {
      filtered = filtered.filter((b) => b.vehicle_id === vehicleFilter);
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter((b) => {
        const bookingDate = new Date(b.pickup_date);
        if (dateRange.to) {
          return bookingDate >= dateRange.from! && bookingDate <= dateRange.to;
        }
        return bookingDate >= dateRange.from!;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredBookings(filtered);
  };

  const handleSort = (field: keyof Booking) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success("Status updated successfully");
      loadData();
    } catch (error: any) {
      toast.error("Failed to update status: " + error.message);
    }
  };

  const assignDriver = async (bookingId: string, driverId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ driver_id: driverId, assigned_at: new Date().toISOString() })
        .eq("id", bookingId);

      if (error) throw error;
      toast.success("Driver assigned successfully");
      loadData();
    } catch (error: any) {
      toast.error("Failed to assign driver: " + error.message);
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Customer", "Pickup", "Dropoff", "Status", "Driver", "Vehicle", "Price"];
    const rows = filteredBookings.map((b) => [
      b.pickup_date,
      b.customer_name || "",
      b.pickup_location,
      b.dropoff_location,
      b.status || "",
      drivers.find((d) => d.id === b.driver_id)?.name || "",
      vehicles.find((v) => v.id === b.vehicle_id)?.name || "",
      b.total_price || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "new": return "bg-primary/20 text-primary border-primary/30";
      case "in_review": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "confirmed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "completed": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient-metal mb-2">
            Jobs Management
          </h1>
          <p className="text-muted-foreground">Manage bookings and assignments</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-card/50 rounded-lg border border-border/50 shadow-metal">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="chauffeur">Chauffeur</SelectItem>
            <SelectItem value="close_protection">Close Protection</SelectItem>
          </SelectContent>
        </Select>

        <Select value={driverFilter} onValueChange={setDriverFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drivers</SelectItem>
            {drivers.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Vehicle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicles</SelectItem>
            {vehicles.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
              numberOfMonths={2}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredBookings.length} of {bookings.length} jobs
      </div>

      {/* Jobs Table */}
      <div className="border border-border/50 rounded-lg overflow-hidden shadow-metal bg-card/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("pickup_date")}>
                Date {sortField === "pickup_date" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow 
                key={booking.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/admin/jobs/${booking.id}`)}
              >
                <TableCell>
                  <div className="font-medium">{format(new Date(booking.pickup_date), "MMM dd, yyyy")}</div>
                  <div className="text-sm text-muted-foreground">{booking.pickup_time}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{booking.customer_name || "N/A"}</div>
                  <div className="text-sm text-muted-foreground">{booking.customer_email}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{booking.pickup_location}</div>
                  <div className="text-xs text-muted-foreground">→ {booking.dropoff_location}</div>
                </TableCell>
                <TableCell>
                  {booking.service_type === "close_protection" ? (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
                      <Shield className="w-3 h-3" />
                      Close Protection
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Chauffeur
                    </Badge>
                  )}
                  {booking.priority === "high" && (
                    <Badge className="ml-1 bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                      High Priority
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status || "new"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={booking.driver_id || "none"}
                    onValueChange={(value) => value !== "none" && assignDriver(booking.id, value)}
                  >
                    <SelectTrigger className="w-[150px]" onClick={(e) => e.stopPropagation()}>
                      <SelectValue placeholder="Assign driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No driver</SelectItem>
                      {drivers.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} {d.is_available && "✓"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {vehicles.find((v) => v.id === booking.vehicle_id)?.name || "N/A"}
                </TableCell>
                <TableCell>£{booking.total_price?.toFixed(2) || "0.00"}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={booking.status || "new"}
                    onValueChange={(value) => updateBookingStatus(booking.id, value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
