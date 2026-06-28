import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Loader2Icon, BookOpen, Users, Star, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";

const perks = [
  "Smart study group matching",
  "Real-time session scheduling",
  "Built-in chat & collaboration",
  "Progress & attendance tracking",
];

export default function SignupPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const validatePassword = password => {
    const errors = [];
    if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter required.");
    if (!/[0-9]/.test(password)) errors.push("At least one number required.");
    if (password.length < 8) errors.push("Minimum 8 characters required.");
    return errors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSigningUp(true);

    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      toast.error("Registration failed", "Please fill in all required fields");
      setIsSigningUp(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Registration failed", "Password doesn't match");
      setIsSigningUp(false);
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      toast.error("Password invalid", passwordErrors[0]);
      setIsSigningUp(false);
      return;
    }

    try {
      const result = await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        username: username || email.split("@")[0],
      });

      if (result.success) {
        toast.success("Registration successful!", "Redirecting to login...");
        navigate("/login");
      } else {
        if (result.error?.detail) toast.error(result.error.detail);
        else if (result.error?.non_field_errors) toast.error(result.error.non_field_errors[0]);
        else if (result.error?.email) toast.error(result.error.email[0]);
        else toast.error("Registration failed", "Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Unexpected error", "An unexpected error occurred during registration.");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleGoogleSuccess = async credentialResponse => {
    const token = credentialResponse.credential;
    const result = await loginWithGoogle(token);
    if (result.success) {
      toast.success(`Welcome ${result.user?.username || "back"}!`, "Let's continue to grind");
      navigate("/");
    } else {
      toast.error(result.error?.detail || "Google login failed.");
    }
  };

  const handleGoogleError = () => {
    toast.error("Google error", "Google login was cancelled or failed.");
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
        className="absolute w-[300px] h-[300px] rounded-full blur-2xl opacity-20"
        style={{ background: "#fff7ed", top: "30%", right: "20%" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Card ── */}
      <motion.div
        className="relative z-10 w-full max-w-4xl mx-4 my-8"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
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
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
                  <p className="text-sm text-gray-400">Join thousands of students studying smarter</p>
                </div>

                {/* Email */}
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

                {/* First + Last name */}
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First name
                    </FieldLabel>
                    <Input
                      id="firstName"
                      type="text"
                      required
                      className="mt-1.5 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                      onChange={e => setFirstName(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last name
                    </FieldLabel>
                    <Input
                      id="lastName"
                      type="text"
                      required
                      className="mt-1.5 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                      onChange={e => setLastName(e.target.value)}
                    />
                  </Field>
                </div>

                {/* Username */}
                <Field>
                  <FieldLabel htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    required
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                    onChange={e => setUsername(e.target.value)}
                  />
                </Field>

                {/* Password + Confirm */}
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      required
                      className="mt-1.5 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                      onChange={e => setPassword(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                      Confirm password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      required
                      className="mt-1.5 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </Field>
                </div>
                <p className="text-xs text-gray-400 -mt-1">
                  Min. 8 characters, one uppercase letter and one number.
                </p>

                {/* Submit */}
                <Button
                  type={isSigningUp ? "button" : "submit"}
                  disabled={isSigningUp}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-5 font-medium shadow-md shadow-orange-200 transition-all mt-1"
                >
                  {isSigningUp ? (
                    <>
                      <Loader2Icon className="animate-spin w-4 h-4 mr-2" />
                      Creating account…
                    </>
                  ) : (
                    "Create free account"
                  )}
                </Button>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-white text-gray-400 text-xs">
                  or continue with
                </FieldSeparator>

                <Field className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    shape="rectangular"
                    size="large"
                    text="signup_with"
                    width="100%"
                  />
                </Field>

                <p className="text-center text-sm text-gray-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-orange-500 font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </FieldGroup>
            </form>

            {/* ── Right decorative side ── */}
            <div className="relative hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 p-10 overflow-hidden">
              {/* Inner blobs */}
              <div className="absolute w-56 h-56 bg-white/10 rounded-full -top-16 -right-16" />
              <div className="absolute w-40 h-40 bg-white/10 rounded-full -bottom-10 -left-10" />

              <div className="relative z-10 text-center w-full">
                <motion.div
                  className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/30"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BookOpen className="h-8 w-8 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                  Your study journey<br />starts here
                </h2>
                <p className="text-orange-100 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
                  Join 12,000+ students already finding their perfect study groups and improving their grades.
                </p>

                {/* Perks list */}
                <div className="flex flex-col gap-3 text-left mb-8">
                  {perks.map((perk) => (
                    <div key={perk} className="flex items-center gap-3 bg-white/15 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm">
                      <CheckCircle2 className="h-4 w-4 text-white flex-shrink-0" />
                      <span className="text-white text-sm">{perk}</span>
                    </div>
                  ))}
                </div>

                {/* Social proof */}
                <div className="flex items-center justify-center gap-2">
                  <div className="flex">
                    {["S", "M", "E", "R"].map((l, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-600 text-xs font-semibold bg-white"
                        style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 4 - i }}
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                  <span className="text-orange-100 text-xs">+12,000 students joined</span>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Terms */}
        <p className="text-center text-white/60 text-xs mt-5">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-white/80 hover:text-white underline underline-offset-2">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-white/80 hover:text-white underline underline-offset-2">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}