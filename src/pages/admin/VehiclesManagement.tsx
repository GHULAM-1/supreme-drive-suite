import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Car, Users, Briefcase, PoundSterling, Moon, ChevronRight, Upload, X, Loader2, RefreshCcw } from "lucide-react";

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
  image_url: string | null;
}

const VehiclesManagement = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    capacity: 4,
    luggage_capacity: 3,
    base_price_per_mile: 2.5,
    overnight_surcharge: 150,
    is_active: true,
    image_url: null as string | null,
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select("*", { count: 'exact', head: false })
      .order("name");

    if (error) {
      toast.error("Failed to load vehicles");
    } else {
      setVehicles(data || []);
      setLastUpdated(new Date());
    }
    setLoading(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError, data } = await supabase.storage
        .from('vehicle-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const deleteImage = async (imageUrl: string) => {
    try {
      const path = imageUrl.split('/vehicle-images/')[1];
      if (path) {
        await supabase.storage.from('vehicle-images').remove([path]);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error('Image must be under 3MB');
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Please upload JPG, PNG, or WEBP');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image_url: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.image_url;

      // Upload new image if selected
      if (imageFile) {
        // Delete old image if updating
        if (editingVehicle?.image_url) {
          await deleteImage(editingVehicle.image_url);
        }
        
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          setUploading(false);
          return;
        }
      }

      const vehicleData = {
        ...formData,
        image_url: imageUrl,
      };

      if (editingVehicle) {
        const { error } = await supabase
          .from("vehicles")
          .update(vehicleData)
          .eq("id", editingVehicle.id);

        if (error) {
          toast.error("Failed to update vehicle");
          setUploading(false);
          return;
        }
        
        // Optimistic UI update
        setVehicles(prev => prev.map(v => 
          v.id === editingVehicle.id ? { ...v, ...vehicleData } : v
        ));
        
        toast.success("Vehicle updated successfully");
      } else {
        const { data, error } = await supabase
          .from("vehicles")
          .insert(vehicleData)
          .select()
          .single();

        if (error) {
          toast.error("Failed to create vehicle");
          setUploading(false);
          return;
        }
        
        // Optimistic UI update
        setVehicles(prev => [...prev, data]);
        toast.success("Vehicle created successfully");
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      // Delete image from storage if exists
      if (vehicleToDelete.image_url) {
        await deleteImage(vehicleToDelete.image_url);
      }

      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", vehicleToDelete.id);

      if (error) {
        toast.error("Failed to delete vehicle");
        return;
      }

      toast.success("Vehicle removed successfully");
      loadVehicles();
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
    }
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
      image_url: vehicle.image_url,
    });
    setImagePreview(vehicle.image_url);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      name: "",
      category: "",
      description: "",
      capacity: 4,
      luggage_capacity: 3,
      base_price_per_mile: 2.5,
      overnight_surcharge: 150,
      is_active: true,
      image_url: null,
    });
  };

  if (loading) {
    return (
      <TooltipProvider>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="space-y-2">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-8 space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient-metal mb-2">Vehicles Management</h1>
            <p className="text-muted-foreground">
              Maintain and manage your active vehicle fleet for bookings and operations.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={loadVehicles} variant="outline" className="gap-2">
                  <RefreshCcw className="w-4 h-4" />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reload vehicles data</p>
              </TooltipContent>
            </Tooltip>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button className="gradient-accent shadow-glow" onClick={resetForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add new vehicle to fleet</p>
                </TooltipContent>
              </Tooltip>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">
                  {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
                </DialogTitle>
                <DialogDescription>
                  Complete all required fields to {editingVehicle ? "update" : "add"} vehicle to fleet
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Vehicle Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Rolls-Royce Phantom"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="focus-visible:ring-accent"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="category"
                      placeholder="e.g., Ultra Luxury, Executive"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="focus-visible:ring-accent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of vehicle and features"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="focus-visible:ring-accent"
                    rows={3}
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Upload Vehicle Image</Label>
                  <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP (max 3MB)</p>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Vehicle preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={removeImage}
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent/50 transition-colors">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <div className="space-y-2">
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <span className="text-accent hover:underline">Choose file</span>
                          <span className="text-muted-foreground"> or drag and drop</span>
                        </Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-sm font-medium">
                      Passenger Capacity <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                      className="focus-visible:ring-accent"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="luggage" className="text-sm font-medium">
                      Luggage Capacity <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="luggage"
                      type="number"
                      value={formData.luggage_capacity}
                      onChange={(e) => setFormData({ ...formData, luggage_capacity: parseInt(e.target.value) || 0 })}
                      className="focus-visible:ring-accent"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">
                      Base Price per Mile (£) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 9.00"
                      value={formData.base_price_per_mile}
                      onChange={(e) => setFormData({ ...formData, base_price_per_mile: parseFloat(e.target.value) || 0 })}
                      className="focus-visible:ring-accent"
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overnight" className="text-sm font-medium">
                      Overnight Surcharge (£) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="overnight"
                      type="number"
                      placeholder="e.g., 200"
                      value={formData.overnight_surcharge}
                      onChange={(e) => setFormData({ ...formData, overnight_surcharge: parseInt(e.target.value) || 0 })}
                      className="focus-visible:ring-accent"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
                    Active Status (visible on website)
                  </Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="gradient-accent shadow-glow"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>{editingVehicle ? "Update Vehicle" : "Create Vehicle"}</>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
            </div>
          </div>

        {/* Empty State */}
        {vehicles.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 px-4">
            <div className="rounded-full bg-muted/50 p-6 mb-6">
              <Car className="w-16 h-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">No vehicles in fleet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Upload your first vehicle to make it available for booking.
            </p>
            <Button className="gradient-accent shadow-glow" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle, index) => (
              <Card 
                key={vehicle.id} 
                className="relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_0_30px_rgba(244,197,66,0.15)] hover:scale-[1.02] hover:border-accent/40 border-2 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Status Badge */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant={vehicle.is_active ? "default" : "secondary"}
                      className={`absolute top-4 right-4 z-10 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg ${
                        vehicle.is_active 
                          ? "bg-white text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]" 
                          : "bg-muted text-muted-foreground border"
                      }`}
                    >
                      {vehicle.is_active ? "🟢 Active" : "🔴 Inactive"}
                    </Badge>
                  </TooltipTrigger>
                </Tooltip>

                {/* Vehicle Image */}
                <div className="h-48 w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                {vehicle.image_url ? (
                    <img
                      src={`${vehicle.image_url}?t=${lastUpdated.getTime()}`}
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Car className="h-16 w-16 text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground/50">No image uploaded</p>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <CardContent className="p-8 flex-1 flex flex-col space-y-4">
                  {/* Vehicle Name & Category */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold font-display leading-tight">{vehicle.name}</h3>
                    <p className="text-sm text-accent font-medium">{vehicle.category}</p>
                    <div className="h-px w-16 bg-gradient-to-r from-accent to-transparent"></div>
                  </div>

                  {/* Description */}
                  {vehicle.description && (
                    <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
                      {vehicle.description}
                    </p>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div className="p-3 rounded-lg bg-muted/50 space-y-1.5 transition-colors hover:bg-muted/70">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>Capacity</span>
                      </div>
                      <p className="font-semibold text-foreground">{vehicle.capacity} passengers</p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50 space-y-1.5 transition-colors hover:bg-muted/70">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>Luggage</span>
                      </div>
                      <p className="font-semibold text-foreground">{vehicle.luggage_capacity} items</p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50 space-y-1.5 transition-colors hover:bg-muted/70">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <PoundSterling className="h-3.5 w-3.5" />
                        <span>Price/Mile</span>
                      </div>
                      <p className="font-semibold text-foreground">£{vehicle.base_price_per_mile.toFixed(2)}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50 space-y-1.5 transition-colors hover:bg-muted/70">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Moon className="h-3.5 w-3.5" />
                        <span>Overnight</span>
                      </div>
                      <p className="font-semibold text-foreground">
                        {vehicle.overnight_surcharge > 0 ? `£${vehicle.overnight_surcharge}` : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Action Bar Footer */}
                  <div className="flex justify-end items-center gap-2 pt-4 border-t mt-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(vehicle)}
                          className="hover:border-accent/50 hover:text-accent hover:text-white transition-all hover:scale-110"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Vehicle</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteClick(vehicle)}
                          className="hover:border-destructive hover:text-destructive transition-all hover:scale-110"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove Vehicle</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-display">Remove Vehicle?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  Are you sure you want to remove <span className="font-semibold text-foreground">{vehicleToDelete?.name}</span>? 
                  This will also remove it from the website booking options and cannot be undone.
                </p>
                {vehicleToDelete?.image_url && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={vehicleToDelete.image_url}
                      alt={vehicleToDelete.name}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove Vehicle
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default VehiclesManagement;
