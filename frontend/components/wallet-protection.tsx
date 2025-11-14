"use client"

import { useAuth } from "@/lib/auth-context"
import { AlertCircle } from 'lucide-react'

interface WalletProtectionProps {
  children: React.ReactNode
  action: "buy" | "bid" | "auction" | "sell" | "mint"
  fallback?: React.ReactNode
}

export function WalletProtection({ children, action, fallback }: WalletProtectionProps) {
  const { user } = useAuth()

  if (!user) {
    const actionText = {
      buy: "Purchase racers",
      bid: "Place bids",
      auction: "Create auctions",
      sell: "List for sale",
      mint: "Mint NFTs",
    }

    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="bg-red-900/20 border border-red-700/50 p-4 rounded-lg flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-300">Wallet Connection Required</p>
          <p className="text-xs text-red-300/80 mt-1">
            Connect your MetaMask wallet to {actionText[action]}.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
