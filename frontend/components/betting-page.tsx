// code/components/betting-page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { X, History } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

// 1. --- INTERFACES ---
// These are the types we get from the parent page (app/page.tsx)
interface Racer {
  id: number;
  name: string;
  rank: number;
  price: number; // This is the live "rate"
  // Add any other racer properties you need
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

// 2. --- STYLES ---
// (Your styles are perfectly fine, just putting them in a collapsed component)
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


// 3. --- NEW MODAL COMPONENT ---
// This is the new modal designed to bet on a single racer.
interface PlaceRacerBetModalProps {
  racer: Racer;
  onClose: () => void;
  onPlaceBet: (racer: Racer, amount: number, payout: number) => void;
}

function PlaceRacerBetModal({ racer, onClose, onPlaceBet }: PlaceRacerBetModalProps) {
  const [amount, setAmount] = useState('')
  const betAmountNum = parseFloat(amount || '0')
  
  // The "rate" is just the racer's live price!
  const estimatedPayout = (betAmountNum * racer.price).toFixed(2)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isNaN(betAmountNum) || betAmountNum <= 0) {
      alert('Please enter a valid bet amount.')
      return
    }

    onPlaceBet(racer, betAmountNum, parseFloat(estimatedPayout))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2>Bet on Racer</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Racer</label>
            <input 
              type="text" 
              value={`${racer.name} (P${racer.rank})`} 
              readOnly 
              disabled
              style={{ background: 'rgba(0,0,0,0.2)' }}
            />
          </div>

          <div className="form-group">
            <label>Bet Amount (ETH)</label>
            <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.5" />
          </div>

          <div className="bet-summary">
            <p><span>Live Rate:</span><strong>x{racer.price.toFixed(2)}</strong></p>
            <p><span>Your Bet:</span><strong>{betAmountNum.toFixed(2)} ETH</strong></p>
            <p><span>Estimated Payout:</span><strong className="payout">{estimatedPayout} ETH</strong></p>
          </div>

          <button type="submit" className="primary-button">Place Bet</button>
        </form>
      </div>
    </div>
  )
}


// 4. --- MAIN PAGE COMPONENT ---
export default function BettingPage({ racers, raceConfig }: BettingPageProps) {
  const { user } = useAuth()
  const BETTING_HISTORY_KEY = 'turboBettingHistory'

  // We only keep state for history and modals.
  // The 'racers' and 'categories' state is gone, as it comes from props.
  const [history, setHistory] = useState<any[]>(() => {
    const cached = localStorage.getItem(BETTING_HISTORY_KEY)
    return cached ? JSON.parse(cached) : []
  })
  
  // This state now holds a 'Racer' object, not a 'BetCategory'
  const [showBetModal, setShowBetModal] = useState<Racer | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  // This useEffect just saves history when it changes
  useEffect(() => {
    localStorage.setItem(BETTING_HISTORY_KEY, JSON.stringify(history))
  }, [history])

  // *** REMOVED THE FAKE DATA `useEffect` with `setInterval` ***

  // This is the new click handler
  const handleBetClick = (racer: Racer) => {
    if (!user) {
      alert('Connect wallet to bet');
      return;
    }
    setShowBetModal(racer) // Show the modal with the selected racer
  }

  // This is the new confirm handler
  const handleConfirmBet = (racer: Racer, amount: number, payout: number) => {
    const newHistoryItem = {
      id: Date.now(),
      type: 'bet',
      category: 'Racer Bet', // We can call it whatever we want
      racers: racer.name, // Just one racer
      amount: amount,
      payout: payout,
      timestamp: new Date().toLocaleString()
    }

    setHistory(prev => [newHistoryItem, ...prev])
    alert(`Bet Placed!\n${amount} ETH on ${racer.name}`)
    setShowBetModal(null) // Close the modal
  }


  return (
    <div className="betting-container">
      <BettingPageStyles />

      {/* This now calls our NEW modal */}
      {showBetModal && (
        <PlaceRacerBetModal
          racer={showBetModal}
          onClose={() => setShowBetModal(null)}
          onPlaceBet={handleConfirmBet}
        />
      )}

      {/* History Modal (this was fine) */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={() => setShowHistoryModal(false)}>&times;</button>
            <h2>Betting History</h2>
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

      {/* Header (now uses props) */}
      <div className="betting-header">
        <div className="betting-header-content">
          <h1>Live Betting</h1>
          <p>
            {raceConfig ? `Race: ${raceConfig.track} (${raceConfig.condition})` : 'Waiting for race...'}
          </p>
        </div>
        <button className="history-button" onClick={() => setShowHistoryModal(true)}>
          <History size={16} />
          History
        </button>
      </div>

      {/* Wallet Notice (was fine) */}
      {!user && (
        <div className="wallet-required-notice">
          Connect wallet to place bets
        </div>
      )}

      {/* Main Betting List (now maps racers from props) */}
      <div className="betting-list">
        {racers.length === 0 && (
          <div className="betting-category" style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999' }}>
            Waiting for racers...
          </div>
        )}
        {racers.map(racer => (
          <div key={racer.id} className="betting-category">
            <div className="betting-category-content">
              <div className="betting-category-left">
                <div className="betting-category-name">{racer.name}</div>
                <div className="race-info">Rank: {racer.rank}</div>
              </div>
              <div className="betting-actions">
                {/* Use the LIVE price from the prop */}
                <span className={`betting-rate rate-neutral`}>
                  x{racer.price.toFixed(2)}
                </span>
                <button
                  className="betting-button"
                  onClick={() => handleBetClick(racer)}
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