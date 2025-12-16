import { Film, User as UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import { NavLink } from "./NavLink";
import { WalletButton } from "./WalletButton";
import logo from "@/assets/quiflix-logo.png";

export const Header = () => {
  return (
    <header className="fixed left-16 right-0 top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <img src={logo} alt="QuiFlix" className="h-8" />
        </div>

        <div className="flex items-center gap-4">
          <WalletButton />
          <NavLink to="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <UserIcon className="h-5 w-5" />
            </Button>
          </NavLink>
        </div>
      </div>
    </header>
  );
};
