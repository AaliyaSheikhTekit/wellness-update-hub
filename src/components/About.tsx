import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Users, Leaf, Heart } from "lucide-react";
import consultationImage from "@/assets/consultation-room.jpg";
import { Skeleton } from "./ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import doctor from "@/assets/images/doctor.jpeg";
import esha from "@/assets/images/Esha.jpeg";
import infrastructure1 from "@/assets/images/infrastructure1.jpg";
import infrastructure2 from "@/assets/images/infrastructure2.jpg";
import infrastructure3 from "@/assets/images/infrastructure3.jpg";
import infrastructure4 from "@/assets/images/infrastructure4.jpg";
import infrastructure5 from "@/assets/images/infrastructure5.jpg";
import infrastructure6 from "@/assets/images/infrastructure6.jpg";
import infrastructure7 from "@/assets/images/infrastructure7.jpg";
import infrastructure8 from "@/assets/images/infrastructure8.jpg";
import infrastructure9 from "@/assets/images/infrastructure9.jpg";
import teamPhoto from "@/assets/images/team.jpg";

const About = () => {
  const team = [
    {
      name: "Esha Agrawal",
      role: "Founder, Naturopathy Consultant",
      bio: `Esha's journey into natural healing began with her own recovery from a chronic condition through holistic practices. With a Master's in Luxury Brand Management (London) and a Diploma in Naturopathy and Yoga, she transitioned her career to focus on wellness. She believes that any problematic conditions have natural cures without invasive treatments. Driven by her passion, she founded Ikshā Naturopathy to help others find health renewal.`,
      image: esha,
    },
    {
      name: "Dr. Mohit Patidar",
      role: "BNYS, Naturopathy Physician",
      bio: `Dr. Mohit has guided over 8000 patients toward better health, having worked at Patanjali Wellness for 4+ years and other retreats. With certifications in Ozone Therapy and Acupuncture, he specializes in lifestyle disorders and pain management. For him, every patient is a story of transformation, hope, and renewed health.`,
      image: doctor,
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
                A sanctuary of natural healing and balance.
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
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
                  Our vision is to educate and inspire others about the body's
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

        {/* Team Section */}
        <section className="py-20 text-foreground" id="team">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-foreground mb-12"
            >
              Meet Our Team
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {team.map((member, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: idx * 0.2 }}
                  className="bg-white rounded-2xl shadow-lg p-8 text-left flex flex-col md:flex-row items-center gap-6"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-40 h-40 rounded-full object-cover shadow-md border-4 border-emerald-100"
                  />
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground-90">
                      {member.name}
                    </h3>
                    <p className="text-foreground font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Infrastructure & Team Showcase */}
        <section className="py-20" id="facilities">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-wellness-sage-light/20 border border-wellness-sage/30 mb-6">
                <Heart className="w-4 h-4 text-wellness-sage mr-2" />
                <span className="text-sm font-medium text-wellness-sage">
                  Our Space
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Where Healing Happens
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A glimpse into our serene healing environment and the dedicated team behind your wellness journey.
              </p>
            </motion.div>

            {/* Infrastructure Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                { src: infrastructure1, alt: "Iksha Naturopathy reception area with pink wall and modern design" },
                { src: infrastructure2, alt: "Natural therapy treatment setup with herbal compress" },
                { src: infrastructure3, alt: "Peaceful massage treatment room" },
                { src: infrastructure4, alt: "Prithvi element therapy room" },
                { src: infrastructure5, alt: "Hydrotherapy bath treatment facility" },
                { src: infrastructure6, alt: "Dual water therapy treatment beds" },
                { src: infrastructure7, alt: "Relaxation lounge with modern seating" },
                { src: infrastructure8, alt: "Meditation and yoga hall with chakra display" },
                { src: infrastructure9, alt: "Bird's eye view of reception area" },
              ].map((image, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative group overflow-hidden rounded-xl wellness-shadow hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </div>

            {/* Team Photo */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative group overflow-hidden rounded-2xl wellness-shadow"
            >
              <img
                src={teamPhoto}
                alt="Iksha Naturopathy team"
                className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                <div>
                  <h3 className="text-white text-3xl font-semibold mb-3">
                    Our Dedicated Team
                  </h3>
                  <p className="text-white/90 text-base max-w-2xl">
                    A passionate group of naturopathy professionals committed to guiding you on your path to optimal health and natural wellness
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default About;
