import { Film, Mail, MessageCircle, FileText, Shield, HelpCircle } from "lucide-react";
import { NavLink } from "./NavLink";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Film className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">QuiFlix</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The future of film ownership. Own, trade, and enjoy exclusive content on the blockchain.
            </p>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-3">
              <li>
                <NavLink to="/terms" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <FileText className="h-4 w-4" />
                  Terms of Service
                </NavLink>
              </li>
              <li>
                <NavLink to="/privacy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Shield className="h-4 w-4" />
                  Privacy Policy
                </NavLink>
              </li>
              <li>
                <NavLink to="/refund" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <FileText className="h-4 w-4" />
                  Refund Policy
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Support</h4>
            <ul className="space-y-3">
              <li>
                <NavLink to="/help" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <HelpCircle className="h-4 w-4" />
                  Help Center
                </NavLink>
              </li>
              <li>
                <a href="mailto:support@quiflix.app" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                  support@quiflix.app
                </a>
              </li>
              <li>
                <NavLink to="/contact" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  Contact Us
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Networks */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Supported Networks</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm text-foreground">Base Network</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-foreground">Lisk Network</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Pay with USDT/USDC on Base or Lisk
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} QuiFlix. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Built on Web3</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">Powered by Blockchain</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
