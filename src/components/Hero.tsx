import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Heart, Shield } from "lucide-react";
import heroImage from "@/assets/hero-wellness-bg.jpg";

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-wellness-sage-light/20 border border-wellness-sage/30">
                <Leaf className="w-4 h-4 text-wellness-sage mr-2" />
                <span className="text-sm font-medium text-wellness-sage">Natural Healing Excellence</span>
              </div>
              
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Natural Healing for
                <span className="text-wellness-sage block">Complete Wellness</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Experience the power of naturopathy at Iksha. Our holistic approach combines traditional wisdom with modern practices to restore balance and promote natural healing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="wellness" size="lg" className="text-lg px-8 py-6">
                Book Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="wellnessOutline" size="lg" className="text-lg px-8 py-6">
                Learn More
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-wellness-sage">500+</div>
                <div className="text-sm text-muted-foreground">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-wellness-sage">15+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-wellness-sage">98%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="lg:pl-12">
            <div className="wellness-card-gradient rounded-3xl p-8 wellness-shadow">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 rounded-xl bg-wellness-sage-light/10">
                  <div className="w-12 h-12 rounded-xl bg-wellness-sage flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Natural Treatments</h3>
                    <p className="text-sm text-muted-foreground">Herbal remedies & organic solutions</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 rounded-xl bg-wellness-sage-light/10">
                  <div className="w-12 h-12 rounded-xl bg-wellness-sage flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Holistic Care</h3>
                    <p className="text-sm text-muted-foreground">Mind, body & spirit wellness</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 rounded-xl bg-wellness-sage-light/10">
                  <div className="w-12 h-12 rounded-xl bg-wellness-sage flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Proven Results</h3>
                    <p className="text-sm text-muted-foreground">Evidence-based natural medicine</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;