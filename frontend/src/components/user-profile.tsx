import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserProfile = ({ user, variant = "dashboard" }) => {
  const { logout } = useAuth();
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
      <div className="w-full bg-white/80 backdrop-blur-xl border-b border-orange-100 shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <h1
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-orange-600 cursor-pointer"
          >
            StudyHub
          </h1>

          {/* Profile Section */}
          <div ref={dropdownRef} className="relative">
            <div
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 cursor-pointer hover:bg-orange-50 px-3 py-2 rounded-xl transition"
            >
              <Avatar className="h-10 w-10 border-2 border-orange-400">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-orange-500 text-white">
                  {getInitials(user?.email)}
                </AvatarFallback>
              </Avatar>

              <div className="hidden sm:block text-left">
                <p className="font-semibold text-orange-700">
                  {user?.first_name || "Student"}
                </p>
                <p className="text-sm text-orange-600">{user?.email}</p>
              </div>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-orange-100 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-orange-50 text-orange-700 transition"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-orange-50 text-red-500 transition"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
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
