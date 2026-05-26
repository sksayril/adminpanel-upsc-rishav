"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { signupSimulate } = useAuth();

  // Input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status states
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password strength meter utility
  const getPasswordStrength = () => {
    if (!password) return { text: "", color: "bg-slate-200", width: "w-0" };
    if (password.length < 6) return { text: "Weak", color: "bg-rose-500", width: "w-1/3" };
    if (password.length < 10) return { text: "Good", color: "bg-amber-400", width: "w-2/3" };
    return { text: "Strong", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = getPasswordStrength();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validations
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signupSimulate(name, email, password);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1800);
    } catch (err) {
      setError("Account creation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#42169B] via-[#5113C2] to-[#1D084F] overflow-hidden px-4 select-none">
      {/* 1. Animated Ambient Spheres in Background */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-float-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl animate-float-2 pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl animate-float-1 pointer-events-none" />

      {/* 2. Signup Card */}
      <div className="w-full max-w-md bg-white/95 rounded-[2.5rem] border border-white/20 premium-shadow p-8 md:p-10 relative overflow-hidden backdrop-blur-md animate-slide-up z-10">
        
        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8 animate-fade-in">
            {/* Glowing success circle */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse-glow" />
              <svg className="w-20 h-20 text-emerald-500" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25" fill="none" className="stroke-emerald-100" strokeWidth="2" />
                <path
                  fill="none"
                  className="stroke-emerald-500 animate-checkmark"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mt-6 tracking-tight">Account Created!</h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">Setting up your space...</p>
          </div>
        )}

        {/* Brand / Title Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF6B6B] to-[#FF8E53] flex items-center justify-center font-black text-xl text-white shadow-md mb-3">
            L
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-400 font-semibold tracking-wide mt-1.5 uppercase">
            Get started for free
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl px-4 py-2.5 animate-shake">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">
              Full Name
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={isSubmitting}
                className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-2xl pl-12 pr-4 py-3.5 focus:bg-white focus:border-[#5113C2] focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 shadow-inner disabled:opacity-70"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                disabled={isSubmitting}
                className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-2xl pl-12 pr-4 py-3.5 focus:bg-white focus:border-[#5113C2] focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 shadow-inner disabled:opacity-70"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-2xl pl-12 pr-12 py-3.5 focus:bg-white focus:border-[#5113C2] focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 shadow-inner disabled:opacity-70"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator Visualizer */}
          {password && (
            <div className="flex flex-col gap-1.5 px-1">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                <span>Password Strength</span>
                <span className={strength.text === "Weak" ? "text-rose-500" : strength.text === "Good" ? "text-amber-500" : "text-emerald-500"}>
                  {strength.text}
                </span>
              </div>
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`} />
              </div>
            </div>
          )}

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 pl-1 mt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              disabled={isSubmitting}
              className="w-4.5 h-4.5 rounded border-slate-200 accent-[#5113C2] cursor-pointer mt-0.5"
            />
            <label htmlFor="terms" className="text-[9px] leading-relaxed font-bold text-slate-400 uppercase select-none cursor-pointer">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#F5C518] hover:bg-[#E5B612] text-[#42169B] font-extrabold text-xs py-4 px-6 rounded-2xl shadow-md transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-75"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-[#42169B]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>SIGN UP</span>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-[#5113C2] hover:text-[#7B3FE4] font-extrabold transition-colors outline-none cursor-pointer"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
