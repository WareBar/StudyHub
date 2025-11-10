import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { FaUserCircle } from "react-icons/fa";
import { UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


const UserProfile = ({user}) => {
  const [open, setOpen] = useState(false);
    const {logout} = useAuth()
    const navigate = useNavigate();
    const handleLogout = async () =>{
        logout()
        toast.success("Logged out successfully")
        navigate("/")
    }

  return (
    <div className="text-white z-50">
      {/* Avatar + Email */}
      <div
        className="flex items-center gap-3 cursor-pointer bg-white/10 px-4 py-2 rounded-full backdrop-blur-md hover:bg-white/20 transition"
        onClick={() => setOpen(!open)}
      >
        <UserIcon className="text-3xl text-[#00FFA3]" />
        <span className="hidden sm:block">{user.email}</span>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-44 bg-[#1f1b3a] rounded-lg shadow-lg overflow-hidden border border-white/10"
          >
            <button
              className="w-full px-4 py-2 text-left text-white hover:bg-[#2d2665] transition"
              onClick={()=>handleLogout()}

            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
