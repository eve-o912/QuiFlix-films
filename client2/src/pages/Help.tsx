import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { HelpCircle, Wallet, Film, CreditCard, Shield, Mail } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const Help = () => {
  const faqs = [
    {
      category: "Wallet & Payments",
      icon: Wallet,
      questions: [
        {
          q: "How do I connect my wallet?",
          a: "Click the 'Connect Wallet' button and choose between a custodial wallet (we manage it for you), MetaMask, or Coinbase Wallet. You can also buy USDC directly with your card or M-Pesa."
        },
        {
          q: "What currencies do you accept?",
          a: "We accept USDT and USDC on both Base and Lisk networks. You can use our fiat onramp to convert your local currency to USDC."
        },
        {
          q: "How do I buy USDC?",
          a: "In the wallet connection dialog, select 'Buy USDC with Card/M-Pesa' to open our onramp partner. You can use credit/debit cards, bank transfers, or M-Pesa."
        }
      ]
    },
    {
      category: "Purchasing Films",
      icon: Film,
      questions: [
        {
          q: "What's the difference between NFT and Direct purchase?",
          a: "NFT purchases give you a tradeable token that you can resell on the secondary market. Direct purchases give you streaming access tied to your account, usually at a lower price."
        },
        {
          q: "Can I resell my NFTs?",
          a: "Yes! NFT ticket holders can resell their films on the marketplace. The original creator receives royalties from each resale."
        },
        {
          q: "Are purchases refundable?",
          a: "All blockchain transactions are final and cannot be reversed. Please ensure you want the content before purchasing."
        }
      ]
    },
    {
      category: "For Creators",
      icon: CreditCard,
      questions: [
        {
          q: "How do I submit my film?",
          a: "Go to the Submit page, fill in your film details including pricing for NFT and direct purchases, upload your content, and submit for review."
        },
        {
          q: "How do I get paid?",
          a: "Earnings from sales are sent directly to your connected wallet in USDC. You receive payments for both primary sales and secondary market royalties."
        },
        {
          q: "What fees does QuiFlix charge?",
          a: "QuiFlix takes a small platform fee from each sale. The majority of the revenue goes directly to creators."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="ml-16 pt-16">
        <div className="mx-auto max-w-4xl px-8 py-12">
          <div className="mb-8 flex items-center gap-3">
            <HelpCircle className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Help Center</h1>
          </div>
          
          <p className="mb-12 text-lg text-muted-foreground">
            Find answers to common questions or contact our support team.
          </p>

          {/* FAQ Sections */}
          {faqs.map((section, idx) => (
            <div key={idx} className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <section.icon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">{section.category}</h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {section.questions.map((item, qIdx) => (
                  <AccordionItem key={qIdx} value={`${idx}-${qIdx}`} className="border-border">
                    <AccordionTrigger className="text-foreground hover:text-primary">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {/* Contact Section */}
          <div className="mt-12 rounded-xl border border-border bg-card/50 p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Still need help?</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Our support team is available 24/7 to assist you with any questions.
            </p>
            <Button asChild>
              <a href="mailto:support@quiflix.app">Contact Support</a>
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Help;
