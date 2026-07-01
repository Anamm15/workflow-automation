import { Metadata } from "next";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { AuthCard } from "./components/AuthCard";

export const metadata: Metadata = {
  title: "Authentication | Workspace",
  description: "Secure login for your workspace.",
};

export default function AuthPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden selection:bg-primary/30 selection:text-primary-hover">
      <AnimatedBackground />
      <AuthCard />
    </main>
  );
}
