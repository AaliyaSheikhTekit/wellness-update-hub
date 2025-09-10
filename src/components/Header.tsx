import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import IkshaLogo from "../assets/iksha_logo.png"; // Ensure you have the logo image in the specified path
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background backdrop-blur-lg border-b border-border/50 wellness-transition">
      <div className="container mx-auto px-2 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
            src={IkshaLogo}
            alt="Iksha Naturopathy Logo"
            className="h-16 w-auto object-contain" // larger height
          />
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#home"
            className="text-foreground hover:text-wellness-sage wellness-transition"
          >
            Home
          </a>
          <a
            href="#services"
            className="text-foreground hover:text-wellness-sage wellness-transition"
          >
            Services
          </a>
          <a
            href="#about"
            className="text-foreground hover:text-wellness-sage wellness-transition"
          >
            About
          </a>
          <a
            href="#contact"
            className="text-foreground hover:text-wellness-sage wellness-transition"
          >
            Contact
          </a>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="wellnessOutline"
            size="lg"
            asChild
            className="btn-primary hover:bg-foreground/10"
          >
            <a href="/login">Login</a>
          </Button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border/50">
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            <a
              href="#home"
              className="text-foreground hover:text-wellness-sage wellness-transition"
            >
              Home
            </a>
            <a
              href="#services"
              className="text-foreground hover:text-wellness-sage wellness-transition"
            >
              Services
            </a>
            <a
              href="#about"
              className="text-foreground hover:text-wellness-sage wellness-transition"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-foreground hover:text-wellness-sage wellness-transition"
            >
              Contact
            </a>
            <div className="flex flex-col space-y-3 mt-4">
              <Button variant="wellnessOutline" size="lg" asChild>
                <a href="/login">Login</a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
