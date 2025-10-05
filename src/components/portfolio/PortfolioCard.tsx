import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Star, Shield } from "lucide-react";
import { format } from "date-fns";

interface PortfolioCardProps {
  item: {
    slug: string;
    title: string;
    summary: string;
    cover_image_url: string;
    service_type: string;
    location: string;
    event_date: string;
    is_featured: boolean;
    is_confidential?: boolean;
  };
}

export const PortfolioCard = ({ item }: PortfolioCardProps) => {
  return (
    <Link to={`/portfolio/${item.slug}`}>
      <Card className="group overflow-hidden transition-all duration-500 hover:shadow-[0_10px_40px_rgba(255,215,0,0.25)] hover:shadow-glow hover:-translate-y-2 hover:border-accent/50 bg-card border-border/50">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={item.cover_image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />
          
          {/* Confidential Badge */}
          {item.is_confidential && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-secondary/80 backdrop-blur-sm text-secondary-foreground border-border gap-1">
                <Shield className="w-3 h-3" />
                Confidential
              </Badge>
            </div>
          )}

          {/* Featured Badge */}
          {item.is_featured && !item.is_confidential && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-accent/90 backdrop-blur-sm text-accent-foreground border-accent-foreground/20 gap-1 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </Badge>
            </div>
          )}

          {/* Service Type Badge */}
          <div className="absolute top-4 left-4">
            <Badge 
              variant={item.service_type === "chauffeur" ? "default" : "secondary"}
              className="backdrop-blur-sm"
            >
              {item.service_type === "chauffeur" ? "Chauffeur" : "Close Protection"}
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <h3 className="text-xl font-display font-semibold group-hover:text-accent transition-colors duration-300 line-clamp-2">
            {item.title}
          </h3>
          
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {item.is_confidential ? "Details available upon request" : item.summary}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50 pt-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{item.is_confidential ? "Private Location" : item.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(item.event_date), "MMM yyyy")}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
