import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { FileText } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="ml-16 pt-16">
        <div className="mx-auto max-w-4xl px-8 py-12">
          <div className="mb-8 flex items-center gap-3">
            <FileText className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
          </div>
          
          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <p className="text-lg">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>By accessing or using QuiFlix, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">2. NFT Purchases</h2>
              <p>When you purchase an NFT on QuiFlix, you receive ownership of the digital token representing access to the film content. This ownership is recorded on the blockchain and can be transferred or resold according to the platform's rules.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>NFT purchases are final and non-refundable</li>
                <li>Resale prices are set by NFT holders</li>
                <li>Creator royalties apply to secondary sales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">3. Direct Purchases</h2>
              <p>Direct purchases grant you streaming access to the film content. This access is tied to your account and cannot be transferred.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">4. Content Guidelines</h2>
              <p>Filmmakers submitting content to QuiFlix must ensure they have all necessary rights and permissions. Content that violates copyright, contains illegal material, or breaches community standards will be removed.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">5. Wallet Security</h2>
              <p>You are responsible for maintaining the security of your wallet credentials. QuiFlix is not responsible for any losses due to compromised wallet security.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">6. Contact</h2>
              <p>For questions about these terms, contact us at <a href="mailto:legal@quiflix.app" className="text-primary hover:underline">legal@quiflix.app</a></p>
            </section>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Terms;
