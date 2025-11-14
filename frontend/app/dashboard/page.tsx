'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LogOut, Home } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    walletAddress: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('turbotradeUserData');
    
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedData = JSON.parse(userData);
      setUser(parsedData);
    } catch (error) {
      console.error('[v0] Error parsing user data:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('turbotradeUserData');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black">
      {/* Header with User Info */}
      <header className="bg-black/60 backdrop-blur-md border-b border-yellow-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Home className="w-8 h-8 text-yellow-500" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-yellow-500">
                  {user.name}
                </h1>
                <p className="text-xs sm:text-sm text-yellow-400/70 font-mono">
                  {user.walletAddress}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="lg:col-span-3 bg-gradient-to-r from-red-600 to-yellow-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Welcome to TurboTradeX</h2>
            <p className="text-red-50">Start trading F1-inspired NFT racers and compete in live auctions</p>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/5 border border-yellow-500/20 rounded-xl p-6 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-yellow-500 font-semibold">Portfolio Value</h3>
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">$0.00</p>
            <p className="text-yellow-400/70 text-sm mt-2">No racers owned yet</p>
          </div>

          <div className="bg-white/5 border border-yellow-500/20 rounded-xl p-6 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-yellow-500 font-semibold">Active Bids</h3>
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-yellow-400/70 text-sm mt-2">Place your first bid</p>
          </div>

          <div className="bg-white/5 border border-yellow-500/20 rounded-xl p-6 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-yellow-500 font-semibold">Total Trades</h3>
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-yellow-400/70 text-sm mt-2">Join the race</p>
          </div>

          {/* CTA Buttons */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
              <span>🏎️</span>
              <span>Browse Racers</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
              <span>⚡</span>
              <span>Mint Racer</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
