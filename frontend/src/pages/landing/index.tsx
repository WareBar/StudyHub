import { motion } from "framer-motion";
import UserProfile from "@/components/user-profile";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2Icon,
  Users,
  Calendar,
  MessageCircle,
  Target,
  Clock,
  Sparkles,
  BookOpen,
  Star,
  Bell,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/navigation";

const features = [
  {
    icon: Users,
    title: "Smart Group Matching",
    description: "Find study partners based on your subjects, schedule, and learning goals.",
  },
  {
    icon: Calendar,
    title: "Session Scheduling",
    description: "Schedule and manage study sessions with a beautiful calendar view.",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description: "Communicate with your group members instantly with our built-in chat.",
  },
  {
    icon: Target,
    title: "Attendance Tracking",
    description: "Track attendance and stay accountable with your study partners.",
  },
  {
    icon: Clock,
    title: "Availability Matching",
    description: "See how well your schedule aligns with potential groups.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Never miss a session with timely reminders and updates.",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Computer Science, Stanford",
    initials: "SC",
    color: "#EA6C1A",
    content:
      "StudyHub helped me find an amazing study group for algorithms. We went from struggling to acing our finals!",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Pre-Med, UCLA",
    initials: "MJ",
    color: "#C2590A",
    content:
      "The scheduling feature is a lifesaver. No more endless group chats trying to find a time that works!",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Business, NYU",
    initials: "ER",
    color: "#D97B3A",
    content:
      "I love how easy it is to find groups for my exact subjects. The match percentage feature is genius!",
    rating: 5,
  },
];

const upcomingSessions = [
  { name: "Calculus II Study Group", time: "Today, 4:00 PM · 4 members", match: "94%", color: "#EA6C1A" },
  { name: "Organic Chemistry Review", time: "Tomorrow, 2:00 PM · 6 members", match: "88%", color: "#C2590A" },
  { name: "Data Structures", time: "Wed, 6:00 PM · 3 members", match: "81%", color: "#F5A66B" },
];

const universities = ["Stanford", "MIT", "UCLA", "NYU", "Harvard", "UT Austin"];

const HomePage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Auth */}
      <div className="fixed w-full z-50">
        {isLoading ? (
          <div className="flex items-center space-x-2 text-orange-700 p-4">
            <Loader2Icon className="animate-spin h-5 w-5" />
            <span>Loading...</span>
          </div>
        ) : user ? (
          <UserProfile user={user} variant="landing" />
        ) : (
          <Navbar />
        )}
      </div>

      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-0">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center py-20">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Smart study matching, powered by AI
            </div> */}

            <h1 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-5">
              Study smarter,{" "}
              <span className="text-orange-500">together</span>
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Connect with classmates, form study groups, and collaborate in real-time.
              Smart matching based on your subjects, schedule, and learning style.
            </p>

            <div className="flex gap-3 mb-8 flex-wrap">
              <Button
                onClick={() => navigate("/signup")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-5 rounded-xl text-sm font-medium shadow-md shadow-orange-200"
              >
                Get started — it's free
              </Button>
              <Button
                variant="outline"
                className="border-gray-200 text-gray-600 px-6 py-5 rounded-xl text-sm hover:bg-gray-50"
              >
                Browse groups
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {["S", "M", "E", "R"].map((l, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                    style={{
                      marginLeft: i === 0 ? 0 : -8,
                      background: ["#EA6C1A", "#C2590A", "#F5A66B", "#D97B3A"][i],
                      zIndex: 4 - i,
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-400">Join <strong className="text-gray-700">12,000+</strong> students already studying smarter</span>
            </div>
          </motion.div>

          {/* Right — UI preview cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-3"
          >
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-500 rounded-2xl p-5 text-white">
                <Users className="h-5 w-5 mb-3 opacity-80" />
                <div className="text-3xl font-bold mb-0.5">12,400</div>
                <div className="text-sm opacity-70">Active students</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <Calendar className="h-5 w-5 mb-3 text-orange-500" />
                <div className="text-3xl font-bold text-gray-900 mb-0.5">3,200+</div>
                <div className="text-sm text-gray-400">Sessions this week</div>
              </div>
            </div>

            {/* Sessions preview */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-800">Upcoming sessions</span>
                <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">3 matches</span>
              </div>
              {upcomingSessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.time}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-orange-500">{s.match} match</span>
                </div>
              ))}
            </div>

            {/* Bottom stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <TrendingUp className="h-5 w-5 mb-3 text-orange-500" />
                <div className="text-3xl font-bold text-gray-900 mb-0.5">↑ 34%</div>
                <div className="text-sm text-gray-400">Avg grade improvement</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <Clock className="h-5 w-5 mb-3 text-orange-500" />
                <div className="text-3xl font-bold text-gray-900 mb-0.5">2.4×</div>
                <div className="text-sm text-gray-400">More productive sessions</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── UNIVERSITIES ─── */}
      <div className="border-y border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest text-center mb-5">Trusted by students at</p>
          <div className="flex flex-wrap gap-8 justify-center items-center">
            {universities.map((u) => (
              <span key={u} className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> {u}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FEATURES ─── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
            Everything you need to study smarter
          </h2>
          <p className="text-gray-400 text-base max-w-md">
            Powerful tools designed specifically for student collaboration and success.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-orange-200 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
              Start studying together in minutes
            </h2>
            <p className="text-gray-400 text-base">Three simple steps to find your perfect study group.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              { step: "01", title: "Create your profile", desc: "Add your subjects, availability, and study preferences to get personalized matches.", icon: BookOpen },
              { step: "02", title: "Find your match", desc: "Browse groups or let our AI find the perfect match based on your profile.", icon: Target },
              { step: "03", title: "Start learning", desc: "Join sessions, chat with peers, track your progress, and ace your exams.", icon: Sparkles },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mb-5">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Loved by students everywhere
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-6 italic">"{t.content}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-orange-500 rounded-3xl p-16 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/10 rounded-full" />
          <p className="text-xs text-orange-200 uppercase tracking-widest font-medium mb-3 relative z-10">Get started today</p>
          <h2 className="text-3xl font-bold text-white mb-3 relative z-10">Ready to study smarter?</h2>
          <p className="text-orange-100 mb-8 relative z-10">Join thousands of students already finding their perfect study groups.</p>
          <div className="flex gap-3 justify-center flex-wrap relative z-10">
            <button
              onClick={() => navigate("/signup")}
              className="bg-white text-orange-500 font-semibold px-7 py-3 rounded-xl text-sm hover:bg-orange-50 transition-colors"
            >
              Create free account
            </button>
            <button className="bg-white/15 border border-white/30 text-white font-medium px-7 py-3 rounded-xl text-sm hover:bg-white/20 transition-colors flex items-center gap-2">
              Browse groups <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-orange-500 font-semibold">
            <BookOpen className="h-4 w-4" /> StudyHub
          </div>
          <div className="flex gap-6">
            {["Features", "How it works", "Privacy", "Terms"].map((l) => (
              <a key={l} href="#" className="text-sm text-gray-400 hover:text-gray-600">{l}</a>
            ))}
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} StudyHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;