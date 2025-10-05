import { Link, useLocation } from "react-router-dom";
import { Menu, Phone, X, Lock, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const navLinks = [{
    path: "/",
    label: "Home"
  }, {
    path: "/chauffeur-services",
    label: "Chauffeur"
  }, {
    path: "/close-protection",
    label: "Close Protection"
  }, {
    path: "/portfolio",
    label: "Portfolio"
  }, {
    path: "/pricing",
    label: "Pricing"
  }, {
    path: "/about",
    label: "About"
  }, {
    path: "/testimonials",
    label: "Testimonials"
  }, {
    path: "/contact",
    label: "Contact"
  }];
  return <nav className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-metal transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between gap-8">
          {/* Logo/Branding - Left */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <Shield className="w-6 h-6 text-foreground transition-colors" strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-xl lg:text-2xl font-luxury font-semibold text-gradient-silver leading-tight whitespace-nowrap tracking-wide">
                Travel in Supreme Style
              </span>
              <div className="relative h-px w-full mt-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent" />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden xl:flex items-center justify-center flex-1 space-x-8">
            {navLinks.map(link => <Link key={link.path} to={link.path} className={`text-sm font-medium transition-colors hover:text-primary px-2 whitespace-nowrap ${isActive(link.path) ? "text-primary" : "text-muted-foreground"}`}>
                {link.label}
              </Link>)}
          </div>

          {/* Right-side Action Area */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Lock className="w-4 h-4 mr-1.5" />
                <span className="text-xs">Admin</span>
              </Button>
            </Link>
            <a href="tel:08001234567">
              <Button className="gradient-accent shadow-glow text-sm font-semibold">
                <Phone className="w-4 h-4 mr-2" />
                0800 123 4567
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-foreground">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && <div className="lg:hidden pb-4 pt-4 space-y-3 border-t border-border/50 mt-4">
            {navLinks.map(link => <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className={`block py-2.5 text-sm font-medium transition-colors ${isActive(link.path) ? "text-primary" : "text-muted-foreground"}`}>
                {link.label}
              </Link>)}
            <div className="pt-4 space-y-3">
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
              </Link>
              <a href="tel:08001234567">
                <Button className="w-full gradient-accent shadow-glow">
                  <Phone className="w-4 h-4 mr-2" />
                  0800 123 4567
                </Button>
              </a>
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navigation;