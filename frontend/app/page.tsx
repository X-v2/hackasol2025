"use client"

import { useEffect, useState } from "react"
import { Trophy, Flame, Activity, ArrowUp, ArrowDown, Star, TrendingUp, X, ShoppingCart, Gavel, Clock, ListPlus, AlertCircle, Info, Menu } from 'lucide-react'
import RaceViewer2D from "@/components/RaceViewer2D"
import { WalletLoginModal } from "@/components/wallet-login-modal"
import { useAuth } from "@/lib/auth-context"
import React from 'react';
import BettingPage from '@/components/betting-page';
import AuctionPage from '@/components/auction-page';
import { io, Socket } from "socket.io-client"

// Config and Interfaces
const SOCKET_URL = "http://localhost:3001";
interface Racer {
  id: number;
  name: string;
  distance: number;
  speed: number;
  rank: number;
  lapsCompleted: number;
  tyreWear: number;
  state: string;
  dnf: boolean;
  finished: boolean;
  price: number;
  provisionalPoints: number;
  bestLapMs: number | null;
}

interface RaceEvent {
  type: string;
  message?: string;
  track?: string;
  condition?: string;
  laps?: number;
  tick?: number;
  racerId?: number;
  lap?: number;
  lapMs?: number;
  newLeader?: number;
  [key: string]: any; // For other event properties
}

interface RaceConfig {
  track: string;
  condition: string;
  laps: number;
}


export default function Home() {
  const [userWallet, setUserWallet] = useState<string | null>(null)
  const [walletHolder, setWalletHolder] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const wallet = localStorage.getItem("userWallet")
    const holder = localStorage.getItem("walletHolder")

    if (wallet) {
      setUserWallet(wallet)
      setWalletHolder(holder)
    } else if (user) {
      setUserWallet(user.address)
      setWalletHolder(user.name)
      localStorage.setItem("userWallet", user.address)
      localStorage.setItem("walletHolder", user.name)
    }

    setIsReady(true)
  }, [user])

  if (!isReady) return null

  if (!userWallet && !showLoginModal) {
    return (
      <>
        <WalletLoginModal />
        <DashboardPage walletAddress={null} walletHolder={null} isWalletConnected={false} />
      </>
    )
  }

  return (
    <>
      {showLoginModal && <WalletLoginModal />}
      <DashboardPage walletAddress={userWallet} walletHolder={walletHolder} isWalletConnected={!!userWallet} />
    </>
  )
}

