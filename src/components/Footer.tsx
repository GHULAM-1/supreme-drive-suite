import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-zinc-800">
      <div className="container mx-auto px-4 py-16">
        {/* Top Row - Brand Section */}
        <div className="mb-12 pb-12 border-b border-zinc-800">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-gradient-metal mb-4">
            Supreme Drive
          </h3>
          <p className="text-zinc-300 max-w-2xl">
            Luxury chauffeur and close protection services for discerning clients.
          </p>
        </div>

        {/* Middle Row - Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 pb-12 border-b border-zinc-800">
          {/* Services Column */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-lg">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/chauffeur-services" className="text-zinc-300 hover:text-yellow-400 transition-colors text-sm">
                  Chauffeur Services
                </Link>
              </li>
              <li>
                <Link to="/close-protection" className="text-zinc-300 hover:text-yellow-400 transition-colors text-sm">
                  Close Protection
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-zinc-300 hover:text-yellow-400 transition-colors text-sm">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-lg">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-zinc-300 hover:text-yellow-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-zinc-300 hover:text-yellow-400 transition-colors text-sm">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-zinc-300 hover:text-yellow-400 transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-lg">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <Phone className="w-4 h-4 text-yellow-400" />
                <a href="tel:08001234567" className="hover:text-yellow-400 transition-colors">
                  0800 123 4567
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <Mail className="w-4 h-4 text-yellow-400" />
                <a href="mailto:info@supremedrive.co.uk" className="hover:text-yellow-400 transition-colors">
                  info@supremedrive.co.uk
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <span>London, United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row - Legal Strip */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-400">
            © 2025 Supreme Drive Suite. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-sm text-zinc-400 hover:text-yellow-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-zinc-400 hover:text-yellow-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
