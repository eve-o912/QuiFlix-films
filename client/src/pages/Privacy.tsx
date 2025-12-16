import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { Shield } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="ml-16 pt-16">
        <div className="mx-auto max-w-4xl px-8 py-12">
          <div className="mb-8 flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
          </div>
          
          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <p className="text-lg">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground">Information We Collect</h2>
              <p>We collect information you provide directly, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email address for account creation</li>
                <li>Wallet addresses for transactions</li>
                <li>Viewing history and preferences</li>
                <li>Transaction data on public blockchains</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">How We Use Your Information</h2>
              <p>Your information is used to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and improve our services</li>
                <li>Process transactions and payments</li>
                <li>Send notifications about your purchases</li>
                <li>Personalize your viewing experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">Blockchain Data</h2>
              <p>Please note that blockchain transactions are public by nature. Your wallet address and transaction history on Base and Lisk networks are publicly visible.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">Data Security</h2>
              <p>We implement industry-standard security measures to protect your personal information. Custodial wallet private keys are encrypted and stored securely.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">Contact</h2>
              <p>For privacy concerns, contact us at <a href="mailto:privacy@quiflix.app" className="text-primary hover:underline">privacy@quiflix.app</a></p>
            </section>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Privacy;
