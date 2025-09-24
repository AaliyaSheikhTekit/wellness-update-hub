import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Heart, Shield } from "lucide-react";
import heroImage from "@/assets/hero_video.mp4";
import { motion,AnimatePresence  } from "framer-motion";
import CountUp from "react-countup";
import { useState } from "react";

const Hero = () => {
    const [showMore, setShowMore] = useState(false);
    const team = [
    {
      name: "Esha Agrawal",
      role: "Founder, Naturopathy Consultant",
      bio: `Esha’s journey into natural healing began with her own recovery from a chronic condition through holistic practices. With a Master's in Luxury Brand Management (London) and a Diploma in Naturopathy and Yoga, she transitioned her career to focus on wellness. She believes that any problematic conditions have natural cures without invasive treatments. Driven by her passion, she founded Ikshā Naturopathy to help others find health renewal.`,
      image: "/team/esha.jpg", // replace with real image path
    },
    {
      name: "Dr. Mohit Patidar",
      role: "BNYS, Naturopathy Physician",
      bio: `Dr. Mohit has guided over 8000 patients toward better health, having worked at Patanjali Wellness for 4+ years and other retreats. With certifications in Ozone Therapy and Acupuncture, he specializes in lifestyle disorders and pain management. For him, every patient is a story of transformation, hope, and renewed health.`,
      image: "/team/mohit.jpg", // replace with real image path
    },
  ]

  return (<>
   <section
  id="home"
  className="relative min-h-screen flex items-center overflow-hidden mt-6"
>
      {/* Background with parallax effect */}
     {/* Background with looping video */}
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute top-0 left-0 w-full h-full object-cover"
>
  <source src={heroImage} type="video/mp4" />
</video>

{/* Optional gradient overlay for text readability */}
<div className="absolute inset-0 bg-gradient-to-r from-background/55 via-background/20 to-background/20" />

      <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-background/20 to-background/20" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <motion.div
                className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-wellness-beige/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Leaf className="w-4 h-4 text-foreground mr-2" />
                <span className="text-sm font-medium text-foreground">
                 Welcome to Ikshā Naturopathy
                </span>
              </motion.div> 

              <motion.h1
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
           Integrated Natural Healing system for a 
                <span className="text-foreground block">
                  comprehensive wellness transformation.
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-dark-foreground leading-relaxed max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                The true meaning of the word “Iksha” is "knowledge of the soul" and at Ikshā Naturopathy, we believe in nurturing the natural ability to heal from within and thrive. Our expert naturopaths provide personalized care using time-tested natural therapies such as hydrotherapy, chromotherapy, earthen mud therapy, yoga therapy, acupuncture, acupressure, counseling mind calming therapies. 
              </motion.p>
            </div>
 <AnimatePresence>
        {showMore && (
          <motion.div
            className="mt-6 text-left space-y-4 text-foreground/80"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p>
              Whether you’re seeking relief from chronic conditions, looking to
              boost your energy, or simply want a more natural, sustainable path
              to wellness — our integrated system is designed to support you
              every step of the way.
            </p>
            <p>
              <strong>Feel the strength of Earth</strong>, grounding you in
              peace.
              <br />
              <strong>Flow with Water</strong>, cleansing and refreshing every
              cell.
              <br />
              <strong>Awaken the Fire</strong> within, igniting energy and
              vitality.
              <br />
              <strong>Embrace the Air</strong>, calming your mind and spirit.
              <br />
              <strong>Expand into Space</strong>, finding freedom and inner
              harmony.
              <br />
              Finally, let the <strong>Life force</strong> within you guide you
              to healthy practices.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Button
                variant="wellness"
                size="lg"
                className="text-lg px-8 py-6 shadow-md hover:shadow-lg transition hover:bg-foreground-80 bg-foreground text-white "
              >
                Book Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
               <Button
        variant={showMore ? "wellnessOutline" : "default"}
        size="lg"
        className="text-lg px-8 py-6 "
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? "Show Less" : "Learn More"}
      </Button>
            </motion.div>

          </motion.div>

          {/* Right Feature Cards */}
          <motion.div
            className="lg:pl-12"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="wellness-card-gradient rounded-3xl p-8 wellness-shadow space-y-6">
              {[
                {
                  icon: <Leaf className="w-6 h-6 text-primary-foreground" />,
                  title: "Natural Treatments",
                  desc: "Herbal remedies & organic solutions",
                },
                {
                  icon: <Heart className="w-6 h-6 text-primary-foreground" />,
                  title: "Holistic Care",
                  desc: "Mind, body & spirit wellness",
                },
                {
                  icon: <Shield className="w-6 h-6 text-primary-foreground" />,
                  title: "Proven Results",
                  desc: "Evidence-based natural medicine",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  className="flex items-center space-x-4 p-4 rounded-xl bg-white cursor-pointer transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center shadow-md">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
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
                className="w-32 h-32 rounded-full object-cover shadow-md border-4 border-emerald-100"
              />
              <div>
                <h3 className="text-2xl font-semibold text-foreground-90">
                  {member.name}
                </h3>
                <p className="text-foreground font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-700 leading-relaxed">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};

export default Hero;
