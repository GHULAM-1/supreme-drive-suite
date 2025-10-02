import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Clock, User, Car, Phone, Mail, FileText, Shield, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface JobDetail {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  pickup_time: string;
  passengers: number;
  luggage: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  status: string | null;
  driver_id: string | null;
  vehicle_id: string | null;
  total_price: number | null;
  additional_requirements: string | null;
  route_notes: string | null;
  internal_notes: string | null;
  is_long_drive: boolean | null;
  has_overnight_stop: boolean | null;
  distance_miles: number | null;
  duration_minutes: number | null;
  service_type: string | null;
  priority: string | null;
  protection_details: any;
  driver_name?: string;
  driver_phone?: string;
  driver_email?: string;
  vehicle_name?: string;
  vehicle_category?: string;
  vehicle_image?: string;
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeNotes, setRouteNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    if (id) loadJobDetails();
  }, [id]);

  const loadJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("job_details")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Ensure new fields are present even if view doesn't include them yet
      const jobData = {
        ...data,
        service_type: (data as any).service_type || "chauffeur",
        priority: (data as any).priority || "normal",
        protection_details: (data as any).protection_details || null,
      } as JobDetail;
      
      setJob(jobData);
      setRouteNotes(data.route_notes || "");
      setInternalNotes(data.internal_notes || "");
    } catch (error: any) {
      toast.error("Failed to load job details: " + error.message);
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          route_notes: routeNotes,
          internal_notes: internalNotes,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Notes saved successfully");
    } catch (error: any) {
      toast.error("Failed to save notes: " + error.message);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "new": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "confirmed": return "bg-green-500/20 text-green-300 border-green-500/30";
      case "in_progress": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "completed": return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "cancelled": return "bg-red-500/20 text-red-300 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!job) return <div className="p-8">Job not found</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold">Job Details</h1>
            <p className="text-muted-foreground">
              {format(new Date(job.pickup_date), "MMMM dd, yyyy")} at {job.pickup_time}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(job.status)}>
          {job.status || "new"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{job.customer_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${job.customer_email}`} className="text-accent hover:underline">
                  {job.customer_email || "N/A"}
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${job.customer_phone}`} className="text-accent hover:underline">
                  {job.customer_phone || "N/A"}
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Security Brief - for Close Protection jobs */}
        {job.service_type === "close_protection" && job.protection_details && (
          <Card className="p-6 border-amber-500/30 bg-amber-500/5">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Security Brief
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <p className="font-medium">{job.protection_details.service_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <Badge className={
                    job.protection_details.risk_level === "High" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                    job.protection_details.risk_level === "Medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                    "bg-green-500/20 text-green-400 border-green-500/30"
                  }>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {job.protection_details.risk_level}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">
                  {format(new Date(job.protection_details.date), "MMMM dd, yyyy")} at {job.protection_details.start_time}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{job.protection_details.duration_hours} hours</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Primary Location</p>
                <p className="font-medium">{job.protection_details.primary_location}</p>
              </div>
              {job.protection_details.secondary_location && (
                <div>
                  <p className="text-sm text-muted-foreground">Secondary Location</p>
                  <p className="font-medium">{job.protection_details.secondary_location}</p>
                </div>
              )}
              {job.protection_details.agents_required && (
                <div>
                  <p className="text-sm text-muted-foreground">Agents Required</p>
                  <p className="font-medium">{job.protection_details.agents_required}</p>
                </div>
              )}
              {job.protection_details.additional_notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Additional Notes</p>
                  <p className="font-medium whitespace-pre-wrap">{job.protection_details.additional_notes}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Trip Details - for Chauffeur jobs */}
        {job.service_type !== "close_protection" && (
          <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Trip Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Pickup</p>
              <p className="font-medium">{job.pickup_location}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dropoff</p>
              <p className="font-medium">{job.dropoff_location}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Passengers</p>
                <p className="font-medium">{job.passengers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Luggage</p>
                <p className="font-medium">{job.luggage}</p>
              </div>
            </div>
            {job.distance_miles && (
              <div>
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="font-medium">{job.distance_miles} miles</p>
              </div>
            )}
            {job.duration_minutes && (
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{Math.floor(job.duration_minutes / 60)}h {job.duration_minutes % 60}m</p>
              </div>
            )}
          </div>
        </Card>
        )}

        {/* Driver Assignment */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Assigned Driver
          </h3>
          {job.driver_name ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{job.driver_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <a href={`tel:${job.driver_phone}`} className="text-accent hover:underline">
                  {job.driver_phone}
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${job.driver_email}`} className="text-accent hover:underline">
                  {job.driver_email}
                </a>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No driver assigned</p>
          )}
        </Card>

        {/* Vehicle Assignment */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Car className="w-5 h-5" />
            Assigned Vehicle
          </h3>
          {job.vehicle_name ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium">{job.vehicle_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <Badge variant="outline">{job.vehicle_category}</Badge>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No vehicle assigned</p>
          )}
        </Card>

        {/* Price Breakdown */}
        <Card className="p-6 md:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Price Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Price</span>
              <span className="font-bold text-2xl">£{job.total_price?.toFixed(2) || "0.00"}</span>
            </div>
            {job.is_long_drive && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Long Drive</span>
                <span>Yes</span>
              </div>
            )}
            {job.has_overnight_stop && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overnight Stop</span>
                <span>Yes</span>
              </div>
            )}
          </div>
        </Card>
        )}

        {/* Additional Requirements */}
        {job.additional_requirements && (
          <Card className="p-6 md:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Additional Requirements</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{job.additional_requirements}</p>
          </Card>
        )}

        {/* Notes */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Route Notes
          </h3>
          <Textarea
            value={routeNotes}
            onChange={(e) => setRouteNotes(e.target.value)}
            placeholder="Add route-specific notes for the driver..."
            className="min-h-[150px]"
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Internal Notes
          </h3>
          <Textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Add internal notes (not visible to customer)..."
            className="min-h-[150px]"
          />
        </Card>

        <div className="md:col-span-2">
          <Button onClick={saveNotes} className="w-full">
            Save Notes
          </Button>
        </div>
      </div>
    </div>
  );
}
