import { Users, Clapperboard, Building2, LineChart } from "lucide-react";

const benefits = [
  {
    icon: Users,
    audience: "Fans",
    items: [
      "Own exclusive film access rights",
      "Earn revenue from hosting screenings",
      "Trade NFTs on secondary markets",
      "Be part of a global community",
    ],
    gradient: "from-gold/20 to-gold/5",
  },
  {
    icon: Clapperboard,
    audience: "Filmmakers",
    items: [
      "Broader community-driven distribution",
      "Automated, transparent payouts",
      "Built-in marketing from NFT holders",
      "Retain creative control",
    ],
    gradient: "from-diamond/20 to-diamond/5",
  },
  {
    icon: Building2,
    audience: "Platform",
    items: [
      "Scalable distribution network",
      "Long-term community engagement",
      "Data-driven insights",
      "Sustainable revenue model",
    ],
    gradient: "from-gold-dark/30 to-gold-dark/5",
  },
  {
    icon: LineChart,
    audience: "Investors",
    items: [
      "Transparent, traceable revenue",
      "NFT market appreciation potential",
      "Diversified film portfolio",
      "Web3 ecosystem growth",
    ],
    gradient: "from-gold/15 to-diamond/10",
  },
];

const Benefits = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-card to-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Key <span className="text-gradient-gold">Benefits</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Value for every stakeholder in the ecosystem
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl bg-gradient-to-b ${benefit.gradient} border border-border/50 backdrop-blur-sm`}
            >
              {/* Icon & Title */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-background/50">
                  <benefit.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {benefit.audience}
                </h3>
              </div>

              {/* Benefits List */}
              <ul className="space-y-3">
                {benefit.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-gold mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;