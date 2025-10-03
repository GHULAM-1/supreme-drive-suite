import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PortfolioFilters } from "@/components/portfolio/PortfolioFilters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  is_featured: boolean;
}

const ITEMS_PER_PAGE = 9;

const Portfolio = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("event_date", { ascending: false });

      if (error) throw error;
      setPortfolioItems(data || []);
      setFilteredItems(data || []);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: {
    serviceType: string;
    vehicle: string;
    location: string;
    year: string;
    search: string;
  }) => {
    let filtered = [...portfolioItems];

    if (filters.serviceType !== "all") {
      filtered = filtered.filter((item) => item.service_type === filters.serviceType);
    }

    if (filters.vehicle) {
      filtered = filtered.filter((item) =>
        item.vehicle_used?.toLowerCase().includes(filters.vehicle.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter((item) =>
        item.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.year && filters.year !== "all") {
      filtered = filtered.filter((item) =>
        item.event_date.startsWith(filters.year)
      );
    }

    if (filters.search) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.summary.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <>
      <SEO
        title="Portfolio"
        description="Explore our exclusive collection of chauffeur services and close protection case studies. Premium transportation experiences across the UK."
        keywords="luxury chauffeur portfolio, close protection case studies, executive transportation, VIP security services"
        canonical="https://10055aaf-5ac9-4da5-a157-7c78ce8e9d2c.lovableproject.com/portfolio"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative py-20 border-b border-border/50">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
            <div className="container mx-auto px-4 relative">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Our Portfolio
                </h1>
                <p className="text-lg text-muted-foreground">
                  Exceptional journeys and secure operations that define excellence
                </p>
              </div>
            </div>
          </section>

          {/* Filters */}
          <section className="py-8 border-b border-border/50">
            <div className="container mx-auto px-4">
              <PortfolioFilters onFilter={handleFilter} items={portfolioItems} />
            </div>
          </section>

          {/* Portfolio Grid */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-64 w-full rounded-lg" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">
                    No portfolio items match your filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedItems.map((item) => (
                      <PortfolioCard key={item.id} item={item} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink
                                onClick={() => setCurrentPage(i + 1)}
                                isActive={currentPage === i + 1}
                                className="cursor-pointer"
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Portfolio;
