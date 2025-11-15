// code/components/categorical-betting-page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { X, History } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

// --- INTERFACES ---
interface Racer {
  id: number;
  name: string;
  rank: number;
  price: number;
}

interface RaceConfig {
  track: string;
  condition: string;
  laps: number;
}

interface BettingPageProps {
  racers: Racer[];
  raceConfig: RaceConfig | null;
}

// --- STYLES ---
const BettingPageStyles = () => (
  <style>{`
    .betting-container { width: 100%; }
    .betting-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; }
    .betting-header-content h1 { font-size: 1.5rem; color: #F59E0B; margin: 0; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
    .betting-header-content p { color: #999; margin-top: 0.25rem; font-size: 0.8rem; }
    .history-button { padding: 0.5rem 0.75rem; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); color: #F59E0B; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; font-weight: 600; transition: all 0.3s ease; font-size: 0.75rem; border: none; }
    .history-button:hover { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: white; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3); }
    .betting-list { margin-top: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.8rem; }
    .betting-category { background: linear-gradient(135deg, #1a1a1a 0%, #222 100%); padding: 0.9rem; border-radius: 10px; transition: all 0.3s ease; cursor: pointer; }
    .betting-category:hover { box-shadow: 0 8px 32px rgba(245, 158, 11, 0.15); transform: translateY(-2px); background: linear-gradient(135deg, #222 0%, #2a2a2a 100%); }
    .betting-category-content { display: flex; justify-content: space-between; align-items: center; }
    .betting-category-left { flex: 1; }
    .betting-category-name { font-size: 0.95rem; font-weight: 600; color: white; margin-bottom: 0.2rem; }
    .race-info { font-size: 0.75rem; color: #999; }
    .betting-actions { display: flex; align-items: center; gap: 0.5rem; }
    .betting-rate { font-size: 0.95rem; font-weight: 900; min-width: 50px; text-align: center; background: rgba(245, 158, 11, 0.1); padding: 0.3rem 0.5rem; border-radius: 6px; transition: all 0.3s ease; }
    .betting-rate.rate-up { color: #22C55E; }
    .betting-rate.rate-down { color: #EF4444; }
    .betting-rate.rate-neutral { color: #F59E0B; }
    .betting-button { padding: 0.45rem 0.8rem; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; transition: all 0.3s ease; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .betting-button:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4); }
    .betting-button:disabled { opacity: 0.5; cursor: not-allowed; }
    .wallet-required-notice { background: rgba(245, 158, 11, 0.1); padding: 0.7rem; border-radius: 8px; text-align: center; color: #F59E0B; font-weight: 600; margin-bottom: 1rem; font-size: 0.85rem; }
    .modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.85); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 50; }
    .modal-content { background: linear-gradient(135deg, #18181b 0%, #222 100%); padding: 1.5rem; border-radius: 16px; width: 100%; max-width: 420px; position: relative; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9); }
    .modal-close-button { position: absolute; top: 1.5rem; right: 1.5rem; background: transparent; border: none; color: #F59E0B; font-size: 1.8rem; cursor: pointer; transition: all 0.2s ease; }
    .modal-close-button:hover { color: #EF4444; }
    .modal-content h2 { margin: 0 0 0.75rem 0; color: #F59E0B; font-size: 1.3rem; font-weight: 900; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; color: #F59E0B; font-size: 0.75rem; margin-bottom: 0.4rem; font-weight: 600; text-transform: uppercase; }
    .form-group input, .form-group select { width: 100%; padding: 0.7rem; background: linear-gradient(135deg, #111 0%, #1a1a1a 100%); border-radius: 8px; color: white; font-size: 0.95rem; box-sizing: border-box; transition: all 0.3s ease; border: none; }
    .form-group input:focus, .form-group select:focus { outline: none; box-shadow: 0 0 15px rgba(245, 158, 11, 0.2); }
    .bet-summary { background: rgba(245, 158, 11, 0.05); padding: 0.9rem; border-radius: 8px; margin-bottom: 1rem; }
    .bet-summary p { margin: 0.4rem 0; display: flex; justify-content: space-between; font-size: 0.9rem; }
    .bet-summary span { color: #999; }
    .bet-summary .payout { font-size: 1rem; font-weight: 900; color: #22C55E; }
    .primary-button { width: 100%; padding: 0.85rem; background: linear-gradient(135deg, #EF4444 0%, #F59E0B 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 0.95rem; transition: all 0.3s ease; text-transform: uppercase; }
    .primary-button:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(239, 68, 68, 0.4); }
    .history-modal-content { max-height: 50vh; overflow-y: auto; margin-top: 1rem; }
    .history-item { background: rgba(245, 158, 11, 0.05); padding: 0.75rem; border-radius: 8px; margin-bottom: 0.75rem; font-size: 0.85rem; }
    .history-item p { margin: 0.3rem 0; }
  `}</style>
)


