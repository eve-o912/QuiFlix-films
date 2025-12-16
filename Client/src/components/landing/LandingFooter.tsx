import { NavLink } from "@/components/NavLink";
import logo from "@/assets/quiflix-logo.png";

const LandingFooter = () => {
  return (
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
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><NavLink to="/help" className="hover:text-primary">Help Center</NavLink></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2024 QuiFlix. Powered by Base, Lisk, Scroll & Celo networks.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;