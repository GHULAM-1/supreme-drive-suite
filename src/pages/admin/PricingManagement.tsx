import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search, RefreshCw, Package, MapPin, Car, ArrowUpDown } from "lucide-react";

type PricingExtra = {
  id: string;
  extra_name: string;
  description: string;
  price: number;
  is_active: boolean;
  created_at: string;
};

type FixedRoute = {
  id: string;
  route_name: string;
  pickup_location: string;
  dropoff_location: string;
  fixed_price: number;
  vehicle_id: string | null;
  is_active: boolean;
  created_at: string;
  vehicles?: { name: string };
};

type Vehicle = {
  id: string;
  name: string;
  image_url: string | null;
  base_price_per_mile: number;
  overnight_surcharge: number;
  is_active: boolean;
};

const PricingManagement = () => {
  const [extras, setExtras] = useState<PricingExtra[]>([]);
  const [fixedRoutes, setFixedRoutes] = useState<FixedRoute[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [extrasRes, routesRes, vehiclesRes] = await Promise.all([
        supabase.from("pricing_extras").select("*").order("extra_name"),
        supabase.from("fixed_routes").select("*, vehicles(name)").order("route_name"),
        supabase.from("vehicles").select("*").eq("is_active", true).order("name")
      ]);

      if (extrasRes.data) setExtras(extrasRes.data);
      if (routesRes.data) setFixedRoutes(routesRes.data);
      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
    } catch (error) {
      toast.error("Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  };

  const logAudit = async (action: string, tableName: string, recordId: string, oldValues: any, newValues: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      user_id: user?.id,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-12 w-full" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient-metal">Pricing Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage service pricing, extras, and vehicle rates for automated booking calculations.
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync to Booking Engine
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Push latest prices to the live booking calculator</p>
            </TooltipContent>
          </Tooltip>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="extras" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger 
            value="extras" 
            className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent"
          >
            <Package className="w-4 h-4 mr-2" />
            Pricing Extras
          </TabsTrigger>
          <TabsTrigger 
            value="routes"
            className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Fixed Routes
          </TabsTrigger>
          <TabsTrigger 
            value="vehicle-rates"
            className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent"
          >
            <Car className="w-4 h-4 mr-2" />
            Vehicle Rates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="extras" className="space-y-4">
          <PricingExtras extras={extras} loadData={loadData} logAudit={logAudit} />
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <FixedRoutes routes={fixedRoutes} vehicles={vehicles} loadData={loadData} logAudit={logAudit} />
        </TabsContent>

        <TabsContent value="vehicle-rates" className="space-y-4">
          <VehicleRates vehicles={vehicles} loadData={loadData} logAudit={logAudit} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ============= PRICING EXTRAS TAB =============
const PricingExtras = ({ extras, loadData, logAudit }: { 
  extras: PricingExtra[]; 
  loadData: () => void; 
  logAudit: (action: string, tableName: string, recordId: string, oldValues: any, newValues: any) => Promise<void>;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PricingExtra | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    extra_name: "",
    price: 0,
    description: "",
    is_active: true
  });

  const filteredExtras = useMemo(() => {
    return extras.filter(extra =>
      extra.extra_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extra.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [extras, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.price < 0) {
      toast.error("Price must be 0 or greater");
      return;
    }

    try {
      const oldValues = editing ? { ...editing } : null;

      if (editing) {
        const { error } = await supabase
          .from("pricing_extras")
          .update(formData)
          .eq("id", editing.id);
        
        if (error) throw error;
        
        await logAudit("UPDATE", "pricing_extras", editing.id, oldValues, formData);
        toast.success("Extra updated successfully");
      } else {
        const { data, error } = await supabase
          .from("pricing_extras")
          .insert(formData)
          .select()
          .single();
        
        if (error) throw error;
        if (data) await logAudit("INSERT", "pricing_extras", data.id, null, formData);
        
        toast.success("Extra saved successfully");
      }

      setDialogOpen(false);
      setEditing(null);
      setFormData({ extra_name: "", price: 0, description: "", is_active: true });
      loadData();
    } catch (error) {
      toast.error("Failed to save extra");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const extra = extras.find(e => e.id === deletingId);
      const { error } = await supabase
        .from("pricing_extras")
        .delete()
        .eq("id", deletingId);
      
      if (error) throw error;
      
      await logAudit("DELETE", "pricing_extras", deletingId, extra, null);
      toast.success("Extra removed successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to delete extra");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const openEditDialog = (extra: PricingExtra) => {
    setEditing(extra);
    setFormData({
      extra_name: extra.extra_name,
      price: extra.price,
      description: extra.description || "",
      is_active: extra.is_active
    });
    setDialogOpen(true);
  };

  return (
    <>
      {/* Search and Add */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search extras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gradient-accent shadow-glow" 
              onClick={() => {
                setEditing(null);
                setFormData({ extra_name: "", price: 0, description: "", is_active: true });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Extra
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Add"} Pricing Extra</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="extra_name">
                  Label <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="extra_name"
                  value={formData.extra_name}
                  onChange={(e) => setFormData({ ...formData, extra_name: e.target.value })}
                  placeholder="e.g., Meet & Greet"
                  required
                  className="focus:ring-2 focus:ring-accent"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (£) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                  className="focus:ring-2 focus:ring-accent"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this extra..."
                  rows={3}
                  className="focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gradient-accent shadow-glow">
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Extras Grid */}
      {filteredExtras.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <Package className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">No extras yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first pricing extra to get started
              </p>
            </div>
            <Button 
              className="gradient-accent shadow-glow mt-2" 
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Extra
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExtras.map((extra) => (
            <Card 
              key={extra.id} 
              className="p-5 hover-lift transition-all duration-300 border-border hover:border-accent/50 hover:shadow-glow"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-display font-semibold text-lg">{extra.extra_name}</h3>
                  {extra.is_active ? (
                    <Badge className="bg-accent/10 text-accent border-accent/20">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                  )}
                </div>
                
                <p className="text-3xl font-display font-bold text-accent">
                  £{extra.price.toFixed(2)}
                </p>
                
                {extra.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {extra.description}
                  </p>
                )}
                
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => openEditDialog(extra)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit extra</TooltipContent>
                    </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => {
                            setDeletingId(extra.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete extra</TooltipContent>
                    </Tooltip>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this pricing extra?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The extra will be permanently removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ============= FIXED ROUTES TAB =============
const FixedRoutes = ({ routes, vehicles, loadData, logAudit }: {
  routes: FixedRoute[];
  vehicles: Vehicle[];
  loadData: () => void;
  logAudit: (action: string, tableName: string, recordId: string, oldValues: any, newValues: any) => Promise<void>;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FixedRoute | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"route_name" | "fixed_price">("route_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [formData, setFormData] = useState({
    route_name: "",
    pickup_location: "",
    dropoff_location: "",
    fixed_price: 0,
    vehicle_id: "",
    is_active: true
  });

  const filteredAndSortedRoutes = useMemo(() => {
    let filtered = routes.filter(route =>
      route.route_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.pickup_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.dropoff_location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortField === "route_name") {
        return sortOrder === "asc" 
          ? a.route_name.localeCompare(b.route_name)
          : b.route_name.localeCompare(a.route_name);
      } else {
        return sortOrder === "asc"
          ? a.fixed_price - b.fixed_price
          : b.fixed_price - a.fixed_price;
      }
    });

    return filtered;
  }, [routes, searchQuery, sortField, sortOrder]);

  const toggleSort = (field: "route_name" | "fixed_price") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.fixed_price < 0) {
      toast.error("Price must be 0 or greater");
      return;
    }

    try {
      const oldValues = editing ? { ...editing } : null;
      const submitData = {
        ...formData,
        vehicle_id: formData.vehicle_id || null
      };

      if (editing) {
        const { error } = await supabase
          .from("fixed_routes")
          .update(submitData)
          .eq("id", editing.id);
        
        if (error) throw error;
        
        await logAudit("UPDATE", "fixed_routes", editing.id, oldValues, submitData);
        toast.success("Route updated successfully");
      } else {
        const { data, error } = await supabase
          .from("fixed_routes")
          .insert(submitData)
          .select()
          .single();
        
        if (error) throw error;
        if (data) await logAudit("INSERT", "fixed_routes", data.id, null, submitData);
        
        toast.success("Route saved successfully");
      }

      setDialogOpen(false);
      setEditing(null);
      setFormData({
        route_name: "",
        pickup_location: "",
        dropoff_location: "",
        fixed_price: 0,
        vehicle_id: "",
        is_active: true
      });
      loadData();
    } catch (error) {
      toast.error("Failed to save route");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const route = routes.find(r => r.id === deletingId);
      const { error } = await supabase
        .from("fixed_routes")
        .delete()
        .eq("id", deletingId);
      
      if (error) throw error;
      
      await logAudit("DELETE", "fixed_routes", deletingId, route, null);
      toast.success("Route removed successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to delete route");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const openEditDialog = (route: FixedRoute) => {
    setEditing(route);
    setFormData({
      route_name: route.route_name,
      pickup_location: route.pickup_location,
      dropoff_location: route.dropoff_location,
      fixed_price: route.fixed_price,
      vehicle_id: route.vehicle_id || "",
      is_active: route.is_active
    });
    setDialogOpen(true);
  };

  return (
    <>
      {/* Search and Add */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gradient-accent shadow-glow"
              onClick={() => {
                setEditing(null);
                setFormData({
                  route_name: "",
                  pickup_location: "",
                  dropoff_location: "",
                  fixed_price: 0,
                  vehicle_id: "",
                  is_active: true
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Add"} Fixed Route</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="route_name">
                  Route Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="route_name"
                  value={formData.route_name}
                  onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                  placeholder="e.g., Heathrow to Central London"
                  required
                  className="focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup">
                    Pickup Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pickup"
                    value={formData.pickup_location}
                    onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                    placeholder="e.g., Heathrow Airport"
                    required
                    className="focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dropoff">
                    Drop-off Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dropoff"
                    value={formData.dropoff_location}
                    onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })}
                    placeholder="e.g., Mayfair"
                    required
                    className="focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Base Price (£) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fixed_price}
                    onChange={(e) => setFormData({ ...formData, fixed_price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                    className="focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle</Label>
                  <Select
                    value={formData.vehicle_id}
                    onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                  >
                    <SelectTrigger id="vehicle" className="focus:ring-2 focus:ring-accent">
                      <SelectValue placeholder="Any vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any vehicle</SelectItem>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="route_active">Active</Label>
                <Switch
                  id="route_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gradient-accent shadow-glow">
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Routes Table */}
      {filteredAndSortedRoutes.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">No fixed routes configured</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first route to get started
              </p>
            </div>
            <Button 
              className="gradient-accent shadow-glow mt-2" 
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort("route_name")}
                    className="hover:text-accent"
                  >
                    Route Name
                    <ArrowUpDown className="ml-2 w-4 h-4" />
                  </Button>
                </TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort("fixed_price")}
                    className="hover:text-accent"
                  >
                    Base Price
                    <ArrowUpDown className="ml-2 w-4 h-4" />
                  </Button>
                </TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedRoutes.map((route) => (
                <TableRow key={route.id} className="hover:bg-accent/5">
                  <TableCell className="font-medium">{route.route_name}</TableCell>
                  <TableCell className="text-muted-foreground">{route.pickup_location}</TableCell>
                  <TableCell className="text-muted-foreground">{route.dropoff_location}</TableCell>
                  <TableCell className="font-display font-semibold text-accent">
                    £{route.fixed_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {route.vehicles?.name || "Any"}
                  </TableCell>
                  <TableCell>
                    {route.is_active ? (
                      <Badge className="bg-accent/10 text-accent border-accent/20">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(route)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit route</TooltipContent>
                        </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setDeletingId(route.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete route</TooltipContent>
                        </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this fixed route?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The route will be permanently removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ============= VEHICLE RATES TAB =============
const VehicleRates = ({ vehicles, loadData, logAudit }: {
  vehicles: Vehicle[];
  loadData: () => void;
  logAudit: (action: string, tableName: string, recordId: string, oldValues: any, newValues: any) => Promise<void>;
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle =>
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vehicles, searchQuery]);

  const handleUpdate = async (vehicleId: string, field: string, value: number) => {
    if (value < 0) {
      toast.error("Value must be 0 or greater");
      return;
    }

    try {
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      const oldValues = { ...vehicle };
      const newValues = { ...vehicle, [field]: value };

      const { error } = await supabase
        .from("vehicles")
        .update({ [field]: value })
        .eq("id", vehicleId);
      
      if (error) throw error;
      
      await logAudit("UPDATE", "vehicles", vehicleId, oldValues, newValues);
      toast.success("Rate updated successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to update rate");
    }
  };

  return (
    <>
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Vehicle Rates Grid */}
      {filteredVehicles.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <Car className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">No vehicle rates configured</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add vehicles to configure their rates
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <Card 
              key={vehicle.id} 
              className="p-5 hover-lift transition-all duration-300 border-border hover:border-accent/50"
            >
              <div className="space-y-4">
                {/* Vehicle Image */}
                {vehicle.image_url && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={vehicle.image_url}
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Vehicle Name */}
                <h3 className="text-xl font-display font-bold">{vehicle.name}</h3>
                
                {/* Rate Inputs */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`price-${vehicle.id}`} className="text-xs text-muted-foreground">
                      Price per Mile (£)
                    </Label>
                    <Input
                      id={`price-${vehicle.id}`}
                      type="number"
                      step="0.10"
                      min="0"
                      defaultValue={vehicle.base_price_per_mile}
                      onBlur={(e) => handleUpdate(vehicle.id, "base_price_per_mile", parseFloat(e.target.value) || 0)}
                      className="focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`surcharge-${vehicle.id}`} className="text-xs text-muted-foreground">
                      Overnight Surcharge (£)
                    </Label>
                    <Input
                      id={`surcharge-${vehicle.id}`}
                      type="number"
                      step="1"
                      min="0"
                      defaultValue={vehicle.overnight_surcharge}
                      onBlur={(e) => handleUpdate(vehicle.id, "overnight_surcharge", parseFloat(e.target.value) || 0)}
                      className="focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
                
                <Badge className="bg-accent/10 text-accent border-accent/20 w-full justify-center">
                  Active
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default PricingManagement;
