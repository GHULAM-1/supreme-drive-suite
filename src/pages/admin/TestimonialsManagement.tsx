import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Star } from "lucide-react";

interface Testimonial {
  id: string;
  customer_name: string;
  customer_title: string;
  content: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_title: "",
    content: "",
    rating: 5,
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load testimonials");
    } else {
      setTestimonials(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTestimonial) {
      const { error } = await supabase
        .from("testimonials")
        .update(formData)
        .eq("id", editingTestimonial.id);

      if (error) {
        toast.error("Failed to update testimonial");
        return;
      }
      toast.success("Testimonial updated");
    } else {
      const { error } = await supabase.from("testimonials").insert(formData);

      if (error) {
        toast.error("Failed to create testimonial");
        return;
      }
      toast.success("Testimonial created");
    }

    setDialogOpen(false);
    resetForm();
    loadTestimonials();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete testimonial");
      return;
    }

    toast.success("Testimonial deleted");
    loadTestimonials();
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      customer_name: testimonial.customer_name,
      customer_title: testimonial.customer_title || "",
      content: testimonial.content,
      rating: testimonial.rating || 5,
      is_featured: testimonial.is_featured,
      is_active: testimonial.is_active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTestimonial(null);
    setFormData({
      customer_name: "",
      customer_title: "",
      content: "",
      rating: 5,
      is_featured: false,
      is_active: true,
    });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-gradient-metal">Testimonials Management</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-accent shadow-glow" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name</Label>
                  <Input
                    id="name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title/Company</Label>
                  <Input
                    id="title"
                    value={formData.customer_title}
                    onChange={(e) => setFormData({ ...formData, customer_title: e.target.value })}
                    placeholder="e.g., CEO at Company"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Testimonial Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select
                  value={formData.rating.toString()}
                  onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
                >
                  <SelectTrigger id="rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "Star" : "Stars"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="featured">Featured</Label>
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
                  {editingTestimonial ? "Update Testimonial" : "Create Testimonial"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="p-6 shadow-metal">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-display font-bold">{testimonial.customer_name}</h3>
                  {testimonial.customer_title && (
                    <p className="text-sm text-muted-foreground">{testimonial.customer_title}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  {testimonial.is_featured && (
                    <span className="text-xs px-2 py-1 rounded bg-yellow-500">Featured</span>
                  )}
                  {!testimonial.is_active && (
                    <span className="text-xs px-2 py-1 rounded bg-gray-500">Inactive</span>
                  )}
                </div>
              </div>

              <div className="flex gap-1">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>

              <p className="text-sm italic">"{testimonial.content}"</p>

              <div className="flex gap-2 pt-3">
                <Button size="sm" variant="outline" onClick={() => handleEdit(testimonial)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(testimonial.id)}>
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

export default TestimonialsManagement;
