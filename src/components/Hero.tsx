import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Heart, Shield } from "lucide-react";
import heroImage from "@/assets/hero_video.mp4";
import { motion,AnimatePresence  } from "framer-motion";
import { useState } from "react";


const Hero = () => {
    const [showMore, setShowMore] = useState(false);
  
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
  asChild
  variant="wellness"
  size="lg"
  className="text-lg px-8 py-6 shadow-md hover:shadow-lg transition hover:bg-foreground-80 bg-foreground text-white"
>
  <a href="#contact">
    Book Consultation
    <ArrowRight className="ml-2 w-5 h-5" />
  </a>
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
    
    </>
  );
};

export default Hero;
