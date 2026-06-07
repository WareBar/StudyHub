import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2Icon, BookOpen, Sparkles, Users, TrendingUp } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useToast } from "@/hooks/useToast";
import { motion } from "framer-motion";

const floatingBadges = [
  { icon: Users, label: "12,400+ students", top: "12%", left: "6%", delay: 0 },
  { icon: TrendingUp, label: "↑ 34% grade boost", top: "55%", left: "4%", delay: 0.3 },
  { icon: Sparkles, label: "Smart matching", top: "78%", left: "10%", delay: 0.6 },
];

export default function LoginPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLogging(true);

    const result = await login(email, password);
    if (result.success) {
      toast.success("Login successful!", "Let's be productive today and study");
      navigate("/dashboard");
    } else {
      if (result.error.detail) {
        toast.error(result.error.detail);
      } else if (result.error.non_field_errors) {
        toast.error(result.error.non_field_errors[0]);
      } else {
        toast.error("Login failed", "Please check your credentials");
      }
      setIsLogging(false);
    }

    setIsLogging(false);
  };

  const handleGoogleSuccess = async credentialResponse => {
    const token = credentialResponse.credential;
    const result = await loginWithGoogle(token);
    if (result.success) {
      toast.success(`Welcome ${result.user?.username || "back"}!`, "Let's continue to be awesome");
      navigate("/");
    } else {
      toast.error(result.error?.detail || "Google login failed", "Please try again!");
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login was cancelled or failed", "Please try again!");
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-orange-500">

      {/* ── Blobs ── */}
      <motion.div
        className="absolute w-[520px] h-[520px] rounded-full blur-3xl opacity-40"
        style={{ background: "#fb923c", top: "-140px", left: "-140px" }}
        animate={{ scale: [1, 1.12, 1], x: [0, 20, 0], y: [0, 16, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
        style={{ background: "#c2410c", bottom: "-100px", right: "-80px" }}
        animate={{ scale: [1, 1.1, 1], x: [0, -18, 0], y: [0, -14, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[280px] h-[280px] rounded-full blur-2xl opacity-20"
        style={{ background: "#fff7ed", top: "40%", left: "50%", transform: "translate(-50%,-50%)" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Floating badges (decorative) ── */}
      {floatingBadges.map(({ icon: Icon, label, top, left, delay }) => (
        <motion.div
          key={label}
          className="absolute hidden lg:flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium px-3 py-2 rounded-full shadow-sm"
          style={{ top, left }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: [0, -5, 0] }}
          transition={{ delay, duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          <Icon className="h-3.5 w-3.5 opacity-80" />
          {label}
        </motion.div>
      ))}

      {/* ── Card ── */}
      <motion.div
        className="relative z-10 w-full max-w-4xl mx-4"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo above card */}
        <div
          className="flex items-center justify-center gap-2 mb-6 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-orange-500" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">StudyHub</span>
        </div>

        <Card className="overflow-hidden p-0 shadow-2xl border-0">
          <CardContent className="grid p-0 md:grid-cols-2">

            {/* ── Form side ── */}
            <form className="p-8 md:p-10 bg-white" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col gap-1 mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
                  <p className="text-sm text-gray-400">Sign in to continue your study sessions</p>
                </div>

                <Field>
                  <FieldLabel htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    required
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                    onChange={e => setEmail(e.target.value)}
                  />
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </FieldLabel>
                    <a href="#" className="text-xs text-orange-500 hover:text-orange-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                    onChange={e => setPassword(e.target.value)}
                  />
                </Field>

                <Field>
                  <Button
                    type={isLogging ? "button" : "submit"}
                    disabled={isLogging}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-5 font-medium shadow-md shadow-orange-200 transition-all"
                  >
                    {isLogging ? (
                      <>
                        <Loader2Icon className="animate-spin w-4 h-4 mr-2" />
                        Signing in…
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-white text-gray-400 text-xs">
                  or continue with
                </FieldSeparator>

                <Field className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    shape="rectangular"
                    size="large"
                    text="signin_with"
                    width="100%"
                  />
                </Field>

                <p className="text-center text-sm text-gray-400 mt-2">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="text-orange-500 font-medium hover:underline"
                  >
                    Sign up free
                  </button>
                </p>
              </FieldGroup>
            </form>

            {/* ── Right decorative side ── */}
            <div className="relative hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 p-10 overflow-hidden">
              {/* Inner blobs */}
              <div className="absolute w-56 h-56 bg-white/10 rounded-full -top-16 -right-16" />
              <div className="absolute w-40 h-40 bg-white/10 rounded-full -bottom-10 -left-10" />

              {/* Content */}
              <div className="relative z-10 text-center">
                <motion.div
                  className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/30"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BookOpen className="h-8 w-8 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                  Study smarter,<br />together
                </h2>
                <p className="text-orange-100 text-sm leading-relaxed mb-8 max-w-xs">
                  Connect with classmates, form study groups, and collaborate in real-time with smart matching.
                </p>

                {/* Mini stat cards */}
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Active students", value: "12,400+" },
                    { label: "Avg grade improvement", value: "↑ 34%" },
                    { label: "Sessions this week", value: "3,200+" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between bg-white/15 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm"
                    >
                      <span className="text-orange-100 text-xs">{label}</span>
                      <span className="text-white font-bold text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Terms below card */}
        <p className="text-center text-white/60 text-xs mt-5">
          By signing in, you agree to our{" "}
          <a href="#" className="text-white/80 hover:text-white underline underline-offset-2">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-white/80 hover:text-white underline underline-offset-2">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}