function WalletConnectionScreen() {
  const [walletLoading, setWalletLoading] = useState(false)

  const handleConnectMetamask = () => {
    setWalletLoading(true)
    setTimeout(() => {
      const mockWallet = "0x" + Math.random().toString(16).slice(2, 10).toUpperCase() + "..." + Math.random().toString(16).slice(2, 6).toUpperCase()
      const mockHolder = "Alex Racer"
      localStorage.setItem("userWallet", mockWallet)
      localStorage.setItem("walletHolder", mockHolder)
      window.location.reload()
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-900 text-slate-100 flex items-center justify-center p-4">
      {/* ... (Rest of WalletConnectionScreen JSX is unchanged) ... */}
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
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-amber-500 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-lg shadow-red-500/50 mx-auto mb-6">
            🏎️
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-400 to-amber-300 mb-2">
            TurboTradeX
          </h1>
          <p className="text-red-300 text-sm">Formula 1 × Wall Street × Web3</p>
        </div>

        <div className="bg-gradient-to-b from-slate-900/80 to-red-900/30 border border-red-700/50 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500/30 to-orange-600/30 border-2 border-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
              <div className="text-4xl">🦊</div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">MetaMask</h2>
              <p className="text-sm text-slate-400">Connect your wallet to TurboTradeX</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/30 text-center">
              <p className="text-2xl mb-1">🔐</p>
              <p className="text-xs font-semibold text-slate-300">Secure</p>
            </div>
            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/30 text-center">
              <p className="text-2xl mb-1">⚡</p>
              <p className="text-xs font-semibold text-slate-300">Fast</p>
            </div>
            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/30 text-center">
              <p className="text-2xl mb-1">🌍</p>
              <p className="text-xs font-semibold text-slate-300">Web3</p>
            </div>
          </div>

          <div className="bg-gradient-to-b from-red-900/20 to-slate-900/40 border border-red-700/30 p-4 rounded-xl space-y-3">
            <p className="text-sm font-semibold text-amber-300 mb-4">Connection Steps:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-orange-500/30 border border-orange-500 flex items-center justify-center text-xs font-bold text-orange-300 shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Verify MetaMask</p>
                  <p className="text-xs text-slate-400">Your wallet will be verified</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-orange-500/30 border border-orange-500 flex items-center justify-center text-xs font-bold text-orange-300 shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Confirm Identity</p>
                  <p className="text-xs text-slate-400">Sign message to prove ownership</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-orange-500/30 border border-orange-500 flex items-center justify-center text-xs font-bold text-orange-300 shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Start Trading</p>
                  <p className="text-xs text-slate-400">Access your NFT portfolio</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleConnectMetamask}
            disabled={walletLoading}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl font-bold text-white hover:shadow-xl hover:shadow-orange-500/40 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {walletLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>🦊</span>
                <span>Connect MetaMask</span>
              </>
            )}
          </button>

          <div className="border-t border-slate-700/30 pt-4 text-center space-y-2">
            <p className="text-xs text-slate-400">Don't have MetaMask installed?</p>
            <a
              href="https://metamask.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-xs font-semibold hover:border-slate-500 transition-all text-slate-300"
            >
              Download MetaMask
            </a>
          </div>

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

function DashboardPage({ walletAddress, walletHolder, isWalletConnected }: { walletAddress: string | null; walletHolder: string | null; isWalletConnected: boolean }) {
  // ... (existing states)
  const [selectedRacer, setSelectedRacer] = useState(8)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [listPrice, setListPrice] = useState("")
  const [auctionPrice, setAuctionPrice] = useState("")
  const [saleFilter, setSaleFilter] = useState("all")
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  
  // --- Live Data States ---
  const [leaderboard, setLeaderboard] = useState<Racer[]>([]);
  const [commentary, setCommentary] = useState<RaceEvent[]>([]);
  const [raceConfig, setRaceConfig] = useState<RaceConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTick, setCurrentTick] = useState(0);

  // ... (mock racePrices and positions state)
  const [racePrices, setRacePrices] = useState({ 8: 3400, 12: 4200, 3: 2800, 15: 3100, })
  const [positions, setPositions] = useState([ { id: 12, name: "ViperRacer", speed: 312, lapTime: "1:28.4", color: "#dc2626" }, { id: 8, name: "NeonDrift", speed: 308, lapTime: "1:28.7", color: "#f59e0b" }, { id: 3, name: "SteelFalcon", speed: 305, lapTime: "1:29.2", color: "#c0c0c0" }, ])

  // --- Socket Connection useEffect ---
  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected!");
      setIsConnected(true);
      setCommentary(prev => [{ type: 'local_connect', message: 'Connected to race server.' }, ...prev]);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected.");
      setIsConnected(false);
      setCommentary(prev => [{ type: 'local_disconnect', message: 'Disconnected from race server.' }, ...prev]);
    });

    // Listen for race start info
    socket.on("race_event", (event: RaceEvent) => {
      if (event.tick) setCurrentTick(event.tick);
      if (event.type === 'race_start') {
        setRaceConfig({
          track: event.track || 'Unknown',
          condition: event.condition || 'Unknown',
          laps: event.laps || 10,
        });
        setCurrentTick(event.tick || 0); // Reset tick on race start
        setCommentary(prev => [event, ...prev.filter(e => e.type.startsWith('local_'))].slice(0, 50));
      } else {
        setCommentary(prev => [event, ...prev].slice(0, 50));
      }
    });

    // Listen for live leaderboard updates
    socket.on("race_update", (data: { racers: Racer[], tick?: number }) => {
      setLeaderboard(data.racers);
      if (data.tick) setCurrentTick(data.tick);
    });

    // Listen for final results
    socket.on("race_finished", (data: { racers: Racer[], tick?: number }) => {
      setLeaderboard(data.racers);
      if (data.tick) setCurrentTick(data.tick);
      setCommentary(prev => [{ type: 'race_end', message: `Race finished! Winner: ${data.racers[0]?.name}` }, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ... (mock racePrices useEffect)
  useEffect(() => {
    const interval = setInterval(() => {
      setRacePrices((prev) => ({
        ...prev,
        8: Math.max(2000, prev[8] + (Math.random() - 0.5) * 100),
        12: Math.max(2500, prev[12] + (Math.random() - 0.5) * 120),
        3: Math.max(1800, prev[3] + (Math.random() - 0.5) * 80),
        15: Math.max(2000, prev[15] + (Math.random() - 0.5) * 90),
      }))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  // ... (handleDisconnectWallet function)
  const handleDisconnectWallet = () => {
    localStorage.removeItem("userWallet")
    localStorage.removeItem("walletHolder")
    window.location.reload()
  }

  // ... (mock racerData, saleListings, tradeHistory)
  const racerData = [ { id: 8, name: "NeonDrift", helmet: "🟠", speed: 88, grip: 76, aero: 72, price: racePrices[8], change: 7.8, wins: 9, rarity: "Legendary", team: "Ferrari Racing", championships: 3, }, { id: 12, name: "ViperRacer", helmet: "🔴", speed: 92, grip: 70, aero: 74, price: racePrices[12], change: 12.3, wins: 12, rarity: "Mythic", team: "Red Velocitas", championships: 5, }, { id: 3, name: "SteelFalcon", helmet: "⚪", speed: 85, grip: 82, aero: 88, price: racePrices[3], change: -3.2, wins: 7, rarity: "Epic", team: "Silver Arrow", championships: 2, }, { id: 15, name: "PhantomX", helmet: "🟡", speed: 87, grip: 79, aero: 81, price: racePrices[15], change: 5.4, wins: 6, rarity: "Rare", team: "Golden Apex", championships: 1, }, ]
  const saleListings = [ { id: 101, racer: "NeonDrift #8", seller: "0x7A3B...2C1F", price: 3600, listedAt: "2 hours ago", status: "active", bids: 5, }, { id: 102, racer: "ViperRacer #12", seller: "0x9E2D...4K8L", price: 4500, listedAt: "5 hours ago", status: "active", bids: 12, }, { id: 103, racer: "SteelFalcon #3", seller: "0x3F6E...9M2P", price: 2900, listedAt: "1 day ago", status: "ending", bids: 3, }, { id: 104, racer: "PhantomX #15", seller: "0xB4C9...7R5Q", price: 3250, listedAt: "12 hours ago", status: "active", bids: 8, }, ]
  const tradeHistory = [ { id: 1, racer: "NeonDrift #8", action: "Sold", price: 3200, date: "2 days ago", buyer: "0x1A2B...3C4D" }, { id: 2, racer: "ViperRacer #12", action: "Purchased", price: 3800, date: "1 week ago", buyer: "You" }, { id: 3, racer: "SteelFalcon #3", action: "Bid Placed", price: 2700, date: "3 days ago", buyer: "Pending" }, { id: 4, racer: "PhantomX #15", action: "Minted", price: 2500, date: "2 weeks ago", buyer: "Genesis" }, ]
  
  const selectedRacerData = racerData.find((r) => r.id === selectedRacer)

  // ... (renderModalContent function is unchanged)
  const renderModalContent = () => {
    if (!selectedRacerData) {
      return <div>Loading racer data...</div>;
    }

    switch (activeModal) {
      case "buy":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Buy Now — {selectedRacerData.name}
              </h3>
              <div className="bg-slate-900/60 p-4 rounded-lg border border-amber-700/50 space-y-3">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-slate-400">Seller</span>
                  <span className="font-mono text-amber-400 text-xs sm:text-sm">0x7A3B...2C1F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Price</span>
                  <span className="text-lg font-bold text-amber-300">${selectedRacerData.price.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Gas Fee</span>
                  <span className="text-red-300">0.05 ETH</span>
                </div>
                <div className="border-t border-amber-700/30 pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-amber-400">
                    ${(Number.parseFloat(selectedRacerData.price.toFixed(0)) + 150).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-amber-500/50 transition-all active:scale-95">
              Confirm Purchase
            </button>
          </div>
        )
      case "bid":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5" /> Place Bid — {selectedRacerData.name}
              </h3>
              <div className="bg-slate-900/60 p-4 rounded-lg border border-red-700/50 space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Bid</span>
                  <span className="font-bold text-red-300">${selectedRacerData.price.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Bids</span>
                  <span className="text-amber-300">8 bidders</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auction Ends</span>
                  <span className="text-red-300 font-semibold">2h 45m</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-300">Your Bid Amount (USDC)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Minimum: ${(selectedRacerData.price * 1.05).toFixed(0)} USDC`}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-red-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
                  />
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-red-500/50 transition-all active:scale-95">
              Place Bid
            </button>
          </div>
        )
      case "list":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <ListPlus className="w-5 h-5" /> List for Sale — {selectedRacerData.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-300">List Price (USDC)</label>
                  <input
                    type="number"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    placeholder={selectedRacerData.price.toFixed(0)}
                    className="w-full px-4 py-2 mt-1 bg-slate-900/50 border border-amber-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1">Market price: ${selectedRacerData.price.toFixed(0)}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-300">Duration</label>
                  <select className="w-full px-4 py-2 mt-1 bg-slate-900/50 border border-amber-600/50 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm">
                    <option>1 day</option>
                    <option>3 days</option>
                    <option>7 days</option>
                    <option>30 days</option>
                  </select>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-amber-500/50 transition-all active:scale-95">
              Create Listing
            </button>
          </div>
        )
      case "auction":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5" /> Create Auction — {selectedRacerData.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-300">Starting Price (USDC)</label>
                  <input
                    type="number"
                    value={auctionPrice}
                    onChange={(e) => setAuctionPrice(e.target.value)}
                    placeholder={Math.floor(selectedRacerData.price * 0.8).toFixed(0)}
                    className="w-full px-4 py-2 mt-1 bg-slate-900/50 border border-red-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-300">Duration</label>
                  <select className="w-full px-4 py-2 mt-1 bg-slate-900/50 border border-red-600/50 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm">
                    <option>6 hours</option>
                    <option>12 hours</option>
                    <option>24 hours</option>
                    <option>48 hours</option>
                    <option>7 days</option>
                  </select>
                </div>
                <div className="bg-red-900/20 border border-red-700/50 p-3 rounded-lg flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">
                    Auction format attracts competitive bidding and yields higher prices.
                  </p>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-red-500/50 transition-all active:scale-95">
              Start Auction
            </button>
          </div>
        )
      case "history":
        return (
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" /> Trade History
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {tradeHistory.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between bg-slate-800/30 p-3 rounded-lg border border-slate-700/30 hover:border-amber-600/50 transition-all text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{trade.racer}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${trade.action === "Purchased"
                          ? "bg-green-900/40 text-green-300"
                          : trade.action === "Sold"
                            ? "bg-red-900/40 text-red-300"
                            : "bg-amber-900/40 text-amber-300"
                          }`}
                      >
                        {trade.action}
                      </span>
                      <span className="text-xs text-slate-400">{trade.date}</span>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-bold text-amber-300 text-sm">${trade.price}</p>
                    <p className="text-xs text-slate-400">{trade.buyer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const formatTime = (ticks: number) => {
    const totalSeconds = ticks || 0; 
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // --- UPDATED: Emojis removed ---
  const formatEvent = (event: RaceEvent): string => {
    const getRacerName = (id?: number) => {
      if (id === undefined) return 'N/A';
      const racer = leaderboard.find(r => r.id === id);
      return racer ? racer.name : `Racer #${id}`;
    };

    switch (event.type) {
      case 'local_connect':
        return `${event.message}`;
      case 'local_disconnect':
        return `${event.message}`;
      case 'race_start':
        return `Race started: ${event.track} (${event.condition}), ${event.laps} laps`;
      case 'race_end':
        return `${event.message || 'Race has ended.'}`;
      case "lap_complete":
        return `Lap ${event.lap} for ${getRacerName(event.racerId)} (${((event.lapMs || 0) / 1000).toFixed(2)}s)`;
      case "lead_change":
        return `Lead change: ${getRacerName(event.newLeader)} is now P1!`;
      case 'fastest_lap_new':
        return `New Fastest Lap by ${getRacerName(event.racerId)}! (${((event.lapMs || 0) / 1000).toFixed(2)}s)`;
      case 'pit_in':
        return `PIT: ${getRacerName(event.racerId)} enters the pits.`;
      case 'pit_out':
        return `PIT: ${getRacerName(event.racerId)} exits the pits.`;
      case 'crash_dnf':
        return `DNF: ${getRacerName(event.racerId)} is out!`;
      case 'crash_pit':
        return `CRASH: ${getRacerName(event.racerId)} limps to the pits.`;
      case 'safety_car':
        return `SAFETY CAR DEPLOYED (Duration: ${event.duration} ticks)`;
      case 'safety_car_end':
        return 'SAFETY CAR ending this lap.';
      default:
        return `INFO: ${event.type}`;
    }
  };

  const getEventStyle = (type: string) => {
    if (type.startsWith('crash') || type === 'local_disconnect') return 'bg-red-900/50 text-red-300';
    if (type.startsWith('pit')) return 'bg-yellow-900/50 text-yellow-300';
    if (type.startsWith('safety')) return 'bg-amber-900/50 text-amber-300';
    if (type.startsWith('lead') || type === 'fastest_lap_new' || type === 'local_connect' || type === 'race_end') return 'bg-green-900/50 text-green-300';
    return 'bg-slate-800/40 border-amber-700/20';
  };

  // --- NEW: Helper function for rich status badges ---
  const getStatus = (racer: Racer) => {
    const baseClass = "text-xs font-semibold px-2.5 py-0.5 rounded-full";
    if (racer.dnf) {
      return <span className={`${baseClass} bg-red-900/40 text-red-300`}>DNF</span>;
    }
    if (racer.finished) {
      return <span className={`${baseClass} bg-blue-900/40 text-blue-300`}>Finished</span>;
    }
    switch (racer.state) {
      case 'pit_entry':
        return <span className={`${baseClass} bg-yellow-900/40 text-yellow-300`}>Pitting</span>;
      case 'in_pit':
        return <span className={`${baseClass} bg-yellow-900/40 text-yellow-300`}>In Pit</span>;
      case 'crashed_on_track':
        return <span className={`${baseClass} bg-red-900/40 text-red-300`}>Crashed</span>;
      case 'on_track':
      default:
        return <span className={`${baseClass} bg-green-900/40 text-green-300`}>On Track</span>;
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-900 text-slate-100">
      {/* ... (Background grid and Header are unchanged) ... */}
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

      <header className="relative z-20 border-b border-red-900/30 bg-slate-950/60 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-amber-500 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-red-500/50">
              T
            </div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-400 to-amber-300">
                TurboTradeX
              </h1>
              <p className="text-xs text-red-300">Formula 1 × Wall Street × Web3</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowWalletModal(true)}
              className="hidden sm:flex px-4 py-2 bg-slate-800/50 border border-red-700/50 rounded-lg text-xs hover:border-red-600 transition-all active:scale-95 items-center gap-2"
            >
              <span className="text-slate-300">Wallet</span>
              <div className="text-right">
                <div className="text-xs text-amber-400 font-mono">{walletAddress?.slice(0, 10)}...</div>
              </div>
            </button>
            <button
              onClick={() => alert('New racer minted successfully!')}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-500 rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all active:scale-95"
            >
              Mint
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Race Card */}Live Auctions
          <div className="lg:col-span-2 group relative bg-gradient-to-b from-red-900/20 to-slate-900/20 rounded-2xl border border-red-700/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-400 to-amber-300 flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></span> Live Race
                  </h2>
                  <p className="text-sm text-red-300 mt-2">
                    {raceConfig ? `${raceConfig.track.toUpperCase()} (${raceConfig.condition}) • Lap ${leaderboard[0]?.lapsCompleted || 0}/${raceConfig.laps}` : (isConnected ? 'Waiting for race...' : 'Disconnected')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-amber-400">{formatTime(currentTick)}</div>
                  <p className="text-xs text-red-300">Elapsed</p>
                </div>
              </div>
              <RaceViewer2D leaderboard={leaderboard} raceConfig={raceConfig} />
            </div>
          </div>

          {/* Live Commentary Card */}
          <div className="group relative bg-gradient-to-b from-amber-900/20 to-slate-900/20 rounded-2xl border border-amber-700/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-red-300">Live Commentary</h2>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
              </div>
              <div className="space-y-3 max-h-130 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-slate-800">
                {commentary.length === 0 && (
                  <div className="bg-slate-800/40 p-3 rounded-lg border border-amber-700/20">
                    <p className="text-sm text-slate-400 text-center">Waiting for race events...</p>
                  </div>
                )}
                {commentary.map((event, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getEventStyle(event.type)}`}>
                    <p className="text-sm">{formatEvent(event)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- UPDATED LEADERBOARD SECTION --- */}
        <div className="group relative bg-gradient-to-b from-red-900/20 to-slate-900/20 rounded-2xl border border-red-700/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-6 space-y-5">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-400 to-amber-300">Leaderboard</h2>

            {/* --- NEW: Header Row --- */}
            <div className="grid grid-cols-12 gap-4 px-3 text-xs font-semibold text-slate-400 uppercase">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-1 text-right">Speed</div>
              <div className="col-span-1 text-right">Tyre</div>
              <div className="col-span-1 text-right">Points</div>
              <div className="col-span-3 text-right">Price</div>
              <div className="col-span-2 text-center">Status</div>
            </div>

            {/* --- NEW: Body --- */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {leaderboard.length === 0 && (
                <div className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <p className="text-sm text-slate-400 text-center w-full">Waiting for race data...</p>
                </div>
              )}
              {leaderboard.map((racer) => (
                <div
                  key={racer.id}
                  className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg border transition-all ${
                    racer.rank === 1 ? 'bg-red-800/50 border-red-600' : 'bg-slate-800/30 border-slate-700/30'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1">
                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {racer.rank}
                    </div>
                  </div>
                  {/* Name & Laps */}
                  <div className="col-span-3 flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{racer.name}</p>
                    <p className="text-xs text-slate-500">Lap {racer.lapsCompleted}/{raceConfig?.laps || '10'}</p>
                  </div>
                  {/* Speed */}
                  <div className="col-span-1 text-right">
                    <p className="text-amber-300 text-sm font-semibold">{racer.finished || racer.dnf ? '---' : `${racer.speed}`}</p>
                  </div>
                  {/* Tyre */}
                  <div className="col-span-1 text-right">
                    <p className="text-sm font-semibold">{racer.finished || racer.dnf ? '---' : `${Math.round(racer.tyreWear)}`}</p>
                  </div>
                  {/* Points */}
                  <div className="col-span-1 text-right">
                    <p className="text-sm font-bold text-yellow-400">{racer.provisionalPoints || '0'}</p>
                  </div>
                  {/* Price */}
                  <div className="col-span-3 text-right">
                    <p className="text-sm font-semibold">${racer.price.toFixed(2)}</p>
                  </div>
                  {/* Status */}
                  <div className="col-span-2 flex justify-center items-center">
                    {getStatus(racer)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Betting and Auction Sections */}
        <BettingPage racers={leaderboard} raceConfig={raceConfig} />
        <AuctionPage />
      </main>

      {/* ... (All Modals are unchanged) ... */}
      {activeModal && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-t-3xl sm:rounded-2xl border border-red-700/30 w-full sm:w-full sm:max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 sm:p-6 space-y-6">
              <div>
                {renderModalContent()}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedRacerData && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDetailsModal(false)}
          />
          <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-t-3xl sm:rounded-2xl border border-red-700/30 w-full sm:w-full sm:max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-4">Racer Details</h3>
                <div className="space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                    <p className="text-5xl font-bold text-red-400 opacity-50 mb-2">{selectedRacerData.name.charAt(0)}</p>
                    <h2 className="text-xl font-bold">{selectedRacerData.name}</h2>
                    <p className="text-sm text-slate-400">{selectedRacerData.team}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400">Speed</p>
                      <p className="font-bold text-red-300 text-lg">{selectedRacerData.speed}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400">Grip</p>
                      <p className="font-bold text-amber-300 text-lg">{selectedRacerData.grip}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400">Aero</p>
                      <p className="font-bold text-yellow-300 text-lg">{selectedRacerData.aero}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400">Rarity</p>
                      <p className="font-bold text-amber-300 text-lg">{selectedRacerData.rarity}</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-900/30 to-amber-900/30 p-4 rounded-lg border border-red-700/30">
                    <p className="text-xs text-slate-400 mb-1">Championships</p>
                    <p className="text-2xl font-black text-amber-300">{selectedRacerData.championships}</p>
                  </div>
                  <div className="bg-gradient-to-r from-red-900/30 to-amber-900/30 p-4 rounded-lg border border-red-700/30">
                    <p className="text-xs text-slate-400 mb-1">Total Wins</p>
                    <p className="text-2xl font-black text-amber-300">{selectedRacerData.wins}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowWalletModal(false)}
          />
          <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-t-3xl sm:rounded-2xl border border-red-700/30 w-full sm:w-full sm:max-w-md shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 sm:p-6 space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500/30 to-orange-600/30 border-2 border-orange-500/50 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
                  <div className="text-2xl font-bold text-orange-500">M</div>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">MetaMask Connected</h2>
                  <p className="text-sm text-slate-400">Your wallet is securely connected</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-900/20 to-slate-900/40 border border-orange-700/30 p-5 rounded-xl space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Wallet Holder</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{walletHolder}</p>
                </div>
                <div className="border-t border-slate-700/30 pt-4 space-y-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Wallet Address</p>
                  <p className="text-sm sm:text-base font-mono text-amber-300 break-all bg-slate-800/50 p-3 rounded-lg border border-slate-700/30">
                    {walletAddress}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Connected Features</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/30 text-center">
                    <p className="text-2xl font-bold text-amber-400 mb-1">T</p>
                    <p className="text-xs font-semibold text-slate-300">Trading</p>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/30 text-center">
                    <p className="text-2xl font-bold text-amber-400 mb-1">P</p>
                    <p className="text-xs font-semibold text-slate-300">Portfolio</p>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/30 text-center">
                    <p className="text-2xl font-bold text-amber-400 mb-1">B</p>
                    <p className="text-xs font-semibold text-slate-300">Bidding</p>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/30 text-center">
                    <p className="text-2xl font-bold text-amber-400 mb-1">W</p>
                    <p className="text-xs font-semibold text-slate-300">Web3</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDisconnectWallet}
                className="w-full py-3 bg-red-900/40 border border-red-700/50 rounded-lg font-semibold text-red-300 hover:bg-red-900/60 transition-all active:scale-95"
              >
                Disconnect Wallet
              </button>

              <div className="bg-slate-800/20 p-3 rounded-lg border border-slate-700/20 text-center">
                <p className="text-xs text-slate-500">
                  Your keys are safe. This connection is view-only and never stores your private keys.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}