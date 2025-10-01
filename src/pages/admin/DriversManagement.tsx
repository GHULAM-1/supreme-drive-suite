import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Phone, Mail } from "lucide-react";

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  specializations: string[];
  is_available: boolean;
  is_active: boolean;
}

const DriversManagement = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    license_number: "",
    specializations: "",
    is_available: true,
    is_active: true,
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to load drivers");
    } else {
      setDrivers(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const specializationsArray = formData.specializations
      .split(",")
      .map(s => s.trim())
      .filter(s => s);

    const driverData = {
      ...formData,
      specializations: specializationsArray,
    };

    if (editingDriver) {
      const { error } = await supabase
        .from("drivers")
        .update(driverData)
        .eq("id", editingDriver.id);

      if (error) {
        toast.error("Failed to update driver");
        return;
      }
      toast.success("Driver updated");
    } else {
      const { error } = await supabase.from("drivers").insert(driverData);

      if (error) {
        toast.error("Failed to create driver");
        return;
      }
      toast.success("Driver created");
    }

    setDialogOpen(false);
    resetForm();
    loadDrivers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;

    const { error } = await supabase.from("drivers").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete driver");
      return;
    }

    toast.success("Driver deleted");
    loadDrivers();
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email || "",
      phone: driver.phone || "",
      license_number: driver.license_number || "",
      specializations: driver.specializations?.join(", ") || "",
      is_available: driver.is_available,
      is_active: driver.is_active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingDriver(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      license_number: "",
      specializations: "",
      is_available: true,
      is_active: true,
    });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-gradient-metal">Drivers Management</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-accent shadow-glow" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDriver ? "Edit Driver" : "Add New Driver"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="license">License Number</Label>
                <Input
                  id="license"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specializations">Specializations (comma-separated)</Label>
                <Input
                  id="specializations"
                  value={formData.specializations}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                  placeholder="e.g., Executive, Close Protection, Long Distance"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                  <Label htmlFor="available">Available</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="gradient-accent shadow-glow">
                  {editingDriver ? "Update Driver" : "Create Driver"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <Card key={driver.id} className="p-6 shadow-metal">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-display font-bold">{driver.name}</h3>
                <div className="flex gap-1">
                  {driver.is_available && (
                    <Badge className="bg-green-500">Available</Badge>
                  )}
                  {!driver.is_active && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>

              {driver.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{driver.email}</span>
                </div>
              )}

              {driver.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{driver.phone}</span>
                </div>
              )}

              {driver.license_number && (
                <p className="text-sm text-muted-foreground">
                  License: {driver.license_number}
                </p>
              )}

              {driver.specializations && driver.specializations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {driver.specializations.map((spec, idx) => (
                    <Badge key={idx} variant="outline">{spec}</Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <Button size="sm" variant="outline" onClick={() => handleEdit(driver)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(driver.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DriversManagement;
