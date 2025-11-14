"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, Wallet, ArrowRight } from 'lucide-react'

export default function VerificationPage() {
  const [userName, setUserName] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [verificationStep, setVerificationStep] = useState<"pending" | "verified" | "error">("pending")

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Racer"
    const wallet = localStorage.getItem("userWallet") || "0xConnecting..."
    setUserName(name)
    setWalletAddress(wallet)

    // Simulate verification process
    const timer = setTimeout(() => {
      setVerificationStep("verified")
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

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
        {verificationStep === "pending" && (
          <div className="bg-gradient-to-br from-slate-900/80 to-red-900/30 border border-red-700/50 rounded-2xl p-8 space-y-8 backdrop-blur-sm text-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-amber-500 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-lg shadow-red-500/50 mx-auto mb-6 animate-pulse">
                🏎️
              </div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300 mb-2">
                Verifying Account
              </h1>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-red-700/30 space-y-3">
                <div className="flex items-center gap-3 justify-center">
                  <div className="w-4 h-4 bg-amber-400 rounded-full animate-bounce" />
                  <p className="text-sm text-slate-300">Connecting to blockchain...</p>
                </div>

                <div className="text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                    <span className="text-slate-400">Name</span>
                    <span className="text-amber-300 font-semibold">{userName}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                    <span className="text-slate-400">Wallet</span>
                    <span className="text-red-300 font-mono">{walletAddress}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Wallet detected
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  Verifying credentials
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-2 h-2 bg-slate-700 rounded-full" />
                  Preparing dashboard
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400">This may take a moment...</p>
          </div>
        )}

        {verificationStep === "verified" && (
          <div className="bg-gradient-to-br from-slate-900/80 to-red-900/30 border border-red-700/50 rounded-2xl p-8 space-y-8 backdrop-blur-sm text-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-lg shadow-green-500/50 mx-auto mb-6">
                ✓
              </div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-2">
                Verified!
              </h1>
              <p className="text-sm text-slate-400">Your profile is ready</p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-green-700/30 space-y-4">
              <div className="flex items-center gap-3 justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-sm text-slate-300">Account verified successfully</p>
              </div>

              <div className="space-y-3 text-left">
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Racer Name</p>
                  <p className="text-lg font-bold text-amber-300">{userName}</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Wallet Address</p>
                  <p className="text-sm font-mono text-red-300 break-all">{walletAddress}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-green-500/50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {verificationStep === "error" && (
          <div className="bg-gradient-to-br from-slate-900/80 to-red-900/30 border border-red-700/50 rounded-2xl p-8 space-y-6 backdrop-blur-sm text-center">
            <div className="w-16 h-16 bg-red-600/20 border border-red-600/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-red-400">Verification Failed</h1>
            <p className="text-sm text-slate-400">Please try again or contact support</p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-red-500/50 transition-all active:scale-95"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
