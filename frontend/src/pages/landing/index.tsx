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
    icon: Sparkles,
    title: "Smart Notifications",
    description: "Never miss a session with timely reminders and updates.",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Computer Science, Stanford",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    content:
      "StudyMate helped me find an amazing study group for algorithms. We went from struggling to acing our finals!",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Pre-Med, UCLA",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus",
    content:
      "The scheduling feature is a lifesaver. No more endless group chats trying to find a time that works!",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Business, NYU",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    content:
      "I love how easy it is to find groups for my exact subjects. The match percentage feature is genius!",
    rating: 5,
  },
];

const HomePage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();



  return (
    <div className="relative min-h-screen bg-linear-to-b from-orange-50 via-white to-orange-50 overflow-hidden">
      {/* Auth */}
      <div className="fixed w-full z-50">
        {isLoading ? (
          <div className="flex items-center space-x-2 text-orange-700">
            <Loader2Icon className="animate-spin h-5 w-5" />
            <span>Loading...</span>
          </div>
        ) : user ? (
          <UserProfile user={user} variant="landing" />
        ) : (
          <Navbar />
        )}
      </div>

      {/* Soft Background Blobs (Subtle) */}
      <motion.div
        className="absolute w-[500px] h-[500px] bg-orange-200 rounded-full blur-3xl opacity-40 -top-40 -left-40"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] bg-orange-300 rounded-full blur-3xl opacity-30 bottom-0 right-0"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity }}
      />

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-8">
        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl md:text-6xl font-extrabold text-orange-600 tracking-tight"
        >
          StudyHub
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 max-w-3xl text-lg md:text-l text-orange-700"
        >
          A peer-to-peer study platform where students connect, collaborate, and learn better
          together. Connect with classmates, form study groups, and ace your exams together.
          Smart matching based on subjects, schedule, and learning style.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 flex gap-4"
        >
          <Button
            onClick={() => navigate("/signup")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-xl text-lg shadow-lg"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            className="border-orange-500 text-orange-600 px-8 py-6 rounded-xl text-lg hover:bg-orange-50"
          >
            Browse Groups
          </Button>
        </motion.div>

        {/* Hero Image */}

        <div className="md:w-1/2 flex justify-center">
          <BooksIllustration />
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Smart Group Matching",
              desc: "Find the right study group based on subject, schedule, and skill level.",
            },
            {
              title: "Real-Time Collaboration",
              desc: "Chat, share files, and organize sessions in one place.",
            },
            {
              title: "Progress Tracking",
              desc: "Track attendance, participation, and study consistency.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold text-orange-600 mb-3">{item.title}</h3>
              <p className="text-orange-700">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="soft" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Study Smarter
            </h2>
            <p className="text-muted-foreground text-lg">
              Powerful tools designed specifically for student collaboration and success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="soft" className="mb-4">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start Studying Together in Minutes
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to find your perfect study group.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description: "Add your subjects, availability, and study preferences.",
                icon: BookOpen,
              },
              {
                step: "02",
                title: "Find Your Match",
                description: "Browse groups or let our AI find the perfect match for you.",
                icon: Target,
              },
              {
                step: "03",
                title: "Start Learning",
                description: "Join sessions, chat with peers, and track your progress.",
                icon: Sparkles,
              },
            ].map((item, index) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow mb-6">
                  <item.icon className="h-10 w-10" />
                </div>
                <span className="text-sm font-semibold text-primary mb-2">{item.step}</span>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="soft" className="mb-4">
              Testimonials
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by Students Everywhere
            </h2>
            <p className="text-muted-foreground text-lg">
              See what students are saying about their StudyMate experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(testimonial => (
              <Card key={testimonial.name} variant="elevated" className="p-6">
                <CardContent className="p-0">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-10 w-10 rounded-full bg-muted"
                    />
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-orange-100 py-6 text-center text-orange-700">
        © {new Date().getFullYear()} StudyHub. All rights reserved.
      </footer>
    </div>
  );
};

const BooksIllustration = () => (
  <motion.svg
    viewBox="0 0 600 400"
    className="w-full max-w-lg mx-auto"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ y: 0 }}
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
  >
    {/* Soft background */}
    <ellipse cx="300" cy="260" rx="200" ry="70" fill="#FFF3E0" />

    {/* Shadow */}
    <ellipse cx="300" cy="280" rx="140" ry="22" fill="#000" opacity="0.05" />

    {/* Book base (left) */}
    <polygon points="180,170 300,210 300,260 180,220" fill="#FFB74D" />

    {/* Book base (right) */}
    <polygon points="300,210 420,170 420,220 300,260" fill="#FFA726" />

    {/* Pages left */}
    <polygon points="190,165 300,205 300,215 190,175" fill="#FFF8E1" />

    {/* Pages right */}
    <polygon points="300,205 410,165 410,175 300,215" fill="#FFF3E0" />

    {/* Animated page flip */}
    <motion.polygon
      points="300,205 380,175 380,185 300,215"
      fill="#FFFFFF"
      animate={{
        opacity: [0.6, 1, 0.6],
        skewX: [0, -6, 0],
      }}
      transition={{
        duration: 2.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />

    {/* Book spine */}
    <rect x="295" y="205" width="10" height="55" rx="4" fill="#FB8C00" />

    {/* Knowledge particles */}
    <motion.circle
      cx="260"
      cy="130"
      r="5"
      fill="#FFCC80"
      animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <motion.circle
      cx="300"
      cy="115"
      r="4"
      fill="#FFA726"
      animate={{ y: [0, -25, 0], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 3.5, repeat: Infinity }}
    />
    <motion.circle
      cx="340"
      cy="130"
      r="5"
      fill="#FFB74D"
      animate={{ y: [0, -18, 0], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2.8, repeat: Infinity }}
    />

    {/* Focus rays */}
    <motion.line
      x1="300"
      y1="90"
      x2="300"
      y2="65"
      stroke="#FFCC80"
      strokeWidth="3"
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.line
      x1="330"
      y1="100"
      x2="350"
      y2="75"
      stroke="#FFB74D"
      strokeWidth="3"
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 2.6, repeat: Infinity }}
    />
  </motion.svg>
);
export default HomePage;
