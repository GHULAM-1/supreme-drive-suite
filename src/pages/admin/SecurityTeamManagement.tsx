import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SecurityTeamMember {
  id: string;
  name: string;
  title: string;
  specializations: string[] | null;
  bio: string | null;
  profile_image_url: string | null;
  phone: string | null;
  email: string | null;
  certifications: string[] | null;
  experience_years: number | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function SecurityTeamManagement() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<SecurityTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadSecurityTeam();
  }, [statusFilter, featuredFilter]);

  const loadSecurityTeam = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("security_team")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("is_active", statusFilter === "active");
      }

      if (featuredFilter !== "all") {
        query = query.eq("is_featured", featuredFilter === "featured");
      }

      const { data, error } = await query;

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.specializations &&
      member.specializations.some(spec =>
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      ))
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(new Set(filteredMembers.map((member) => member.id)));
    } else {
      setSelectedMembers(new Set());
    }
  };

  const handleSelectMember = (memberId: string, checked: boolean) => {
    const newSelected = new Set(selectedMembers);
    if (checked) {
      newSelected.add(memberId);
    } else {
      newSelected.delete(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleBulkActivate = async () => {
    try {
      const { error } = await supabase
        .from("security_team")
        .update({ is_active: true })
        .in("id", Array.from(selectedMembers));

      if (error) throw error;

      toast({
        title: "Success",
        description: `Activated ${selectedMembers.size} members`,
      });
      setSelectedMembers(new Set());
      loadSecurityTeam();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const { error } = await supabase
        .from("security_team")
        .update({ is_active: false })
        .in("id", Array.from(selectedMembers));

      if (error) throw error;

      toast({
        title: "Success",
        description: `Deactivated ${selectedMembers.size} members`,
      });
      setSelectedMembers(new Set());
      loadSecurityTeam();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from("security_team")
        .delete()
        .in("id", Array.from(selectedMembers));

      if (error) throw error;

      toast({
        title: "Success",
        description: `Deleted ${selectedMembers.size} members`,
      });
      setSelectedMembers(new Set());
      loadSecurityTeam();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;

    try {
      // Get member data to delete profile image if exists
      const { data: member } = await supabase
        .from("security_team")
        .select("profile_image_url")
        .eq("id", memberToDelete)
        .single();

      // Delete profile image from storage if exists
      if (member?.profile_image_url) {
        const urlParts = member.profile_image_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        await supabase.storage
          .from("security-team-images")
          .remove([fileName]);
      }

      // Delete member record
      const { error } = await supabase
        .from("security_team")
        .delete()
        .eq("id", memberToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member deleted",
      });
      loadSecurityTeam();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const toggleFeatured = async (memberId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("security_team")
        .update({ is_featured: !currentValue })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Member ${!currentValue ? "featured" : "unfeatured"}`,
      });
      loadSecurityTeam();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient-metal mb-2">
            Security Team Management
          </h1>
          <p className="text-muted-foreground">
            Manage close protection personnel and security staff
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => navigate("/admin/security-team/new")}
                className="shadow-glow hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add a new security team member</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, title, or specialisations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="not-featured">Not Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedMembers.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedMembers.size} members selected
          </span>
          <Button size="sm" variant="outline" onClick={handleBulkActivate}>
            <Eye className="mr-2 h-4 w-4" />
            Activate
          </Button>
          <Button size="sm" variant="outline" onClick={handleBulkDeactivate}>
            <EyeOff className="mr-2 h-4 w-4" />
            Deactivate
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              if (selectedMembers.size === 1) {
                setMemberToDelete(Array.from(selectedMembers)[0]);
                setDeleteDialogOpen(true);
              } else {
                handleBulkDelete();
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    filteredMembers.length > 0 &&
                    selectedMembers.size === filteredMembers.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-20">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Specializations</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                    <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </>
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-16">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="rounded-full bg-muted/50 p-6">
                      <ShieldCheck className="w-16 h-16 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-display font-semibold">No team members yet</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Add your security personnel to showcase your professional team
                    </p>
                    <Button
                      onClick={() => navigate("/admin/security-team/new")}
                      className="gradient-accent shadow-glow mt-2"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Team Member
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member, index) => (
                <TableRow
                  key={member.id}
                  className="hover:bg-accent/5 transition-all duration-300 animate-fade-in group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedMembers.has(member.id)}
                      onCheckedChange={(checked) =>
                        handleSelectMember(member.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {member.profile_image_url ? (
                      <img
                        src={member.profile_image_url}
                        alt={member.name}
                        className="w-16 h-16 object-cover rounded-md ring-2 ring-accent/20"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-accent" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {member.is_featured && (
                        <Star className="h-4 w-4 text-accent fill-accent" />
                      )}
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {member.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.specializations && member.specializations.length > 0 ? (
                        member.specializations.slice(0, 2).map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {spec.replace(/_/g, " ")}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                      {member.specializations && member.specializations.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.specializations.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.experience_years ? (
                      <span className="text-sm">
                        {member.experience_years} years
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={member.is_active ? "default" : "secondary"}
                      className={member.is_active
                        ? "shadow-[0_0_20px_rgba(255,215,0,0.2)] group-hover:shadow-[0_0_25px_rgba(255,215,0,0.3)] transition-all"
                        : ""
                      }
                    >
                      {member.is_active ? (
                        <>
                          <span className="mr-1">✓</span>
                          Active
                        </>
                      ) : (
                        "Inactive"
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleFeatured(member.id, member.is_featured)}
                              className={`hover:bg-accent/10 transition-all ${
                                member.is_featured ? "text-accent" : ""
                              }`}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  member.is_featured ? "fill-accent" : ""
                                }`}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{member.is_featured ? "Unfeature" : "Feature"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/admin/security-team/edit/${member.id}`)}
                              className="hover:bg-accent/10 hover:text-accent transition-all"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Edit</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setMemberToDelete(member.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="hover:bg-destructive/10 hover:text-destructive transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Delete</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              team member and their profile image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
