import { Film, Grid3x3, Gift, Upload, User } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const navItems = [
    { icon: Grid3x3, label: "Browse", path: "/browse" },
    { icon: Film, label: "My Films", path: "/my-films" },
    { icon: Gift, label: "Rewards", path: "/rewards" },
    { icon: Upload, label: "Submit", path: "/submit" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col items-center py-6">
        <NavLink to="/" className="mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Film className="h-6 w-6 text-primary-foreground" />
          </div>
        </NavLink>

        <nav className="flex flex-1 flex-col gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <item.icon className="h-5 w-5" />
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};
