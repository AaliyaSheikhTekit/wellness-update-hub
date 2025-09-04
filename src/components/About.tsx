import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Users, Leaf, Heart } from "lucide-react";
import consultationImage from "@/assets/consultation-room.jpg";

const About = () => {
  const achievements = [
    {
      icon: <Users className="w-8 h-8 text-wellness-sage" />,
      number: "500+",
      label: "Patients Healed",
      description: "Successfully treated with natural methods"
    },
    {
      icon: <Award className="w-8 h-8 text-wellness-sage" />,
      number: "15+",
      label: "Years Experience",
      description: "Dedicated practice in naturopathy"
    },
    {
      icon: <Heart className="w-8 h-8 text-wellness-sage" />,
      number: "98%",
      label: "Success Rate",
      description: "Patient satisfaction and healing outcomes"
    },
    {
      icon: <Leaf className="w-8 h-8 text-wellness-sage" />,
      number: "50+",
      label: "Natural Remedies",
      description: "Carefully curated herbal solutions"
    }
  ];

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-8">
            <div className="items-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-wellness-sage-light/20 border border-wellness-sage/30 mb-6">
                <Leaf className="w-4 h-4 text-wellness-sage mr-2" />
                <span className="text-sm font-medium text-wellness-sage">About Iksha</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                Pioneering Natural Wellness
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  <span className="font-semibold text-wellness-sage">Iksha is where traditional wisdom meets modern convenience</span> — a sanctuary offering a touch-led holistic approach to healing. Unlike fleeting getaway retreats, Iksha brings balance and wellness into your everyday life.
                </p>
                <p>
                  More than just a holistic wellness practice, it's a space to harmonize, heal, and reconnect with yourself through the power of nature's own pharmacy.
                </p>
                <p>
                  Our approach combines time-tested naturopathic principles with contemporary understanding of health and wellness, creating personalized treatment plans that address not just symptoms, but the root causes of imbalance.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="wellness" size="lg" className="bg-foreground">
                Meet Our Practitioners
              </Button>
              <Button variant="wellnessOutline" size="lg">
                Our Philosophy
              </Button>
            </div>
          </div>

          <div className="relative">
            <img 
              src={consultationImage} 
              alt="Iksha naturopathy consultation room" 
              className="rounded-2xl wellness-shadow object-cover w-full h-96"
            />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-wellness-sage rounded-full flex items-center justify-center wellness-glow">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">15+</div>
                <div className="text-xs text-primary-foreground/90">Years</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {achievements.map((achievement, index) => (
            <Card key={index}   className="p-6 text-center text-foreground wellness-shadow-soft hover:wellness-shadow wellness-transition border-0 wellness-gradient"
>
              <div className="flex justify-center mb-4">
                {achievement.icon}
              </div>
              <div className="font-display text-3xl font-bold text-wellness-sage mb-2">
                {achievement.number}
              </div>
              <div className="font-semibold text-white mb-2">
                {achievement.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {achievement.description}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="wellness-card-gradient rounded-3xl p-12 wellness-shadow max-w-4xl mx-auto">
            <h3 className="font-display text-3xl font-bold text-foreground mb-6">
              Ready to Begin Your Healing Journey?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Take the first step towards natural wellness. Our experienced practitioners are here to guide you on your path to optimal health and vitality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="wellness" size="lg" className="text-lg px-8 py-6 bg-foreground">
                Book Your Consultation
              </Button>
              <Button variant="wellnessOutline" size="lg" className="text-lg px-8 py-6">
                Call Us: +91 98765 43210
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;