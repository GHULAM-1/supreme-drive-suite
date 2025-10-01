import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

const PricingManagement = () => {
  const [extras, setExtras] = useState<any[]>([]);
  const [fixedRoutes, setFixedRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [extrasRes, routesRes, vehiclesRes] = await Promise.all([
      supabase.from("pricing_extras").select("*").order("extra_name"),
      supabase.from("fixed_routes").select("*, vehicles(name)").order("route_name"),
      supabase.from("vehicles").select("*").eq("is_active", true)
    ]);

    if (extrasRes.data) setExtras(extrasRes.data);
    if (routesRes.data) setFixedRoutes(routesRes.data);
    if (vehiclesRes.data) setVehicles(vehiclesRes.data);
    setLoading(false);
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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-gradient-metal">Pricing Management</h1>

      <Tabs defaultValue="extras">
        <TabsList>
          <TabsTrigger value="extras">Pricing Extras</TabsTrigger>
          <TabsTrigger value="routes">Fixed Routes</TabsTrigger>
          <TabsTrigger value="vehicle-rates">Vehicle Rates</TabsTrigger>
        </TabsList>

        <TabsContent value="extras">
          <PricingExtras extras={extras} loadData={loadData} logAudit={logAudit} />
        </TabsContent>

        <TabsContent value="routes">
          <FixedRoutes routes={fixedRoutes} vehicles={vehicles} loadData={loadData} logAudit={logAudit} />
        </TabsContent>

        <TabsContent value="vehicle-rates">
          <VehicleRates vehicles={vehicles} loadData={loadData} logAudit={logAudit} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const PricingExtras = ({ extras, loadData, logAudit }: any) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ extra_name: "", price: 0, description: "", is_active: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const oldValues = editing ? { ...editing } : null;

    if (editing) {
      const { error } = await supabase.from("pricing_extras").update(formData).eq("id", editing.id);
      if (!error) {
        await logAudit("UPDATE", "pricing_extras", editing.id, oldValues, formData);
        toast.success("Extra updated");
      }
    } else {
      const { data, error } = await supabase.from("pricing_extras").insert(formData).select().single();
      if (!error && data) {
        await logAudit("INSERT", "pricing_extras", data.id, null, formData);
        toast.success("Extra created");
      }
    }

    setDialogOpen(false);
    setEditing(null);
    setFormData({ extra_name: "", price: 0, description: "", is_active: true });
    loadData();
  };

  const handleDelete = async (id: string) => {
    const extra = extras.find((e: any) => e.id === id);
    const { error } = await supabase.from("pricing_extras").delete().eq("id", id);
    if (!error) {
      await logAudit("DELETE", "pricing_extras", id, extra, null);
      toast.success("Extra deleted");
      loadData();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-accent shadow-glow" onClick={() => setEditing(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Extra
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Add"} Pricing Extra</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Extra Name</Label>
                <Input
                  value={formData.extra_name}
                  onChange={(e) => setFormData({ ...formData, extra_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {extras.map((extra) => (
          <Card key={extra.id} className="p-4">
            <h3 className="font-semibold">{extra.extra_name}</h3>
            <p className="text-2xl font-bold text-accent">£{extra.price}</p>
            <p className="text-sm text-muted-foreground">{extra.description}</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => {
                setEditing(extra);
                setFormData({ extra_name: extra.extra_name, price: extra.price, description: extra.description, is_active: extra.is_active });
                setDialogOpen(true);
              }}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(extra.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const FixedRoutes = ({ routes, vehicles, loadData, logAudit }: any) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    route_name: "", pickup_location: "", dropoff_location: "", fixed_price: 0, vehicle_id: "", is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const oldValues = editing ? { ...editing } : null;

    if (editing) {
      const { error } = await supabase.from("fixed_routes").update(formData).eq("id", editing.id);
      if (!error) {
        await logAudit("UPDATE", "fixed_routes", editing.id, oldValues, formData);
        toast.success("Route updated");
      }
    } else {
      const { data, error } = await supabase.from("fixed_routes").insert(formData).select().single();
      if (!error && data) {
        await logAudit("INSERT", "fixed_routes", data.id, null, formData);
        toast.success("Route created");
      }
    }

    setDialogOpen(false);
    setEditing(null);
    setFormData({ route_name: "", pickup_location: "", dropoff_location: "", fixed_price: 0, vehicle_id: "", is_active: true });
    loadData();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-accent shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Fixed Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Add"} Fixed Route</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Route Name</Label>
                <Input value={formData.route_name} onChange={(e) => setFormData({ ...formData, route_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Pickup Location</Label>
                <Input value={formData.pickup_location} onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Dropoff Location</Label>
                <Input value={formData.dropoff_location} onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Fixed Price (£)</Label>
                <Input type="number" step="0.01" value={formData.fixed_price} onChange={(e) => setFormData({ ...formData, fixed_price: parseFloat(e.target.value) })} required />
              </div>
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {routes.map((route: any) => (
          <Card key={route.id} className="p-4">
            <h3 className="font-semibold text-lg">{route.route_name}</h3>
            <p className="text-sm">{route.pickup_location} → {route.dropoff_location}</p>
            <p className="text-2xl font-bold text-accent mt-2">£{route.fixed_price}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

const VehicleRates = ({ vehicles, loadData, logAudit }: any) => {
  const handleUpdate = async (vehicleId: string, field: string, value: number) => {
    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    const oldValues = { ...vehicle };
    const newValues = { ...vehicle, [field]: value };

    const { error } = await supabase.from("vehicles").update({ [field]: value }).eq("id", vehicleId);
    
    if (!error) {
      await logAudit("UPDATE", "vehicles", vehicleId, oldValues, newValues);
      toast.success("Rate updated");
      loadData();
    }
  };

  return (
    <div className="space-y-4">
      {vehicles.map((vehicle: any) => (
        <Card key={vehicle.id} className="p-6">
          <h3 className="text-xl font-display font-bold mb-4">{vehicle.name}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Base Price per Mile (£)</Label>
              <Input
                type="number"
                step="0.1"
                defaultValue={vehicle.base_price_per_mile}
                onBlur={(e) => handleUpdate(vehicle.id, "base_price_per_mile", parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Overnight Surcharge (£)</Label>
              <Input
                type="number"
                defaultValue={vehicle.overnight_surcharge}
                onBlur={(e) => handleUpdate(vehicle.id, "overnight_surcharge", parseInt(e.target.value))}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PricingManagement;
