import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, Clock, Target, TrendingUp } from "lucide-react";
import QueryWrapper from "./query-wrapper";
import api from "@/utils/api";
import { motion } from "framer-motion";

const ICON_MAP = [Users, Calendar, Clock, Target];

const CARD_STYLES = [
  {
    bg: "bg-orange-500",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    trendBg: "bg-white/20",
    trendColor: "text-white",
    titleColor: "text-orange-100",
    valueColor: "text-white",
    border: "border-transparent",
  },
  {
    bg: "bg-white",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    trendBg: "bg-green-50",
    trendColor: "text-green-600",
    titleColor: "text-gray-400",
    valueColor: "text-gray-900",
    border: "border-gray-100",
  },
  {
    bg: "bg-white",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    trendBg: "bg-green-50",
    trendColor: "text-green-600",
    titleColor: "text-gray-400",
    valueColor: "text-gray-900",
    border: "border-gray-100",
  },
  {
    bg: "bg-white",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    trendBg: "bg-green-50",
    trendColor: "text-green-600",
    titleColor: "text-gray-400",
    valueColor: "text-gray-900",
    border: "border-gray-100",
  },
];

const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-9 h-9 rounded-xl bg-gray-100" />
      <div className="w-16 h-5 rounded-full bg-gray-100" />
    </div>
    <div className="w-20 h-8 rounded-lg bg-gray-100 mb-2" />
    <div className="w-28 h-4 rounded bg-gray-100" />
  </div>
);

const Stats = () => {
  const { user } = useAuth();

  const fetchStats = async () => {
    const response = await api.get(`/user/stats?user_id=${user.id}`);
    return response.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <QueryWrapper data={data} isLoading={isLoading} error={error}>
        {data?.map((stat, idx) => {
          const Icon = ICON_MAP[idx % ICON_MAP.length];
          const style = CARD_STYLES[idx % CARD_STYLES.length];

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <div
                className={`rounded-2xl border ${style.border} ${style.bg} p-5 h-full shadow-sm hover:shadow-md transition-shadow`}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-9 h-9 rounded-xl ${style.iconBg} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${style.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 ${style.trendBg} px-2 py-1 rounded-full`}>
                    <TrendingUp className={`h-3 w-3 ${style.trendColor}`} />
                    <span className={`text-xs font-medium ${style.trendColor}`}>Live</span>
                  </div>
                </div>

                {/* Value */}
                <div className={`text-2xl sm:text-3xl font-bold tracking-tight mb-1 ${style.valueColor}`}>
                  {stat.content}
                </div>

                {/* Label */}
                <div className={`text-sm ${style.titleColor}`}>{stat.title}</div>
              </div>
            </motion.div>
          );
        })}
      </QueryWrapper>
    </div>
  );
};

export default Stats;