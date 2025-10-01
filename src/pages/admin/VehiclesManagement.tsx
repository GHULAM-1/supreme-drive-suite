import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  category: string;
  description: string;
  capacity: number;
  luggage_capacity: number;
  base_price_per_mile: number;
  overnight_surcharge: number;
  is_active: boolean;
}

const VehiclesManagement = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    capacity: 4,
    luggage_capacity: 3,
    base_price_per_mile: 2.5,
    overnight_surcharge: 150,
    is_active: true,
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to load vehicles");
    } else {
      setVehicles(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingVehicle) {
      const { error } = await supabase
        .from("vehicles")
        .update(formData)
        .eq("id", editingVehicle.id);

      if (error) {
        toast.error("Failed to update vehicle");
        return;
      }
      toast.success("Vehicle updated");
    } else {
      const { error } = await supabase.from("vehicles").insert(formData);

      if (error) {
        toast.error("Failed to create vehicle");
        return;
      }
      toast.success("Vehicle created");
    }

    setDialogOpen(false);
    resetForm();
    loadVehicles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    const { error } = await supabase.from("vehicles").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete vehicle");
      return;
    }

    toast.success("Vehicle deleted");
    loadVehicles();
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      category: vehicle.category,
      description: vehicle.description,
      capacity: vehicle.capacity,
      luggage_capacity: vehicle.luggage_capacity,
      base_price_per_mile: vehicle.base_price_per_mile,
      overnight_surcharge: vehicle.overnight_surcharge,
      is_active: vehicle.is_active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setFormData({
      name: "",
      category: "",
      description: "",
      capacity: 4,
      luggage_capacity: 3,
      base_price_per_mile: 2.5,
      overnight_surcharge: 150,
      is_active: true,
    });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-gradient-metal">Vehicles Management</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-accent shadow-glow" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vehicle Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Passenger Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="luggage">Luggage Capacity</Label>
                  <Input
                    id="luggage"
                    type="number"
                    value={formData.luggage_capacity}
                    onChange={(e) => setFormData({ ...formData, luggage_capacity: parseInt(e.target.value) })}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Base Price per Mile (£)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.1"
                    value={formData.base_price_per_mile}
                    onChange={(e) => setFormData({ ...formData, base_price_per_mile: parseFloat(e.target.value) })}
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overnight">Overnight Surcharge (£)</Label>
                  <Input
                    id="overnight"
                    type="number"
                    value={formData.overnight_surcharge}
                    onChange={(e) => setFormData({ ...formData, overnight_surcharge: parseInt(e.target.value) })}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="gradient-accent shadow-glow">
                  {editingVehicle ? "Update Vehicle" : "Create Vehicle"}
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
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="p-6 shadow-metal">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-display font-bold">{vehicle.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${vehicle.is_active ? 'bg-green-500' : 'bg-gray-500'}`}>
                  {vehicle.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">{vehicle.category}</p>
              <p className="text-sm">{vehicle.description}</p>

              <div className="grid grid-cols-2 gap-2 text-sm pt-3 border-t border-border">
                <div>
                  <p className="text-muted-foreground">Capacity</p>
                  <p className="font-medium">{vehicle.capacity} passengers</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Luggage</p>
                  <p className="font-medium">{vehicle.luggage_capacity} items</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price/Mile</p>
                  <p className="font-medium">£{vehicle.base_price_per_mile}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Overnight</p>
                  <p className="font-medium">£{vehicle.overnight_surcharge}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button size="sm" variant="outline" onClick={() => handleEdit(vehicle)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(vehicle.id)}>
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

export default VehiclesManagement;
