import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import heroBg from "@/assets/hero-bg.jpg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <main className="md:ml-16 pt-16">
        {/* Hero Section */}
        <section className="relative h-[500px] md:h-[600px] overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={heroBg} 
              alt="Cinema" 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-hero" />
          </div>
          
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 md:px-8 text-center">
            <h1 className="mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Own Your Movie <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Experience
              </span>
            </h1>
            <p className="mb-2 md:mb-4 max-w-2xl text-base md:text-lg text-muted-foreground px-4">
              Stream premium films and own NFT tickets. No wallet?
            </p>
            <p className="mb-6 md:mb-8 text-base md:text-lg text-muted-foreground px-4">
              No problem. Buy directly and claim your NFT anytime.
            </p>
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
              onClick={() => navigate('/browse')}
            >
              Get Started
            </Button>
          </div>
        </section>

        {/* Features or Films Section */}
        <section className="px-8 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-3xl font-bold text-foreground">Featured Films</h2>
            <p className="text-muted-foreground">Discover and own exclusive film experiences...</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
