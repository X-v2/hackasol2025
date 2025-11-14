"use client"

import { useState } from "react"
import { ArrowRight, Wallet, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from "next/link"

export default function SignupPage() {
  const [signupMethod, setSignupMethod] = useState<"metamask" | "email" | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMetamaskSignup = async () => {
    setLoading(true)
    // Simulate Metamask connection
    setTimeout(() => {
      const mockWallet = "0x" + Math.random().toString(16).slice(2, 10).toUpperCase() + "..." + Math.random().toString(16).slice(2, 6).toUpperCase()
      localStorage.setItem("userWallet", mockWallet)
      localStorage.setItem("userName", "New Racer")
      window.location.href = "/verify"
    }, 1500)
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      alert("Please fill in all fields")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    setLoading(true)
    // Simulate signup
    setTimeout(() => {
      localStorage.setItem("userName", formData.name)
      localStorage.setItem("userWallet", "0x" + Math.random().toString(16).slice(2, 10).toUpperCase() + "..." + Math.random().toString(16).slice(2, 6).toUpperCase())
      window.location.href = "/verify"
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(220, 38, 38, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 38, 38, 0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-amber-500 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-lg shadow-red-500/50 mx-auto mb-6">
            🏎️
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300 mb-2">
            TurboTradeX
          </h1>
          <p className="text-red-300 text-sm">Join the Racing Revolution</p>
        </div>

        {!signupMethod ? (
          <div className="bg-gradient-to-br from-slate-900/80 to-red-900/30 border border-red-700/50 rounded-2xl p-6 sm:p-8 space-y-4 backdrop-blur-sm">
            <p className="text-slate-300 text-center mb-6 text-sm sm:text-base">Choose your signup method</p>

            <button
              onClick={() => setSignupMethod("metamask")}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-orange-500/50 transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              <Wallet className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Sign up with MetaMask
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-red-700/30" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gradient-to-br from-slate-900/80 to-red-900/30 text-slate-400">OR</span>
              </div>
            </div>

            <button
              onClick={() => setSignupMethod("email")}
              className="w-full py-3 sm:py-4 bg-slate-800/60 border border-red-700/50 rounded-xl font-bold text-red-300 hover:border-red-600 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Sign up with Email
            </button>

            <div className="pt-4 text-center text-xs sm:text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-400 hover:text-amber-300 font-semibold">
                Login here
              </Link>
            </div>
          </div>
        ) : signupMethod === "metamask" ? (
          <div className="bg-gradient-to-br from-slate-900/80 to-red-900/30 border border-red-700/50 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-sm">
            <button
              onClick={() => setSignupMethod(null)}
              className="text-xs text-slate-400 hover:text-slate-300 mb-4"
            >
              ← Back
            </button>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-orange-600/20 border border-orange-600/50 rounded-full flex items-center justify-center mx-auto">
                <Wallet className="w-6 h-6 text-orange-400 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-amber-300">Create Account with MetaMask</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Connect your MetaMask wallet to create your racing profile
              </p>
            </div>

            <div className="bg-red-900/20 border border-red-700/30 p-4 rounded-lg text-xs text-red-300 space-y-2">
              <p className="font-semibold">Your account will include:</p>
              <ul className="space-y-1 text-slate-400">
                <li>• Unique racing profile</li>
                <li>• NFT racer ownership</li>
                <li>• On-chain trading capability</li>
              </ul>
            </div>

            <button
              onClick={handleMetamaskSignup}
              disabled={loading}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-orange-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Creating Account..." : "Create with MetaMask"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailSignup} className="bg-gradient-to-br from-slate-900/80 to-red-900/30 border border-red-700/50 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setSignupMethod(null)}
              className="text-xs text-slate-400 hover:text-slate-300 mb-4"
            >
              ← Back
            </button>

            <h2 className="text-xl font-bold text-amber-300">Create Account</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Racing Name"
                  className="w-full px-4 py-2 sm:py-3 bg-slate-900/50 border border-red-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2 sm:py-3 bg-slate-900/50 border border-red-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 sm:py-3 bg-slate-900/50 border border-red-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 sm:py-3 bg-slate-900/50 border border-red-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-red-600 to-amber-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-red-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>

            <div className="text-center text-xs sm:text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-400 hover:text-amber-300 font-semibold">
                Login here
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
