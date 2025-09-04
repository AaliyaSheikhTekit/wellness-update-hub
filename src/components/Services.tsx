import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Clock, ArrowRight } from "lucide-react";
import treatmentImage from "@/assets/naturopathy-treatment.jpg";
import { motion } from "framer-motion";
const Services = () => {
  const services = [{ title: "Detox Therapy", description: "Cleanse your body naturally with our comprehensive detoxification programs using herbal remedies and lifestyle modifications.", duration: "4-6 weeks", sessionTime: "45-60 minutes per session", price: "₹12,000", icon: "🌿" }, { title: "Pain Management", description: "Natural pain relief through therapeutic treatments, herbal medicines, and holistic approaches without dependency on synthetic drugs.", duration: "2-8 weeks", sessionTime: "30-45 minutes per session", price: "₹8,000", icon: "🌱" }, { title: "Stress Management", description: "Restore mental balance and emotional wellness through natural stress relief techniques and mindfulness practices.", duration: "6-12 weeks", sessionTime: "60-75 minutes per session", price: "₹10,000", icon: "🧘" }, { title: "Iksha Complete Care", description: "Comprehensive wellness program combining all our services for complete mind-body-spirit transformation and optimal health.", duration: "12-16 weeks", sessionTime: "90-120 minutes per session", price: "₹25,000", icon: "✨" },
    {
      title: "Śhodhana Detox Package",
      description: "A deep body detoxification program using traditional naturopathic methods to cleanse and rejuvenate.",
      duration: "4-6 weeks",
      sessionTime: "45-60 minutes per session",
      price: "₹15,000",
      icon: "🌀"
    },
    {
      title: "Śham Destress Package",
      description: "Holistic stress relief with mindfulness, herbal remedies, and relaxation therapies.",
      duration: "6-8 weeks",
      sessionTime: "60-75 minutes per session",
      price: "₹12,000",
      icon: "🧘"
    },
    {
      title: "Ropaṇ Sports Recovery Package",
      description: "Recovery therapies for athletes and active individuals to restore energy and heal naturally.",
      duration: "3-6 weeks",
      sessionTime: "45-60 minutes per session",
      price: "₹14,000",
      icon: "🏋️"
    },
    {
      title: "Saṁpūrṇa Ikshā Complete Care Package",
      description: "Comprehensive mind-body-spirit care combining all treatments for complete transformation.",
      duration: "12-16 weeks",
      sessionTime: "90-120 minutes per session",
      price: "₹30,000",
      icon: "✨"
    },
    {
      title: "Praṇidhāna Weight Loss Package",
      description: "Personalized naturopathic program focusing on natural fat loss and lifestyle correction.",
      duration: "8-12 weeks",
      sessionTime: "60 minutes per session",
      price: "₹18,000",
      icon: "⚖️"
    },
    {
      title: "Āabha Beauty Package",
      description: "Natural beauty care using herbal therapies, detox, and rejuvenation treatments.",
      duration: "6-10 weeks",
      sessionTime: "45-60 minutes per session",
      price: "₹20,000",
      icon: "🌸"
    },
    {
      title: "Sādhana Pain Relief Package",
      description: "Targeted therapies for chronic pain, joint stiffness, and muscular discomfort.",
      duration: "4-8 weeks",
      sessionTime: "30-45 minutes per session",
      price: "₹10,000",
      icon: "🌿"
    },
  ];

  return (
     <section id="services" className="py-20 bg-wellness-beige-light/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-wellness-sage-light/20 border border-wellness-sage/30 mb-6">
            <span className="text-sm font-medium text-wellness-sage">
              Our Services
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Natural Healing Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive range of naturopathic treatments designed
            to address your unique health needs and restore optimal wellness
            naturally.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="mb-16 px-4 sm:px-8 lg:px-16">
          <Carousel className="w-full max-w-6xl mx-auto">
            <CarouselContent className="-ml-4">
              {services.map((service, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 md:basis-1/2 lg:basis-1/2"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-8 h-full wellness-card-gradient wellness-shadow-soft hover:wellness-shadow hover:scale-[1.03] transition-transform duration-300 border-0">
                      <div className="flex items-start justify-between mb-6">
                        <motion.div
                          whileHover={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.6 }}
                          className="text-4xl mb-4"
                        >
                          {service.icon}
                        </motion.div>
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
                        <Button
                          variant="wellnessOutline"
                          className="wellness-spring hover:shadow-md hover:bg-wellness-sage hover:text-primary-foreground transition"
                          onClick={() => {
                            const contactSection =
                              document.getElementById("contact");
                            contactSection?.scrollIntoView({
                              behavior: "smooth",
                            });
                          }}
                        >
                          View Details & Book
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        {/* Why Choose Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <img
              src={treatmentImage}
              alt="Natural naturopathy treatments"
              className="rounded-2xl wellness-shadow object-cover w-full h-96 hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-3xl font-bold text-foreground">
              Why Choose Natural Healing?
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "No Side Effects",
                  desc: "Natural treatments work with your body's healing mechanisms",
                },
                {
                  title: "Holistic Approach",
                  desc: "Address root causes, not just symptoms",
                },
                {
                  title: "Personalized Care",
                  desc: "Treatments tailored to your unique constitution and needs",
                },
              ].map((point, i) => (
                <motion.div
                  key={i}
                  className="flex items-start space-x-4"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-6 h-6 rounded-full bg-wellness-sage flex-shrink-0 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {point.title}
                    </h4>
                    <p className="text-muted-foreground">{point.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Button
              variant="wellness"
              size="lg"
              className="mt-8 shadow-md hover:shadow-lg transition"
              onClick={() => {
                const contactSection = document.getElementById("contact");
                contactSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Schedule Your Consultation
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Services;
