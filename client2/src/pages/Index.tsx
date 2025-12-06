import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Play, Sparkles, TrendingUp, Users, DollarSign, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
import { HeroCarousel } from "@/components/HeroCarousel";
import logo from "@/assets/quiflix-logo.png";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/home');
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 bg-gradient-to-b from-background to-transparent">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="QuiFlix" className="h-8" />
          </div>
          <div className="flex items-center gap-4">
            <NavLink to="/browse">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Browse Films
              </Button>
            </NavLink>
            <NavLink to="/auth">
              <Button variant="outline" className="border-primary/50 bg-background/30 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground">
                Sign In
              </Button>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Value Proposition Section */}
      <section className="relative border-t border-border bg-gradient-to-b from-card/50 to-background py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              A Platform Built for <span className="text-primary">Everyone</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Producers own their work. Fans invest in stories they love. Everyone wins.
            </p>
          </div>

          {/* For Creators */}
          <div className="mb-20">
            <div className="mb-8 flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/50" />
              <h3 className="text-2xl font-bold text-foreground">For Filmmakers</h3>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/50" />
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="group rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                <div className="mb-6 inline-flex rounded-xl bg-primary/10 p-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h4 className="mb-3 text-xl font-semibold text-foreground">Own Your Content</h4>
                <p className="text-muted-foreground">
                  Your film, your rules. No studio interference. Full creative control and ownership on the blockchain.
                </p>
              </div>

              <div className="group rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                <div className="mb-6 inline-flex rounded-xl bg-green-500/10 p-4">
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
                <h4 className="mb-3 text-xl font-semibold text-foreground">90% Revenue Share</h4>
                <p className="text-muted-foreground">
                  Keep 90% of every sale. Plus 10% royalties on secondary NFT resales – forever.
                </p>
              </div>

              <div className="group rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                <div className="mb-6 inline-flex rounded-xl bg-blue-500/10 p-4">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
                <h4 className="mb-3 text-xl font-semibold text-foreground">Fan Funding</h4>
                <p className="text-muted-foreground">
                  Let your audience invest in your next project. Build community while raising capital.
                </p>
              </div>
            </div>
          </div>

          {/* For Fans */}
          <div>
            <div className="mb-8 flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/50" />
              <h3 className="text-2xl font-bold text-foreground">For Fans & Investors</h3>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/50" />
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="group rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                <div className="mb-6 inline-flex rounded-xl bg-primary/10 p-4">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <h4 className="mb-3 text-xl font-semibold text-foreground">Watch & Own</h4>
                <p className="text-muted-foreground">
                  Stream instantly or own as NFT. Your library lives forever on the blockchain.
                </p>
              </div>

              <div className="group rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                <div className="mb-6 inline-flex rounded-xl bg-primary/10 p-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h4 className="mb-3 text-xl font-semibold text-foreground">Invest & Earn</h4>
                <p className="text-muted-foreground">
                  Buy shares in films you believe in. Earn 20% of revenue automatically distributed to investors.
                </p>
              </div>

              <div className="group rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                <div className="mb-6 inline-flex rounded-xl bg-primary/10 p-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h4 className="mb-3 text-xl font-semibold text-foreground">Collect NFTs</h4>
                <p className="text-muted-foreground">
                  Limited edition film NFTs. Trade them, hold them, or unlock exclusive creator content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground">How Revenue Flows</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Transparent, automatic, trustless distribution powered by smart contracts
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="relative">
              {/* Flow Diagram */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-border bg-card p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                    1
                  </div>
                  <h4 className="mb-2 font-semibold text-foreground">Fan Purchases</h4>
                  <p className="text-sm text-muted-foreground">Buys film access, NFT, or invests</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-xl font-bold text-green-400">
                    90%
                  </div>
                  <h4 className="mb-2 font-semibold text-foreground">Creator Earns</h4>
                  <p className="text-sm text-muted-foreground">Direct & primary NFT sales + 10% secondary</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-xl font-bold text-blue-400">
                    10%
                  </div>
                  <h4 className="mb-2 font-semibold text-foreground">Secondary Royalty</h4>
                  <p className="text-sm text-muted-foreground">Creator earns on every NFT resale</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-xl font-bold text-muted-foreground">
                    10%
                  </div>
                  <h4 className="mb-2 font-semibold text-foreground">Platform Fee</h4>
                  <p className="text-sm text-muted-foreground">Keeps the lights on</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-border py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="container relative mx-auto px-6 text-center">
          <Film className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
            Ready to Join the Revolution?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
            Whether you're a filmmaker with a story or a fan looking to invest in the next big thing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink to="/auth">
              <Button size="lg" className="text-lg px-10 py-6">
                Start Creating
              </Button>
            </NavLink>
            <NavLink to="/browse">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6">
                Browse & Invest
              </Button>
            </NavLink>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-12">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <img src={logo} alt="QuiFlix" className="h-8 mb-4" />
              <p className="text-sm text-muted-foreground">
                The future of film ownership and investment.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><NavLink to="/browse" className="hover:text-primary">Browse Films</NavLink></li>
                <li><NavLink to="/submit" className="hover:text-primary">Submit Film</NavLink></li>
                <li><NavLink to="/my-films" className="hover:text-primary">My Portfolio</NavLink></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><NavLink to="/terms" className="hover:text-primary">Terms of Service</NavLink></li>
                <li><NavLink to="/privacy" className="hover:text-primary">Privacy Policy</NavLink></li>
                <li><NavLink to="/refund" className="hover:text-primary">Refund Policy</NavLink></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><NavLink to="/help" className="hover:text-primary">Help Center</NavLink></li>
                <li><NavLink to="/contact" className="hover:text-primary">Contact Us</NavLink></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 QuiFlix. Powered by Base, Lisk, Scroll & Celo networks.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
