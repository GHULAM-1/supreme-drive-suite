import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Star, MessageSquareQuote, GripVertical, Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Testimonial {
  id: string;
  customer_name: string;
  customer_title: string;
  content: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const ITEMS_PER_PAGE = 12;
const MIN_CHARS = 30;
const MAX_CHARS = 600;
const MIN_NAME = 2;
const MAX_NAME = 80;
const MAX_TITLE = 80;

const SortableTestimonialCard = ({ testimonial, onEdit, onDelete, onToggleActive, onToggleFeatured }: {
  testimonial: Testimonial;
  onEdit: (t: Testimonial) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, value: boolean) => void;
  onToggleFeatured: (id: string, value: boolean) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: testimonial.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-6 shadow-metal hover:shadow-glow transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      <div className="space-y-3 flex-1">
        <div className="flex justify-between items-start gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
            aria-label="Drag to reorder testimonial"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground hover:text-accent transition-colors" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-display font-bold text-gradient-silver">{testimonial.customer_name}</h3>
            {testimonial.customer_title && (
              <p className="text-sm text-muted-foreground">{testimonial.customer_title}</p>
            )}
          </div>

          <div className="flex gap-1.5 flex-wrap justify-end">
            {testimonial.is_featured && (
              <Badge className="bg-accent/20 text-accent border-accent/30">Featured</Badge>
            )}
            {!testimonial.is_active && (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
        </div>

        <div className="flex gap-1" aria-label={`${testimonial.rating} out of 5 stars`}>
          {[...Array(testimonial.rating || 5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-accent text-accent" aria-hidden="true" />
          ))}
        </div>

        <p className="text-sm italic text-foreground/90 line-clamp-5" title={testimonial.content}>
          "{testimonial.content}"
        </p>

        <div className="flex items-center gap-4 pt-3 flex-wrap border-t border-border/50">
          <div className="flex items-center gap-2">
            <Switch
              checked={testimonial.is_active}
              onCheckedChange={(checked) => onToggleActive(testimonial.id, checked)}
              aria-label={`Toggle active status for ${testimonial.customer_name}'s testimonial`}
            />
            <Label className="text-xs text-muted-foreground">Active</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={testimonial.is_featured}
              onCheckedChange={(checked) => onToggleFeatured(testimonial.id, checked)}
              aria-label={`Toggle featured status for ${testimonial.customer_name}'s testimonial`}
            />
            <Label className="text-xs text-muted-foreground">Featured</Label>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(testimonial)}
              aria-label={`Edit testimonial for ${testimonial.customer_name}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(testimonial.id)}
              aria-label={`Delete testimonial for ${testimonial.customer_name}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "featured">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "display" | "rating">("display");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_title: "",
    content: "",
    rating: 5,
    is_featured: false,
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Removed auto-reload on mount to preserve optimistic updates

  const loadTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast.error("Failed to load testimonials");
    } else {
      setTestimonials(data || []);
    }
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = testimonials.findIndex((t) => t.id === active.id);
    const newIndex = testimonials.findIndex((t) => t.id === over.id);

    const newOrder = arrayMove(testimonials, oldIndex, newIndex);
    setTestimonials(newOrder);

    // Update display_order for all affected items
    const updates = newOrder.map((item, index) => ({
      id: item.id,
      display_order: index,
    }));

    try {
      for (const update of updates) {
        await supabase
          .from("testimonials")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
      }
      toast.success("Order updated");
    } catch (error) {
      toast.error("Couldn't save changes, please try again");
      loadTestimonials(); // Rollback
    }
  };

  const handleToggleActive = async (id: string, value: boolean) => {
    const oldTestimonials = [...testimonials];
    setTestimonials(testimonials.map(t => t.id === id ? { ...t, is_active: value } : t));

    const { error } = await supabase
      .from("testimonials")
      .update({ is_active: value })
      .eq("id", id);

    if (error) {
      toast.error("Couldn't save changes, please try again");
      setTestimonials(oldTestimonials);
    }
  };

  const handleToggleFeatured = async (id: string, value: boolean) => {
    const oldTestimonials = [...testimonials];
    setTestimonials(testimonials.map(t => t.id === id ? { ...t, is_featured: value } : t));

    const { error } = await supabase
      .from("testimonials")
      .update({ is_featured: value })
      .eq("id", id);

    if (error) {
      toast.error("Couldn't save changes, please try again");
      setTestimonials(oldTestimonials);
    }
  };

  const isFormValid = useMemo(() => {
    const nameValid = formData.customer_name.trim().length >= MIN_NAME && formData.customer_name.trim().length <= MAX_NAME;
    const titleValid = formData.customer_title.length <= MAX_TITLE;
    const contentValid = formData.content.trim().length >= MIN_CHARS && formData.content.trim().length <= MAX_CHARS;
    return nameValid && titleValid && contentValid;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please check all fields and try again");
      return;
    }

    if (editingTestimonial) {
      const { data, error } = await supabase
        .from("testimonials")
        .update(formData)
        .eq("id", editingTestimonial.id)
        .select()
        .single();

      if (error) {
        toast.error("Failed to update testimonial");
        return;
      }
      
      // Optimistic UI update
      setTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? data : t));
      toast.success("Testimonial updated");
    } else {
      const maxOrder = testimonials.reduce((max, t) => Math.max(max, t.display_order || 0), 0);
      const { data, error } = await supabase
        .from("testimonials")
        .insert({ ...formData, display_order: maxOrder + 1 })
        .select()
        .single();

      if (error) {
        toast.error("Failed to create testimonial");
        return;
      }
      
      // Optimistic UI update
      setTestimonials([...testimonials, data]);
      toast.success("Testimonial added and visible on website");
    }

    setDialogOpen(false);
    resetForm();
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const { error } = await supabase.from("testimonials").delete().eq("id", deletingId);

    if (error) {
      toast.error("Failed to delete testimonial");
      return;
    }

    toast.success("Testimonial deleted");
    setDeleteDialogOpen(false);
    setDeletingId(null);
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

  const filteredAndSortedTestimonials = useMemo(() => {
    let result = [...testimonials];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.customer_name.toLowerCase().includes(query) ||
          t.customer_title?.toLowerCase().includes(query) ||
          t.content.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus === "active") {
      result = result.filter((t) => t.is_active);
    } else if (filterStatus === "inactive") {
      result = result.filter((t) => !t.is_active);
    } else if (filterStatus === "featured") {
      result = result.filter((t) => t.is_featured);
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else {
      result.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }

    return result;
  }, [testimonials, searchQuery, filterStatus, sortBy]);

  const paginatedTestimonials = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTestimonials.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedTestimonials, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedTestimonials.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const charCount = formData.content.length;
  const nameLength = formData.customer_name.trim().length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient-metal mb-2">Testimonials Management</h1>
          <p className="text-muted-foreground">
            Manage client testimonials displayed across the website
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={loadTestimonials} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Refresh
          </Button>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-accent shadow-glow" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    maxLength={MAX_NAME}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {nameLength}/{MAX_NAME} characters
                    {nameLength < MIN_NAME && nameLength > 0 && (
                      <span className="text-destructive ml-2">Minimum {MIN_NAME} characters</span>
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title/Company</Label>
                  <Input
                    id="title"
                    value={formData.customer_title}
                    onChange={(e) => setFormData({ ...formData, customer_title: e.target.value })}
                    placeholder="e.g., CEO, Morrison Enterprises"
                    maxLength={MAX_TITLE}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.customer_title.length}/{MAX_TITLE} characters
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  Testimonial Content <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  maxLength={MAX_CHARS}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {charCount}/{MAX_CHARS} characters
                  {charCount < MIN_CHARS && charCount > 0 && (
                    <span className="text-destructive ml-2">Minimum {MIN_CHARS} characters</span>
                  )}
                  {charCount >= MIN_CHARS && charCount <= MAX_CHARS && (
                    <span className="text-accent ml-2">✓ Valid length</span>
                  )}
                </p>
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

              <div className="flex items-center gap-6">
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

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="gradient-accent shadow-glow"
                  disabled={!isFormValid}
                >
                  {editingTestimonial ? "Save Changes" : "Create Testimonial"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-card/50 p-4 rounded-lg border border-border/50">
        <div className="flex items-center gap-2 flex-1 min-w-[250px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, quote…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Button
            size="sm"
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filterStatus === "active" ? "default" : "outline"}
            onClick={() => setFilterStatus("active")}
          >
            Active
          </Button>
          <Button
            size="sm"
            variant={filterStatus === "inactive" ? "default" : "outline"}
            onClick={() => setFilterStatus("inactive")}
          >
            Inactive
          </Button>
          <Button
            size="sm"
            variant={filterStatus === "featured" ? "default" : "outline"}
            onClick={() => setFilterStatus("featured")}
          >
            Featured
          </Button>

          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="display">Display Order</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="rating">Rating ↓</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : paginatedTestimonials.length === 0 ? (
        <Card className="p-12 text-center shadow-metal">
          <MessageSquareQuote className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-display font-bold mb-2">No testimonials yet</h3>
          <p className="text-muted-foreground mb-6">
            Add your first testimonial to showcase trust and build credibility
          </p>
          <Button className="gradient-accent shadow-glow" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
        </Card>
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={paginatedTestimonials.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="grid md:grid-cols-2 gap-6">
                {paginatedTestimonials.map((testimonial) => (
                  <SortableTestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    onEdit={handleEdit}
                    onDelete={confirmDelete}
                    onToggleActive={handleToggleActive}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} • {filteredAndSortedTestimonials.length} testimonial{filteredAndSortedTestimonials.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The testimonial will be removed from the website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestimonialsManagement;
