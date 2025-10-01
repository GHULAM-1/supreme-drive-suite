import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

const FAQManagement = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "Booking",
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("faqs")
      .select("*")
      .order("display_order");
    
    if (data) setFaqs(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editing) {
      const { error } = await supabase
        .from("faqs")
        .update(formData)
        .eq("id", editing.id);
      
      if (!error) toast.success("FAQ updated");
    } else {
      const { error } = await supabase.from("faqs").insert(formData);
      if (!error) toast.success("FAQ created");
    }

    setDialogOpen(false);
    setEditing(null);
    setFormData({ question: "", answer: "", category: "Booking", display_order: 0, is_active: true });
    loadFAQs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (!error) {
      toast.success("FAQ deleted");
      loadFAQs();
    }
  };

  const handleEdit = (faq: any) => {
    setEditing(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      display_order: faq.display_order,
      is_active: faq.is_active
    });
    setDialogOpen(true);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-gradient-metal">FAQ Management</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-accent shadow-glow" onClick={() => setEditing(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Add"} FAQ</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Booking">Booking</SelectItem>
                      <SelectItem value="Pricing">Pricing</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="Cancellations">Cancellations</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="gradient-accent shadow-glow">
                  {editing ? "Update" : "Create"} FAQ
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {faqs.map((faq) => (
          <Card key={faq.id} className="p-6 shadow-metal">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded bg-primary/20">{faq.category}</span>
                    {!faq.is_active && <span className="text-xs px-2 py-1 rounded bg-gray-500">Inactive</span>}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  <p className="text-xs text-muted-foreground mt-2">Order: {faq.display_order}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(faq)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(faq.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FAQManagement;
