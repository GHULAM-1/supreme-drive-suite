import { Link, useLocation } from "react-router-dom";
import { Menu, Phone, X, Lock, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const navLinks = [{
    path: "/",
    label: "Home"
  }, {
    path: "/chauffeur-services",
    label: "Chauffeur Services"
  }, {
    path: "/close-protection",
    label: "Close Protection"
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
    path: "/faq",
    label: "FAQ"
  }, {
    path: "/contact",
    label: "Contact"
  }];

  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-metal">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-display font-bold text-gradient-metal">Travel in Supreme Style</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map(link => <Link key={link.path} to={link.path} className={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.path) ? "text-primary" : "text-muted-foreground"}`}>
                {link.label}
              </Link>)}
            <Link to="/auth">
              <Button variant="outline" size="sm">
                <Lock className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
            <a href="tel:08001234567">
              <Button className="gradient-accent shadow-glow">
                <Phone className="w-4 h-4 mr-2" />
                0800 123 4567
              </Button>
            </a>
            <a href="https://wa.me/447700900000" target="_blank" rel="noopener noreferrer" className="lg:flex hidden">
              <Button variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-foreground">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && <div className="lg:hidden pb-4 space-y-3">
            {navLinks.map(link => <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className={`block py-2 text-sm font-medium transition-colors ${isActive(link.path) ? "text-primary" : "text-muted-foreground"}`}>
                {link.label}
              </Link>)}
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
          </div>}
      </div>
    </nav>;
};
export default Navigation;