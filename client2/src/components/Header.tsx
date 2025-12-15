import { Film, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { NavLink } from "./NavLink";
import { WalletButton } from "./WalletButton";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/quiflix-logo.png";

export const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <header className="fixed left-16 right-0 top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <img src={logo} alt="QuiFlix" className="h-8" />
        </div>

        <div className="flex items-center gap-4">
          <WalletButton />
          {currentUser ? (
            <>
              <NavLink to="/profile">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </NavLink>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <NavLink to="/auth">
              <Button 
                variant="default" 
                size="sm"
              >
                Sign In
              </Button>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};
