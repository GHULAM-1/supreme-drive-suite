import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
          <Card 
            key={driver.id} 
            className="relative p-8 shadow-metal hover:shadow-lg transition-all duration-300 hover:scale-[1.01] border-border/50 hover:border-primary/20"
          >
            {/* Status Badge - Top Right */}
            <div className="absolute top-4 right-4">
              {driver.is_available ? (
                <Badge className="rounded-full px-3 py-1 bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 text-xs">
                  Available
                </Badge>
              ) : (
                <Badge className="rounded-full px-3 py-1 bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30 text-xs">
                  Unavailable
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              {/* Avatar with Initials */}
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-16 w-16 bg-gradient-to-br from-primary to-primary/60 shadow-glow">
                  <AvatarFallback className="bg-transparent text-primary-foreground font-bold text-lg">
                    {getInitials(driver.name)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Driver Name */}
                <h3 className="text-2xl font-display font-bold text-center">{driver.name}</h3>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                {driver.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{driver.email}</span>
                  </div>
                )}

                {driver.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{driver.phone}</span>
                  </div>
                )}
              </div>

              {/* License Number */}
              {driver.license_number && (
                <p className="text-sm font-light text-muted-foreground text-center">
                  License: {driver.license_number}
                </p>
              )}

              {/* Specializations - Premium Pills */}
              {driver.specializations && driver.specializations.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {driver.specializations.map((spec, idx) => (
                    <Badge 
                      key={idx} 
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        idx % 2 === 0 
                          ? 'bg-primary text-primary-foreground border-primary/50' 
                          : 'bg-secondary text-secondary-foreground border-border'
                      }`}
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Inactive Badge if applicable */}
              {!driver.is_active && (
                <div className="flex justify-center">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    Inactive
                  </Badge>
                </div>
              )}

              {/* Action Buttons - Bottom Right */}
              <div className="flex justify-end gap-2 pt-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => handleEdit(driver)}
                      className="hover:bg-primary/10 hover:border-primary/50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Driver</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      onClick={() => handleDelete(driver.id)}
                      className="hover:bg-destructive/90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove Driver</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DriversManagement;
