import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import logo from "@/assets/quiflix-logo.png";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-gold/5 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gold/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <img
            src={logo}
            alt="Quiflix"
            className="w-32 mx-auto mb-8 glow-gold"
          />

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to <span className="text-gradient-gold">Transform</span> African Cinema?
          </h2>

          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            Join the community-driven revolution. Whether you're a fan, filmmaker,
            or investor—there's a place for you in the Quiflix ecosystem.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <NavLink to="/auth">
              <Button variant="hero" size="xl">
                Get Started
                <ArrowRight className="ml-2" />
              </Button>
            </NavLink>
            <NavLink to="/browse">
              <Button variant="heroOutline" size="xl">
                Browse Films
              </Button>
            </NavLink>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <span>🔐 Secure Blockchain</span>
            <span>💰 Transparent Revenue</span>
            <span>🌍 Global Community</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;