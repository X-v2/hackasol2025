"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle, Loader2 } from 'lucide-react'

export function WalletLoginModal() {
  const { connectWallet, isConnecting, disconnectWallet, user } = useAuth()
  const [error, setError] = useState("")

  const handleConnect = async () => {
    setError("")
    try {
      await connectWallet()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    }
  }

  const handleDisconnect = () => {
    console.log("[v0] Disconnect button clicked, user:", user)
    disconnectWallet()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-red-700/30 w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500/30 to-orange-600/30 border-2 border-orange-500/50 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
              <div className="text-4xl">🦊</div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                {user ? "Wallet Connected" : "Connect Your Wallet"}
              </h2>
              <p className="text-sm text-slate-400">
                {user ? `Connected as ${user.name}` : "Sign in with MetaMask to access exclusive features"}
              </p>
            </div>
          </div>

          {/* Features or Connected State */}
          {!user ? (
            <div className="bg-gradient-to-b from-red-900/20 to-slate-900/40 border border-red-700/30 p-4 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-amber-300 mb-3">Browse Without Wallet:</p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> View all racers & prices
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Check live races & rankings
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> View trade history
                </li>
              </ul>

              <div className="border-t border-slate-700/30 pt-3 mt-3">
                <p className="text-sm font-semibold text-red-300 mb-3">Wallet Required For:</p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400">•</span> Buy & Sell Racers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400">•</span> Place Bets
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400">•</span> Create Auctions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400">•</span> Mint New NFTs
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-b from-green-900/20 to-slate-900/40 border border-green-700/30 p-4 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-green-400 mb-3">✓ Connected Account</p>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/30">
                <p className="text-xs text-slate-400 mb-1">Address:</p>
                <p className="text-sm font-mono text-green-400 break-all">{user.address}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/50 p-3 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {/* Connect/Disconnect Button */}
          {!user ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl font-bold text-white hover:shadow-xl hover:shadow-orange-500/40 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>🦊</span>
                  <span>Connect MetaMask</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 rounded-xl font-bold text-white hover:shadow-xl hover:shadow-red-500/40 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
            >
              <span>🔌</span>
              <span>Disconnect Wallet</span>
            </button>
          )}

          {/* Installation Info */}
          {!user && (
            <div className="border-t border-slate-700/30 pt-4 text-center space-y-2">
              <p className="text-xs text-slate-400">Don't have MetaMask?</p>
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-xs font-semibold hover:border-slate-500 transition-all text-slate-300"
              >
                Download MetaMask
              </a>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-slate-800/20 p-3 rounded-lg border border-slate-700/20 text-center">
            <p className="text-xs text-slate-500">
              🔒 Your private keys are never shared. Only MetaMask handles your credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
