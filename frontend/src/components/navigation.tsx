import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Bell, Menu, X, LayoutDashboard, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import icon from "@/assets/icon3.png";
import { useAuth } from "@/context/AuthContext";
import { Dropdown, DropdownItem } from '@/components/dropdown'
import { useToast } from "@/hooks/useToast";

interface NavbarProps {
  isAuthenticated?: boolean;
}

export function Navbar({ isAuthenticated = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast()


  const navLinks = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/groups", label: "Find Groups", icon: Users },
        { href: "/schedule", label: "Schedule", icon: Calendar },
      ]
    : [
        { href: "#features", label: "Features" },
        { href: "#how-it-works", label: "How It Works" },
        { href: "#testimonials", label: "Testimonials" },
      ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-30 w-20 items-center justify-center rounded-xl">
              <img src={icon} alt="StudyHub" className="w-15 h-15" />
            </div>
            <span className="text-lg font-bold text-foreground hidden sm:block">StudyHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                    3
                  </span>
                </Button>
                <Dropdown
                  trigger={
                    user.avatar ? (
                      <img
                        src={user.avatar}
                        className="w-9 h-9 rounded-full object-cover cursor-pointer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold cursor-pointer">
                        {user.first_name[0]}{user.last_name[0]}
                      </div>
                    )
                  }
                >
                  <div className="px-4 py-3 border-b border-border/40">
                    <p className="text-sm font-semibold">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownItem asChild>
                    <Link to="/profile">
                      <User className="w-4 h-4 mr-2" /> Profile
                    </Link>
                  </DropdownItem>
                  <DropdownItem
                  onClick={()=>{
                    logout()
                    toast.info("Logged out","Rest more and grind later")
                  }}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownItem>
                </Dropdown>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button className="btn-gradient rounded-xl border-0">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background animate-slide-up">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon && <link.icon className="h-5 w-5" />}
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="w-full btn-gradient border-0">
                  <Link to="/register">Sign up free</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}