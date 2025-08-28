import { Leaf, Phone, Mail, MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-wellness-sage text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-semibold">Iksha</span>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              Where traditional naturopathic wisdom meets modern wellness practices. Your journey to natural healing starts here.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 wellness-transition cursor-pointer">
                <span className="text-sm">f</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 wellness-transition cursor-pointer">
                <span className="text-sm">ig</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 wellness-transition cursor-pointer">
                <span className="text-sm">tw</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Services</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition">Detox Therapy</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition">Pain Management</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition">Stress Management</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition">Complete Care Program</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition">Herbal Consultations</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition">Home</a></li>
              <li><a href="#services" className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition">Services</a></li>
              <li><a href="#about" className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition">About Us</a></li>
              <li><a href="#contact" className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition">Contact</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition">Testimonials</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-primary-foreground/60 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground">+91 98765 43210</p>
                  <p className="text-primary-foreground/80 text-sm">Emergency: 24/7</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary-foreground/60 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground">info@iksha.com</p>
                  <p className="text-primary-foreground/80 text-sm">consultation@iksha.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-foreground/60 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground">123 Wellness Street</p>
                  <p className="text-primary-foreground/80 text-sm">Health District, City - 400001</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary-foreground/60 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground">Mon - Sat: 9:00 AM - 7:00 PM</p>
                  <p className="text-primary-foreground/80 text-sm">Sun: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 Iksha Naturopathy. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm wellness-transition">Privacy Policy</a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm wellness-transition">Terms of Service</a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm wellness-transition">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;