import {motion} from "framer-motion"


export const BannerWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="w-full rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
  >
    {children}
  </motion.div>
);