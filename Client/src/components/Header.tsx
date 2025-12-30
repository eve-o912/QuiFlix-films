import { Film, User as UserIcon, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { NavLink } from "./NavLink";
import { WalletButton } from "./WalletButton";
import { WalletStatus } from "./WalletStatus";
import logo from "@/assets/quiflix-logo.png";
import { useState } from "react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="fixed left-0 md:left-16 right-0 top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <img src={logo} alt="QuiFlix" className="h-6 md:h-8" />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Hide WalletStatus on very small screens */}
          <div className="hidden sm:block">

          </div>
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
