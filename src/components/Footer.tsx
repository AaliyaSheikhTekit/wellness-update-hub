import { Leaf, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const details = [
    "Ikshā Naturopathy, Empire Market Place",
    "Infront of Bypass, next to Empire Estate",
    "Sahara City Homes, Indore, Deoguradia",
    "Madhya Pradesh - 452016",
    "--------------------------------",
   " C-8, C-9 AND C-10 EMPIRE MARKET PALACE BICHOLI MARDANA INDORE Dist.",
"INDORE M.P. 452016",
  ];

  return (
    <footer className="bg-foreground text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand + About */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-semibold">Iksha</span>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              Where traditional naturopathic wisdom meets modern wellness
              practices. Your journey to natural healing starts here.
            </p>
            {/* Socials */}
            <div className="flex space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 wellness-transition cursor-pointer">
                <span className="text-sm">f</span>
              </div>
              <a
                href="https://www.instagram.com/iksha_naturopathy/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 wellness-transition cursor-pointer">
                  <span className="text-sm">ig</span>
                </div>
              </a>
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 wellness-transition cursor-pointer">
                <span className="text-sm">tw</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Services</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition"
                >
                  Detox Therapy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition"
                >
                  Pain Management
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition"
                >
                  Stress Management
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition"
                >
                  Complete Care Program
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-primary-foreground/80 hover:text-primary-foreground wellness-transition"
                >
                  Herbal Consultations
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-primary-foreground/60 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground">+91 9343922950 </p>
                  <p className="text-primary-foreground/80 text-sm">
                    Emergency: 24/7
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary-foreground/60 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground">
                    admin@ikshanaturopathy.com
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-foreground/60 mt-1 flex-shrink-0" />
                <div>
                  {details.map((line, idx) => (
                    <p
                      key={idx}
                      className={`text-primary-foreground ${
                        idx !== 0
                          ? "text-sm text-primary-foreground/80"
                          : ""
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary-foreground/60 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground">
                    Tuseday: 9:00 AM - 6:00 PM
                  </p>
                  <p className="text-primary-foreground/80 text-sm">
                    Sunday: 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>

           
          </div>
           {/* Google Map Embed */}
            <div className="mt-6 rounded-lg overflow-hidden shadow-lg">
              <iframe
                title="Iksha Naturopathy Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3681.543650989964!2d75.86045637531507!3d22.671579479423132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39631d8a1bbdd1af%3A0xb64b2edee8c91c0d!2sSahara%20City%20Homes%2C%20Indore%2C%20Madhya%20Pradesh%20452016!5e0!3m2!1sen!2sin!4v1695376489181!5m2!1sen!2sin"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 Iksha Naturopathy. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/terms-and-conditions"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors underline"
            >
              Terms & Conditions
            </Link>
            <Link
              to="/privacy-policy"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
