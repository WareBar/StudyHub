import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import icon from "@/assets/icon2.png";


const UserProfile = ({ variant = "dashboard" }) => {
  const {toast} = useToast()
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getInitials = email => {
    if (!email) return "U";
    return email[0].toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);




  // 🔥 LANDING NAV VERSION
  if (variant === "landing") {
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src={icon} alt="StudyHub" className="w-20 h-20" />
              <span className="text-lg font-bold hidden sm:block">StudyHub</span>
            </div>

            {/* Profile Section */}
            <div ref={dropdownRef} className="relative">
              <div
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg hover:bg-accent transition"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                </Avatar>

                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{user?.first_name || "Student"}</p>
                </div>
              </div>

              {/* Dropdown */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-44 rounded-lg border border-border bg-background shadow-lg"
                  >
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-accent transition"
                    >
                      Dashboard
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-accent text-red-500 transition"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // 🔵 Dashboard compact version
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.avatar} />
        <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
      </Avatar>
      <span className="text-sm">{user?.email}</span>
    </div>
  );
};

export default UserProfile;
