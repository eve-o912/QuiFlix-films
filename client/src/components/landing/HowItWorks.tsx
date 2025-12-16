import { ShoppingCart, Film, TrendingUp, Repeat } from "lucide-react";

const steps = [
  {
    icon: ShoppingCart,
    step: "01",
    title: "Purchase NFT",
    description: "Fans buy a film access NFT to join the distribution network.",
  },
  {
    icon: Film,
    step: "02",
    title: "Host Screenings",
    description: "NFT holders organize and sell tickets to screenings via Quiflix.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Earn Revenue",
    description: "Smart contracts automatically distribute earnings to all parties.",
  },
  {
    icon: Repeat,
    step: "04",
    title: "Trade & Grow",
    description: "Resell NFTs on secondary markets as film popularity increases.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A simple four-step process to democratize film distribution
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gold/50 to-transparent -z-10" />
              )}

              <div className="text-center group">
                {/* Step number */}
                <div className="text-5xl font-display font-bold text-gold/20 mb-4">
                  {item.step}
                </div>

                {/* Icon */}
                <div className="inline-flex p-4 rounded-2xl bg-card border border-border mb-6 group-hover:border-gold/50 group-hover:shadow-gold transition-all">
                  <item.icon className="w-8 h-8 text-gold" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold mb-3 text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;