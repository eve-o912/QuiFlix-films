import { Key, Wallet, BarChart3, RefreshCcw, Shield, Sparkles } from "lucide-react";

const features = [
  {
    icon: Key,
    title: "Proof of Ownership",
    description: "Each NFT is a digital key granting exclusive rights to host screenings and access films.",
  },
  {
    icon: Wallet,
    title: "Automated Revenue",
    description: "Smart contracts ensure instant, transparent payouts to all stakeholders.",
  },
  {
    icon: RefreshCcw,
    title: "Secondary Market",
    description: "NFT holders can resell access rights, creating liquid value for high-demand films.",
  },
  {
    icon: Shield,
    title: "Scarcity & Exclusivity",
    description: "Limited NFT supply creates demand and rewards early community adopters.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track screening performance, audience demographics, and regional success.",
  },
  {
    icon: Sparkles,
    title: "Community Power",
    description: "NFT holders become active distributors, growing the film's reach organically.",
  },
];

const WhyNFTs = () => {
  return (
    <section id="why-nfts" className="py-24 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Why <span className="text-gradient-gold">NFTs</span>?
          </h2>
          <p className="text-muted-foreground text-lg">
            NFTs aren't just collectibles—they're utility tools that transform film
            distribution, giving fans and filmmakers real ownership and earnings.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-all hover:border-gold/50 hover:shadow-gold"
            >
              <div className="inline-flex p-3 rounded-xl bg-gold/10 mb-4 group-hover:bg-gold/20 transition-colors">
                <feature.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyNFTs;