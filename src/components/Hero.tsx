import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Heart, Shield } from "lucide-react";
import heroImage from "@/assets/hero_video.mp4";
import { motion } from "framer-motion";
import CountUp from "react-countup";

const Hero = () => {
  return (
   <section
  id="home"
  className="relative min-h-screen flex items-center overflow-hidden mt-2"
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
                  Natural Healing Excellence
                </span>
              </motion.div> 

              <motion.h1
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Natural Healing for
                <span className="text-foreground block">
                  Complete Wellness
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-dark-foreground leading-relaxed max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Experience the power of naturopathy at Iksha. Our holistic
                approach combines traditional wisdom with modern practices to
                restore balance and promote natural healing.
              </motion.p>
            </div>

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
                className="text-lg px-8 py-6 shadow-md hover:shadow-lg transition bg-foreground text-white"
              >
                Book Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="wellnessOutline"
                size="lg"
                className="text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              {[
                { value: 500, label: "Happy Patients", suffix: "+" },
                { value: 15, label: "Years Experience", suffix: "+" },
                { value: 98, label: "Success Rate", suffix: "%" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    <CountUp
                      start={0}
                      end={stat.value}
                      duration={2}
                      suffix={stat.suffix}
                    />
                  </div>
                  <div className="text-sm text-dark-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
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
  );
};

export default Hero;
