import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Calendar,
  Leaf
} from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    // Handle form submission here
  };

 const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Our Clinic",
    details: [
      "Ikshā Naturopathy, Empire Market Place",
      "Infront of Bypass, next to Empire Estate",
      "Sahara City Homes, Indore, Deoguradia",
      "Madhya Pradesh - 452016",
    ],
    color: "text-wellness-sage",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+91 98765 43210", "+91 98765 43211"],
    color: "text-wellness-sage",
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["info@iksha.com", "consultation@iksha.com"],
    color: "text-wellness-sage",
  },
  {
    icon: Clock,
    title: "Clinic Hours",
    details: ["Mon - Sat: 9:00 AM - 7:00 PM", "Sunday: 10:00 AM - 4:00 PM"],
    color: "text-wellness-sage",
  },
];


  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-wellness-sage-light/20 border border-wellness-sage/30 mb-6">
            <Leaf className="w-4 h-4 text-wellness-sage mr-2" />
            <span className="text-sm font-medium text-wellness-sage">Get In Touch</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Start Your Healing Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to experience natural wellness? Contact us to schedule your consultation
            and take the first step towards optimal health.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="font-display text-3xl font-bold text-foreground mb-6">
                We're Here to Help
              </h3>
              <div className="grid gap-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <Card key={index} className="wellness-card-gradient border-0 wellness-shadow-soft">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`${info.color} mt-1`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">{info.title}</h4>
                            {info.details.map((detail, idx) => (
                              <p key={idx} className="text-muted-foreground">{detail}</p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Quick Booking Card */}
            <Card className="wellness-card-gradient border-0 wellness-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-wellness-sage" />
                  <span>Quick Appointment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Need immediate assistance? Call us directly for urgent consultations
                  or emergency naturopathic guidance.
                </p>
                <Button variant="wellness" size="lg" className="w-full bg-foreground hover:bg-foreground/90">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now: +91 98765 43210
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="wellness-card-gradient border-0 wellness-shadow">
            <CardHeader>
              <CardTitle className="font-display text-3xl font-bold text-foreground">
                Send Us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">Service of Interest</Label>
                    <Input
                      id="service"
                      name="service"
                      type="text"
                      placeholder="e.g., Detox Therapy"
                      value={formData.service}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your health concerns or questions..."
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" variant="wellness" size="lg" className="w-full bg-foreground hover:bg-foreground/90">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We'll get back to you within 24 hours. For urgent matters, please call us directly.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;