// --- CATEGORY DATA & MODAL ---
interface BetCategory {
  id: 'first' | 'second' | 'third' | 'top3';
  name: string;
  rate: number;
  lastChange: number; // For the flashing color
}

// The 4 categories you requested
const initialBetCategories: BetCategory[] = [
  { id: 'first', name: 'First Place', rate: 1.5, lastChange: 0 },
  { id: 'second', name: 'Second Place', rate: 1.8, lastChange: 0 },
  { id: 'third', name: 'Third Place', rate: 2.2, lastChange: 0 },
  { id: 'top3', name: 'Top 3 Finish', rate: 1.2, lastChange: 0 },
]

interface PlaceCategoryBetModalProps {
  category: BetCategory;
  racers: Racer[]; // We get the live racer list from props
  onClose: () => void;
  onPlaceBet: (category: BetCategory, selections: string[], amount: number) => void;
}

function PlaceCategoryBetModal({ category, racers, onClose, onPlaceBet }: PlaceCategoryBetModalProps) {
  const getSelectionCount = () => {
    if (category.id === 'top3') return 3;
    return 1; // First, Second, and Third place all pick 1 racer
  }

  const [amount, setAmount] = useState('')
  const [selections, setSelections] = useState<string[]>(() => Array(getSelectionCount()).fill(''))

  const handleSelectionChange = (index: number, value: string) => {
    const newSelections = [...selections]
    newSelections[index] = value
    setSelections(newSelections)
  }

  const getTitle = () => {
    switch (category.id) {
      case 'first': return 'Select 1st Place'
      case 'second': return 'Select 2nd Place'
      case 'third': return 'Select 3rd Place'
      case 'top3': return 'Select 3 Racers'
      default: return 'Place Bet'
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const betAmount = parseFloat(amount)
    if (isNaN(betAmount) || betAmount <= 0) {
      alert('Please enter a valid bet amount.')
      return
    }
    if (selections.some(s => s === '')) {
      alert('Please select racers for all fields.')
      return
    }
    // Check for duplicate selections
    const uniqueSelections = new Set(selections);
    if (uniqueSelections.size !== selections.length) {
      alert('Please select unique racers.');
      return;
    }
    onPlaceBet(category, selections, betAmount)
  }

  const betAmountNum = parseFloat(amount || '0')
  const estimatedPayout = (betAmountNum * category.rate).toFixed(2)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2>{getTitle()}</h2>

        <form onSubmit={handleSubmit}>
          {selections.map((selection, index) => (
            <div className="form-group" key={index}>
              <label>Racer #{index + 1}</label>
              <select value={selection} onChange={(e) => handleSelectionChange(index, e.target.value)}>
                <option value="">Select racer</option>
                {/* We use the live 'racers' prop here */}
                {racers.map(r => (<option key={r.id} value={r.id}>{r.name} (P{r.rank})</option>))}
              </select>
            </div>
          ))}

          <div className="form-group">
            <label>Bet Amount (ETH)</label>
            <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.5" />
          </div>

          <div className="bet-summary">
            <p><span>Bet:</span><strong>{betAmountNum.toFixed(2)} ETH</strong></p>
            <p><span>Rate:</span><strong>x{category.rate.toFixed(2)}</strong></p>
            <p><span>Payout:</span><strong className="payout">{estimatedPayout} ETH</strong></p>
          </div>

          <button type="submit" className="primary-button">Place Bet</button>
        </form>
      </div>
    </div>
  )
}

