import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletConnection } from "@/components/WalletConnection";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { ModeToggle } from "@/components/mode-toggle";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, isAuthorized, userRole } = useBlockchain();
  const location = useLocation();
  const navigate = useNavigate();

  // Filter navigation items based on user role and authorization
  const getNavItems = () => {
    const baseItems = [
      { name: "Home", path: "/" },
      { name: "Verify Certificate", path: "/verify" },
    ];

    if (isConnected) {
      baseItems.push({ name: "My Certificates", path: "/certificates" });
    }

    if (isAuthorized) {
      // Staff only can issue
      if (userRole === 'staff') {
        baseItems.push({ name: "Issue Certificate", path: "/issue" });
      }
      // Institute only sees Institute panel
      if (userRole === 'institute') {
        baseItems.push({ name: "Institute", path: "/institute" });
      }
      // Admin only sees Manage Roles
      if (userRole === 'admin') {
        baseItems.push({ name: "Manage Roles", path: "/roles" });
      }
    }

    // Always add FAQ as the last item
    baseItems.push({ name: "FAQ", path: "/#faq" });

    return baseItems;
  };

  const navItems = getNavItems();
  const isActive = (path: string) => location.pathname === path;

  // Handle FAQ scrolling after navigation
  useEffect(() => {
    if (location.hash === "#faq") {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const faqSection = document.getElementById("faq");
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path === "/#faq") {
      e.preventDefault();
      if (location.pathname === "/") {
        // Already on home page, just scroll
        const faqSection = document.getElementById("faq");
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        // Navigate to home page with hash
        navigate("/#faq");
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Shield className="h-8 w-8 text-accent transition-all group-hover:scale-110" />
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-heading text-xl font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
              Ordinals
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative group",
                  isActive(item.path)
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.name}
                {isActive(item.path) && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-accent rounded-full shadow-neon" />
                )}
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-accent rounded-full opacity-0 group-hover:opacity-50 transition-opacity" />
              </Link>
            ))}
          </div>

          {/* Wallet Connection & Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />
            <WalletConnection showDetails={false} />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  handleNavClick(e, item.path);
                  setIsOpen(false);
                }}
                className={cn(
                  "block py-2 px-4 rounded-lg transition-all",
                  isActive(item.path)
                    ? "bg-accent/10 text-accent border-l-4 border-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              <WalletConnection showDetails={false} className="w-full" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
