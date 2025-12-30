import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Gift } from "lucide-react";
import { useState } from "react";

const Rewards = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <main className="md:ml-16 pt-16 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 md:mb-8 text-3xl md:text-4xl font-bold text-foreground">Rewards</h1>
            
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-24">
                <Gift className="mb-4 h-16 w-16 text-muted-foreground/50" />
                <h3 className="mb-2 text-xl font-semibold text-foreground">No rewards available</h3>
                <p className="text-muted-foreground">Check back later for exclusive rewards</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Rewards;
