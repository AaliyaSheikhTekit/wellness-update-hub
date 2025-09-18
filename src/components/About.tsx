import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Users, Leaf, Heart } from "lucide-react";
import consultationImage from "@/assets/consultation-room.jpg";
import { Skeleton } from "./ui/skeleton";

const About = () => {
  const achievements = [
    {
      icon: <Users className="w-8 h-8 text-wellness-sage" />,
      number: "500+",
      label: "Patients Healed",
      description: "Successfully treated with natural methods",
    },
    {
      icon: <Award className="w-8 h-8 text-wellness-sage" />,
      number: "15+",
      label: "Years Experience",
      description: "Dedicated practice in naturopathy",
    },
    {
      icon: <Heart className="w-8 h-8 text-wellness-sage" />,
      number: "98%",
      label: "Success Rate",
      description: "Patient satisfaction and healing outcomes",
    },
    {
      icon: <Leaf className="w-8 h-8 text-wellness-sage" />,
      number: "50+",
      label: "Natural Remedies",
      description: "Carefully curated herbal solutions",
    },
  ];

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="items-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-wellness-sage-light/20 border border-wellness-sage/30 mb-6">
                <Leaf className="w-4 h-4 text-wellness-sage mr-2" />
                <span className="text-sm font-medium text-wellness-sage">
                  About Iksha
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                Welcome to Ikshā Naturopathy
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  <span className="font-semibold text-wellness-sage">
                   A sanctuary of natural healing and balance.
                  </span>{" "}
                  Rooted in the pure, innate wisdom of nature, our philosophy is
                  simple: true health comes from harmony between all the 5
                  elements of nature that our body consists of. At our
                  naturopathy centre, we use safe, time-tested natural therapies
                  that support the body's natural ability to heal — without the
                  side effects often associated with conventional treatments.
                </p>
                <p>
                  Our therapies are inspired by the{" "}
                  <span className="font-semibold text-wellness-sage">
                    Panchatatva – Jal (Water), Agni (Fire), Vayu (Air), Prithvi
                    (Earth), and Aakash (Space).
                  </span>{" "}
                  We believe every individual is a reflection of these elements,
                  and true healing happens when they are in balance.
                </p>
                <p>
                  Our vision is to educate and inspire others about the body’s
                  self-healing mechanisms, showing that with the right tools,
                  lifestyle, and mindset, each person can become their own
                  doctor.
                </p>
                <p>
                  Our goal is to provide naturopathy therapies in a continuous
                  format that helps you maintain optimal health throughout the
                  year, rather than relying on occasional, short-term
                  treatments.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="wellness" size="lg" className="bg-foreground hover:bg-foreground/90">
                Meet Our Practitioners
              </Button>
              <Button variant="wellnessOutline" size="lg" className="bg-background hover:bg-foreground/5">
                Our Philosophy
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <img
              src={consultationImage}
              alt="Iksha naturopathy consultation room"
              className="rounded-2xl wellness-shadow object-cover w-full h-96"
            />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-wellness-sage rounded-full flex items-center justify-center wellness-glow">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">
                  15+
                </div>
                <div className="text-xs text-primary-foreground/90">Years</div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {achievements.map((achievement, index) => (
            <Card
              key={index}
              className="p-6 text-center text-foreground wellness-shadow-soft hover:wellness-shadow wellness-transition border-0 wellness-gradient"
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

        {/* CTA */}
        {/* Skeleton section as requested */}
        <div className="mt-20 text-center">
          <div className="wellness-card-gradient rounded-3xl p-12 wellness-shadow max-w-4xl mx-auto">
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6 mx-auto" />
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-12 w-48" />
              </div>
            </div>
          </div>
        </div></div></section>
        
  );
};

export default About;
