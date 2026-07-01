"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, FormEvent } from "react";
import { Mail, Lock, User, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { AnimatedInput } from "./AnimatedInput";
import { cn } from "@/lib/utils";

export function AuthCard() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.includes("@")) newErrors.email = "Please enter a valid email address.";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (!isLogin && name.length < 2) newErrors.name = "Name must be at least 2 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSuccess(true);

    // Reset after success
    setTimeout(() => {
      setIsSuccess(false);
      if (!isLogin) setIsLogin(true); // Switch to login after successful register
      setEmail("");
      setPassword("");
      setName("");
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
      className="relative z-10 w-full max-w-[420px] sm:max-w-[460px] mx-auto px-4 sm:px-0"
    >
      <motion.div
        className={cn(
          "relative w-full rounded-[24px] border border-white/20 dark:border-white/10 bg-card/80 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-200",
          "hover:shadow-primary/10 hover:shadow-2xl hover:border-white/30 dark:hover:border-white/20",
          isTyping && "bg-card/90"
        )}
      >
        {/* Glow effect when typing */}
        <div
          className={cn(
            "absolute inset-0 bg-primary/5 blur-2xl transition-opacity duration-500",
            isTyping ? "opacity-100" : "opacity-0"
          )}
        />

        <div className="relative p-8 sm:p-10 flex flex-col gap-6" style={{ transform: "translateZ(30px)" }}>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {isLogin
                ? "Enter your credentials to access your workspace."
                : "Enter your details to get started with your new account."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <AnimatedInput
                        label="Full Name"
                        type="text"
                        icon={<User size={18} />}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setIsTyping(true);
                          setErrors((prev) => ({ ...prev, name: "" }));
                        }}
                        onBlur={() => setIsTyping(false)}
                        error={errors.name}
                        disabled={isLoading}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatedInput
                  label="Email Address"
                  type="email"
                  icon={<Mail size={18} />}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsTyping(true);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  onBlur={() => setIsTyping(false)}
                  error={errors.email}
                  disabled={isLoading}
                />

                <AnimatedInput
                  label="Password"
                  type="password"
                  icon={<Lock size={18} />}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setIsTyping(true);
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  onBlur={() => setIsTyping(false)}
                  error={errors.password}
                  disabled={isLoading}
                />

                <AnimatePresence>
                  {isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-end overflow-hidden"
                    >
                      <button
                        type="button"
                        className="text-sm font-medium text-primary hover:underline hover:text-primary-hover transition-colors"
                      >
                        Forgot password?
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300",
                    "hover:bg-primary-hover hover:shadow-primary/50",
                    isLoading && "opacity-80 cursor-not-allowed",
                    isTyping && "animate-pulse" // Subtle pulse while typing
                  )}
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? "Sign in" : "Sign up"}</span>
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </motion.button>

                <div className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                    }}
                    className="font-medium text-primary hover:underline hover:text-primary-hover transition-colors"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="rounded-full bg-green-500/10 p-3 text-green-500"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <h3 className="text-xl font-bold">Successfully authenticated!</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                    Redirecting to your workspace...
                  </p>
                </motion.div>

                {/* Soft success radial glow */}
                <div className="absolute inset-0 bg-green-500/10 blur-[60px] rounded-full pointer-events-none" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
