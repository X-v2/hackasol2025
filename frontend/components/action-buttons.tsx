"use client"

import { WalletProtection } from "@/components/wallet-protection"
import { ShoppingCart, Gavel, ListPlus } from 'lucide-react'

interface ActionButtonsProps {
  onBuy: () => void
  onBid: () => void
  onList: () => void
  onAuction: () => void
}

export function ActionButtons({ onBuy, onBid, onList, onAuction }: ActionButtonsProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-bold text-sm sm:text-lg text-amber-300 mb-3">Quick Actions</h3>
      
      <WalletProtection action="buy">
        <button
          onClick={onBuy}
          className="w-full px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg font-semibold text-white text-xs sm:text-sm hover:shadow-lg hover:shadow-amber-500/50 transition-all active:scale-95"
        >
          <ShoppingCart className="w-4 h-4 inline mr-2" /> Buy Now
        </button>
      </WalletProtection>

      <WalletProtection action="bid">
        <button
          onClick={onBid}
          className="w-full px-4 py-2 bg-slate-800/50 border border-red-700/50 rounded-lg text-xs sm:text-sm font-semibold hover:border-red-600 transition-all active:scale-95"
        >
          <Gavel className="w-4 h-4 inline mr-2" /> Place Bid
        </button>
      </WalletProtection>

      <WalletProtection action="sell">
        <button
          onClick={onList}
          className="w-full px-4 py-2 bg-slate-800/50 border border-red-700/50 rounded-lg text-xs sm:text-sm font-semibold hover:border-red-600 transition-all active:scale-95"
        >
          <ListPlus className="w-4 h-4 inline mr-2" /> List for Sale
        </button>
      </WalletProtection>

      <WalletProtection action="auction">
        <button
          onClick={onAuction}
          className="w-full px-4 py-2 bg-slate-800/50 border border-red-700/50 rounded-lg text-xs sm:text-sm font-semibold hover:border-red-600 transition-all active:scale-95"
        >
          🎯 Create Auction
        </button>
      </WalletProtection>
    </div>
  )
}
