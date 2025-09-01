import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Clock, DollarSign, ArrowRight } from "lucide-react";
import treatmentImage from "@/assets/naturopathy-treatment.jpg";

const Services = () => {
  const services = [
    {
      title: "Detox Therapy",
      description: "Cleanse your body naturally with our comprehensive detoxification programs using herbal remedies and lifestyle modifications.",
      duration: "4-6 weeks",
      sessionTime: "45-60 minutes per session",
      price: "₹12,000",
      icon: "🌿"
    },
    {
      title: "Pain Management",
      description: "Natural pain relief through therapeutic treatments, herbal medicines, and holistic approaches without dependency on synthetic drugs.",
      duration: "2-8 weeks",
      sessionTime: "30-45 minutes per session",
      price: "₹8,000",
      icon: "🌱"
    },
    {
      title: "Stress Management",
      description: "Restore mental balance and emotional wellness through natural stress relief techniques and mindfulness practices.",
      duration: "6-12 weeks",
      sessionTime: "60-75 minutes per session",
      price: "₹10,000",
      icon: "🧘"
    },
    {
      title: "Iksha Complete Care",
      description: "Comprehensive wellness program combining all our services for complete mind-body-spirit transformation and optimal health.",
      duration: "12-16 weeks",
      sessionTime: "90-120 minutes per session",
      price: "₹25,000",
      icon: "✨"
    }
  ];

  return (
    <section id="services" className="py-20 bg-wellness-beige-light/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-wellness-sage-light/20 border border-wellness-sage/30 mb-6">
            <span className="text-sm font-medium text-wellness-sage">Our Services</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Natural Healing Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive range of naturopathic treatments designed to address your unique health needs and restore optimal wellness naturally.
          </p>
        </div>

        <div className="mb-16 px-4 sm:px-8 lg:px-16">
          <Carousel className="w-full max-w-6xl mx-auto">
            <CarouselContent className="-ml-4">
              {services.map((service, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/2">
                  <Card className="p-8 h-full wellness-card-gradient wellness-shadow-soft hover:wellness-shadow wellness-transition border-0">
                    <div className="flex items-start justify-between mb-6">
                      <div className="text-4xl mb-4">{service.icon}</div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center justify-end mb-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {service.duration}
                        </div>
                        <div>{service.sessionTime}</div>
                      </div>
                    </div>
                    
                    <h3 className="font-display text-2xl font-semibold text-foreground mb-4">
                      {service.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      {/* <div className="flex items-center text-wellness-sage font-semibold">
                        <DollarSign className="w-5 h-5 mr-1" />
                        <span className="text-2xl font-bold">{service.price}</span>
                      </div> */}
                      <Button 
                        variant="wellnessOutline" 
                        className="wellness-spring"
                        onClick={() => {
                          // Scroll to contact section for booking
                          const contactSection = document.getElementById('contact');
                          contactSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        View Details & Book
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src={treatmentImage} 
              alt="Natural naturopathy treatments" 
              className="rounded-2xl wellness-shadow object-cover w-full h-96"
            />
          </div>
          <div className="space-y-6">
            <h3 className="font-display text-3xl font-bold text-foreground">
              Why Choose Natural Healing?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 rounded-full bg-wellness-sage flex-shrink-0 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">No Side Effects</h4>
                  <p className="text-muted-foreground">Natural treatments work with your body's healing mechanisms</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 rounded-full bg-wellness-sage flex-shrink-0 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Holistic Approach</h4>
                  <p className="text-muted-foreground">Address root causes, not just symptoms</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 rounded-full bg-wellness-sage flex-shrink-0 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Personalized Care</h4>
                  <p className="text-muted-foreground">Treatments tailored to your unique constitution and needs</p>
                </div>
              </div>
            </div>
            <Button 
              variant="wellness" 
              size="lg" 
              className="mt-8"
              onClick={() => {
                // Scroll to contact section for consultation
                const contactSection = document.getElementById('contact');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Schedule Your Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;