// --- MAIN COMPONENT ---
export default function CategoricalBettingPage({ racers, raceConfig }: BettingPageProps) {
  const { user } = useAuth()
  const CATEGORY_HISTORY_KEY = 'turboCategoryBettingHistory'

  const [categories, setCategories] = useState<BetCategory[]>(initialBetCategories)
  const [history, setHistory] = useState<any[]>(() => {
    const cached = localStorage.getItem(CATEGORY_HISTORY_KEY)
    return cached ? JSON.parse(cached) : []
  })

  const [showBetModal, setShowBetModal] = useState<BetCategory | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(CATEGORY_HISTORY_KEY, JSON.stringify(history))
  }, [history])

  // --- NEW: LIVE RATES FROM BACKEND DATA ---
  // This replaces the fake `setInterval`
  useEffect(() => {
    if (!racers || racers.length < 3) {
      // Not enough data yet, do nothing
      return;
    }

    const p1 = racers.find(r => r.rank === 1);
    const p2 = racers.find(r => r.rank === 2);
    const p3 = racers.find(r => r.rank === 3);

    if (!p1 || !p2 || !p3) {
      // Still waiting for a full podium
      return;
    }

    // This function calculates the new rates based on current racer prices
    // We add a small "house edge" / modifier to make them different from the
    // simple racer price, making them unique category odds.
    const calculateRate = (price: number, modifier: number = 1.1) => {
        const newRate = Math.max(1.01, (price * modifier));
        return parseFloat(newRate.toFixed(2));
    }

    // Calculate a "safer" rate for Top 3
    const top3Rate = Math.max(1.01, ((p1.price + p2.price + p3.price) / 3) * 0.5); // Average price, but much lower payout
    
    setCategories(prevCategories => {
        // We create a map for easy updating
        const newRates: Record<string, number> = {
            'first': calculateRate(p1.price, 1.1),
            'second': calculateRate(p2.price, 1.15),
            'third': calculateRate(p3.price, 1.2),
            'top3': parseFloat(top3Rate.toFixed(2)),
        };

        return prevCategories.map(cat => {
            const newRate = newRates[cat.id];
            let lastChange: -1 | 0 | 1 = 0;
            if (newRate > cat.rate) lastChange = 1;
            if (newRate < cat.rate) lastChange = -1;
            
            return { ...cat, rate: newRate, lastChange: lastChange };
        });
    });

  }, [racers]); // This effect re-runs every time 'racers' prop changes!

  // Handler to open the modal
  const handleBetClick = (category: BetCategory) => {
    if (!user) {
      alert('Connect wallet to bet');
      return;
    }
    setShowBetModal(category)
  }

  // Handler to confirm and save the bet
  const handleConfirmBet = (category: BetCategory, selections: string[], amount: number) => {
    // Find the names of the selected racers from the prop
    const racerNames = selections.map(id => racers.find(r => r.id.toString() === id)?.name).join(', ')
    
    const newHistoryItem = {
      id: Date.now(),
      type: 'bet',
      category: category.name,
      racers: racerNames,
      amount: amount,
      payout: (amount * category.rate).toFixed(2),
      timestamp: new Date().toLocaleString()
    }

    setHistory(prev => [newHistoryItem, ...prev])
    alert(`Bet Placed!\n${category.name}\n${racerNames}\n${amount} ETH`)
    setShowBetModal(null)
  }

  return (
    <div className="betting-container">
      <BettingPageStyles />

      {/* Modal for placing a category bet */}
      {showBetModal && (
        <PlaceCategoryBetModal
          category={showBetModal}
          racers={racers} // Pass live racers to the modal
          onClose={() => setShowBetModal(null)}
          onPlaceBet={handleConfirmBet}
        />
      )}

      {/* Modal for viewing history */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={() => setShowHistoryModal(false)}>&times;</button>
            <h2>Categorical Bet History</h2>
            <div className="history-modal-content">
              {history.length > 0 ? (
                history.map(item => (
                  <div key={item.id} className="history-item">
                    <p style={{ fontWeight: 700, color: '#F59E0B' }}>{item.category}</p>
                    <p style={{ color: '#999', fontSize: '0.8rem' }}>{item.racers}</p>
                    <p style={{ color: '#22C55E', fontWeight: 600 }}>{item.amount} ETH → {item.payout} ETH</p>
                    <p style={{ color: '#666', fontSize: '0.75rem' }}>{item.timestamp}</p>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#999' }}>No betting history</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="betting-header">
        <div className="betting-header-content">
          <h1>Categorical Betting</h1>
          <p>
            {raceConfig ? `Race: ${raceConfig.track} (${raceConfig.condition})` : 'Waiting for race...'}
          </p>
        </div>
        <button className="history-button" onClick={() => setShowHistoryModal(true)}>
          <History size={16} />
          History
        </button>
      </div>

      {/* Wallet Notice */}
      {!user && (
        <div className="wallet-required-notice">
          Connect wallet to place bets
        </div>
      )}

      {/* The 4 Category Boxes */}
      <div className="betting-list">
        {categories.map(cat => (
          <div key={cat.id} className="betting-category" onClick={() => handleBetClick(cat)}>
            <div className="betting-category-content">
              <div className="betting-category-left">
                <div className="betting-category-name">{cat.name}</div>
                <div className="race-info">Live Odds</div>
              </div>
              <div className="betting-actions">
                <span className={`betting-rate ${cat.lastChange > 0 ? 'rate-up' : (cat.lastChange < 0 ? 'rate-down' : 'rate-neutral')}`}>
                  x{cat.rate.toFixed(2)}
                </span>
                <button
                  className="betting-button"
                  disabled={!user}
                >
                  {user ? 'Bet' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}