import { Film, Grid3x3, Gift, Upload, User, X } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const navItems = [
    { icon: Grid3x3, label: "Browse", path: "/browse" },
    { icon: Film, label: "My Films", path: "/my-films" },
    { icon: Gift, label: "Rewards", path: "/rewards" },
    { icon: Upload, label: "Submit", path: "/submit" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen border-r border-border bg-sidebar transition-transform duration-300",
        "w-64 md:w-16",
        "md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex h-full flex-col py-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-6 mb-8 md:hidden">
            <h2 className="text-lg font-semibold">QuiFlix</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Logo - Desktop Only */}
          <NavLink to="/" className="mb-8 hidden md:flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Film className="h-6 w-6 text-primary-foreground" />
            </div>
          </NavLink>

          <nav className="flex flex-1 flex-col gap-2 px-3 md:px-0 md:items-center">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  "md:h-10 md:w-10 md:justify-center md:px-0",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="md:hidden">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};
