import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import Hero from "@/components/landing/Hero";
import WhyNFTs from "@/components/landing/WhyNFTs";
import HowItWorks from "@/components/landing/HowItWorks";
import Benefits from "@/components/landing/Benefits";
import CTA from "@/components/landing/CTA";
import LandingFooter from "@/components/landing/LandingFooter";
import logo from "@/assets/quiflix-logo.png";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to home
        navigate('/home');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  return (
    <main className="min-h-screen bg-background">
      {/* Fixed Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 bg-gradient-to-b from-background to-transparent">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="QuiFlix" className="h-10" />
          </div>
          <div className="flex items-center gap-4">
            <NavLink to="/browse">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Browse Films
              </Button>
            </NavLink>
            <NavLink to="/auth">
              <Button variant="outline" className="border-gold/50 bg-background/30 backdrop-blur-sm hover:bg-gold hover:text-primary-foreground">
                Sign In
              </Button>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Page Sections */}
      <Hero />
      <WhyNFTs />
      <HowItWorks />
      <Benefits />
      <CTA />
      <LandingFooter />
    </main>
  );
};

export default Index;
