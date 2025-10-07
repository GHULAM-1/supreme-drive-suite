import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { Calendar, MapPin, Clock, Car, Shield, ArrowLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  cover_image_url: string;
  service_type: string;
  vehicle_used: string;
  location: string;
  event_date: string;
  duration: string;
  special_requirements: string;
  testimonial_quote: string | null;
  testimonial_author: string | null;
  price_range: string | null;
  gallery_images: any;
  is_featured: boolean;
}

const PortfolioDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<PortfolioItem[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrice, setShowPrice] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPortfolioItem();
    }
  }, [slug]);

  const fetchPortfolioItem = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setItem(data);

      // Fetch gallery images from portfolio_images table
      const { data: images } = await supabase
        .from("portfolio_images")
        .select("*")
        .eq("portfolio_id", data.id)
        .eq("is_visible", true)
        .eq("is_cover", false)
        .order("display_order", { ascending: true });

      setGalleryImages(images || []);

      // Fetch related items
      const { data: related } = await supabase
        .from("portfolio")
        .select("*")
        .eq("service_type", data.service_type)
        .eq("is_active", true)
        .neq("id", data.id)
        .limit(3);

      setRelatedItems(related || []);
    } catch (error) {
      console.error("Error fetching portfolio item:", error);
      navigate("/portfolio");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !item) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.title,
    description: item.summary,
    image: item.cover_image_url,
    datePublished: item.event_date,
    locationCreated: {
      "@type": "Place",
      name: item.location,
    },
  };

  return (
    <>
      <SEO
        title={item.title}
        description={item.summary}
        keywords={`${item.service_type}, ${item.location}, luxury chauffeur, executive transport`}
        canonical={`https://10055aaf-5ac9-4da5-a157-7c78ce8e9d2c.lovableproject.com/portfolio/${item.slug}`}
        schema={schema}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />

        <main className="flex-1">
          {/* Back Button */}
          <div className="container mx-auto px-4 py-6">
            <Button variant="ghost" onClick={() => navigate("/portfolio")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Portfolio
            </Button>
          </div>

          {/* Hero Section */}
          <section className="relative h-[60vh] min-h-[500px]">
            <img
              src={item.cover_image_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12">
              <Badge
                variant={item.service_type === "chauffeur" ? "default" : "secondary"}
                className="mb-4"
              >
                {item.service_type === "chauffeur" ? "Chauffeur Service" : "Close Protection"}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{item.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(item.event_date), "MMMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          </section>

          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Summary */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">{item.summary}</p>
                </div>

                {/* Special Requirements */}
                {item.special_requirements && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Service Details</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {item.special_requirements}
                    </p>
                  </div>
                )}

                {/* Gallery */}
                {galleryImages.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
                    <PortfolioGallery images={galleryImages.map(img => ({
                      url: img.image_url,
                      alt: img.alt_text,
                      caption: img.caption
                    }))} />
                  </div>
                )}

                {/* Testimonial */}
                {item.testimonial_quote && (
                  <Card className="bg-accent/5 border-accent/20">
                    <CardContent className="p-8">
                      <blockquote className="text-lg italic text-muted-foreground mb-4">
                        "{item.testimonial_quote}"
                      </blockquote>
                      {item.testimonial_author && (
                        <p className="text-sm font-medium">— {item.testimonial_author}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Facts */}
                <Card className="bg-card border-border/50">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Quick Facts</h3>
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        {item.service_type === "chauffeur" ? (
                          <Car className="w-5 h-5 text-primary mt-0.5" />
                        ) : (
                          <Shield className="w-5 h-5 text-primary mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium">Service</p>
                          <p className="text-sm text-muted-foreground">
                            {item.service_type === "chauffeur" ? "Chauffeur" : "Close Protection"}
                          </p>
                        </div>
                      </div>

                      {item.vehicle_used && (
                        <div className="flex items-start gap-3">
                          <Car className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Vehicle</p>
                            <p className="text-sm text-muted-foreground">{item.vehicle_used}</p>
                          </div>
                        </div>
                      )}

                      {item.duration && (
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Duration</p>
                            <p className="text-sm text-muted-foreground">{item.duration}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{item.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Date</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(item.event_date), "MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price Range Toggle */}
                    {item.price_range && (
                      <>
                        <Separator />
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPrice(!showPrice)}
                            className="w-full"
                          >
                            {showPrice ? "Hide" : "View"} Investment Range
                          </Button>
                          {showPrice && (
                            <p className="text-sm text-muted-foreground mt-3 text-center">
                              {item.price_range}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  {item.service_type === "chauffeur" ? (
                    <Button asChild className="w-full" size="lg">
                      <Link to="/chauffeur-services">
                        Book Your Journey
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="secondary" className="w-full" size="lg">
                      <Link to="/close-protection">
                        Request Consultation
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Related Items */}
            {relatedItems.length > 0 && (
              <section className="mt-20">
                <h2 className="text-3xl font-bold mb-8">Related Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relatedItems.map((relatedItem) => (
                    <PortfolioCard key={relatedItem.id} item={relatedItem} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PortfolioDetail;
