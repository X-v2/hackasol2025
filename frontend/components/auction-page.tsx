'use client'

import React, { useState, useEffect } from 'react'
import { History, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const AuctionPageStyles = () => (
  <style>{`
    .auction-container {
      width: 100%;
    }

    .auction-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .auction-header-content h1 {
      font-size: 1.5rem;
      color: #F59E0B;
      margin: 0;
      font-weight: 900;
      text-transform: uppercase;
    }

    .auction-header-content p {
      color: #999;
      margin-top: 0.25rem;
      font-size: 0.8rem;
    }

    .history-button {
      padding: 0.5rem 0.75rem;
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      color: #F59E0B;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 600;
      transition: all 0.3s ease;
      font-size: 0.75rem;
      border: none;
    }

    .history-button:hover {
      background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
      color: white;
      transform: translateY(-2px);
    }

    .auction-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.9rem;
      margin-bottom: 1.25rem;
    }

    .auction-card {
      border-radius: 12px;
      padding: 0;
      background: linear-gradient(135deg, #18181b 0%, #1a1a1a 100%);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .auction-card:hover {
      box-shadow: 0 12px 30px rgba(245, 158, 11, 0.15);
      transform: translateY(-4px);
      background: linear-gradient(135deg, #1a1a1a 0%, #222 100%);
    }

    .auction-card-content {
      padding: 0.9rem;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .auction-card h3 {
      font-size: 0.95rem;
      margin: 0 0 0.35rem 0;
      color: #F59E0B;
      font-weight: 700;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      margin: 0.4rem 0;
      padding: 0.5rem;
      background: rgba(245, 158, 11, 0.05);
      border-radius: 6px;
    }

    .stat-label {
      color: #999;
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 600;
    }

    .stat-value {
      font-size: 0.9rem;
      font-weight: 900;
      color: #F59E0B;
    }

    .bid-button {
      width: 100%;
      padding: 0.6rem;
      background: linear-gradient(135deg, #EF4444 0%, #F59E0B 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 700;
      transition: all 0.3s ease;
      font-size: 0.75rem;
      margin-top: auto;
    }

    .bid-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
    }

    .bid-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .my-listings-section {
      background: linear-gradient(135deg, #1a1a1a 0%, #222 100%);
      padding: 1.1rem;
      border-radius: 12px;
      margin-top: 1.25rem;
    }

    .listings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .listings-header h2 {
      font-size: 1.2rem;
      color: #F59E0B;
      margin: 0;
      font-weight: 900;
    }

    .list-racer-button {
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #EF4444 0%, #F59E0B 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 700;
      transition: all 0.3s ease;
      font-size: 0.75rem;
    }

    .list-racer-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
    }

    .list-racer-button:disabled {
      opacity: 0.5;
    }

    .listings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.9rem;
    }

    .no-listings {
      text-align: center;
      color: #999;
      padding: 1.2rem;
      font-size: 0.85rem;
    }

    .wallet-required {
      background: rgba(245, 158, 11, 0.1);
      padding: 0.7rem;
      border-radius: 8px;
      text-align: center;
      color: #F59E0B;
      font-weight: 600;
      margin-bottom: 1rem;
      font-size: 0.85rem;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
    }

    .modal-content {
      background: linear-gradient(135deg, #18181b 0%, #222 100%);
      padding: 1.5rem;
      border-radius: 16px;
      width: 100%;
      max-width: 420px;
      position: relative;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-close {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      background: transparent;
      border: none;
      color: #F59E0B;
      font-size: 1.8rem;
      cursor: pointer;
    }

    .modal-close:hover {
      color: #EF4444;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      color: #F59E0B;
      font-size: 0.75rem;
      margin-bottom: 0.4rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .form-group input {
      width: 100%;
      padding: 0.7rem;
      background: linear-gradient(135deg, #111 0%, #1a1a1a 100%);
      border-radius: 8px;
      color: white;
      font-size: 0.95rem;
      box-sizing: border-box;
      border: none;
      transition: all 0.3s ease;
    }

    .form-group input:focus {
      outline: none;
      box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
    }

    .history-modal-content {
      max-height: 50vh;
      overflow-y: auto;
    }

    .history-item {
      background: rgba(245, 158, 11, 0.05);
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 0.75rem;
      font-size: 0.85rem;
    }

    .history-item p {
      margin: 0.3rem 0;
    }

    .modal-content h2 {
      margin: 0 0 0.75rem 0;
      color: #F59E0B;
      font-size: 1.3rem;
      font-weight: 900;
    }

    .primary-button {
      width: 100%;
      padding: 0.85rem;
      background: linear-gradient(135deg, #EF4444 0%, #F59E0B 100%);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }

    .primary-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
    }

    .action-buttons-container {
      display: flex;
      gap: 0.5rem;
      margin-top: auto;
    }

    .action-button {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.7rem;
      transition: all 0.3s ease;
      text-transform: uppercase;
    }

    .sell-button {
      background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
      color: white;
    }

    .sell-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(34, 197, 94, 0.3);
    }

    .remove-button {
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      color: white;
    }

    .remove-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(239, 68, 68, 0.3);
    }

    .action-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `}</style>
)

// --- NEW INTERFACE ---
// Defines the shape of racers coming from your backend's /racers endpoint
interface BackendRacer {
  id: number;
  name: string;
  // You can add other fields like speed, handling, etc. if you need them
}

interface AuctionItem {
  id: number
  name: string
  helmet: string
  currentBid: number
  timeLeftMs: number
  listedByMe: boolean
}

interface HistoryItem {
  id: number
  type: 'bid' | 'listed'
  racer: string
  amount: number
  timestamp: string
}

interface ConfirmationModalProps {
  action: 'sell' | 'remove'
  racer: string
  price: number
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmationModal({ action, racer, price, onConfirm, onCancel }: ConfirmationModalProps) {
  // ... (This component is unchanged)
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>&times;</button>
        <h2>{action === 'sell' ? 'Confirm Sale' : 'Confirm Removal'}</h2>
        <div style={{ marginBottom: '1.5rem', color: '#999' }}>
          <p style={{ marginBottom: '1rem' }}>Are you sure you want to {action} <strong style={{ color: '#F59E0B' }}>{racer}</strong>?</p>
          {action === 'sell' && (
            <p>You will receive <strong style={{ color: '#22C55E' }}>{price.toFixed(2)} ETH</strong></p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#F59E0B',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.95rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="primary-button"
            style={{
              flex: 1,
              background: action === 'sell' ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            }}
          >
            {action === 'sell' ? 'Confirm Sale' : 'Confirm Removal'}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- MOCK DATA (REMOVED MOCK RACERS) ---
// We keep mockAuctions as a default for the UI
const mockAuctions: AuctionItem[] = [
  { id: 1, name: 'Crimson Comet', helmet: '🔴', currentBid: 2.12, timeLeftMs: 7200000, listedByMe: false },
  { id: 2, name: 'Golden Arrow', helmet: '🟡', currentBid: 3.41, timeLeftMs: 300000, listedByMe: false },
  { id: 3, name: 'Azure Knight', helmet: '🔵', currentBid: 2.84, timeLeftMs: 600000, listedByMe: false },
]

const formatTime = (ms: number) => {
  // ... (This component is unchanged)
  if (ms === 0) return 'Ended'
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

interface PlaceBidModalProps {
  item: AuctionItem
  onClose: () => void
  onPlaceBid: (itemId: number, bidAmount: number) => void
}

function PlaceBidModal({ item, onClose, onPlaceBid }: PlaceBidModalProps) {
  // ... (This component is unchanged)
  const minBid = (item.currentBid * 1.05).toFixed(2)
  const [bidAmount, setBidAmount] = useState(minBid)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const bid = parseFloat(bidAmount)
    if (bid <= item.currentBid) {
      alert(`Bid must be higher than ${item.currentBid} ETH`)
      return
    }
    onPlaceBid(item.id, bid)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Place a Bid</h2>
        <p style={{ marginTop: 0, color: '#999', fontSize: '0.9rem' }}>Bidding on: <strong>{item.name}</strong></p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Bid: {item.currentBid} ETH</label>
            <input type="number" step="0.01" min={minBid} value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
            <small style={{ color: '#999', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Min: {minBid} ETH</small>
          </div>
          <button type="submit" className="primary-button">Confirm Bid</button>
        </form>
      </div>
    </div>
  )
}

function HistoryModal({ onClose, history }: { onClose: () => void; history: HistoryItem[] }) {
  // ... (This component is unchanged)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Auction History</h2>
        <div className="history-modal-content">
          {history.length > 0 ? (
            history.map(item => (
              <div key={item.id} className="history-item">
                <p style={{ fontWeight: 700, color: '#F59E0B' }}>{item.racer}</p>
                <p style={{ color: '#22C55E' }}>{item.type.toUpperCase()} - {item.amount.toFixed(2)} ETH</p>
                <p style={{ color: '#666', fontSize: '0.75rem' }}>{item.timestamp}</p>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#999' }}>No history yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuctionPage() {
  const { user } = useAuth()
  const AUCTION_CACHE_KEY = 'turboAuctionData'
  const HISTORY_CACHE_KEY = 'turboAuctionHistory'

  // --- NEW STATE ---
  // This state will hold the REAL racers fetched from your backend
  const [availableRacers, setAvailableRacers] = useState<BackendRacer[]>([])

  const [auctions, setAuctions] = useState<AuctionItem[]>(() => {
    const cached = localStorage.getItem(AUCTION_CACHE_KEY)
    return cached ? JSON.parse(cached) : mockAuctions
  })

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const cached = localStorage.getItem(HISTORY_CACHE_KEY)
    return cached ? JSON.parse(cached) : []
  })

  const [showBidModal, setShowBidModal] = useState<AuctionItem | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState<{
    show: boolean
    action: 'sell' | 'remove'
    itemId: number | null
  }>({ show: false, action: 'sell', itemId: null })

  // --- NEW EFFECT ---
  // Fetches the real racers from your backend on component load
  useEffect(() => {
    async function fetchRacers() {
      try {
        // This is the endpoint from your server.js
        const response = await fetch('http://localhost:3001/racers')
        if (!response.ok) {
          throw new Error('Failed to fetch racers from backend')
        }
        const data: BackendRacer[] = await response.json()
        setAvailableRacers(data)
      } catch (err) {
        console.error("Error fetching racers:", err)
        // Keep the app running, but listing new racers might fail
      }
    }
    
    fetchRacers()
  }, []) // Empty array means this runs once

  useEffect(() => {
    localStorage.setItem(AUCTION_CACHE_KEY, JSON.stringify(auctions))
  }, [auctions])

  useEffect(() => {
    localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(history))
  }, [history])

  const handlePlaceBid = (itemId: number, bidAmount: number) => {
    const item = auctions.find(a => a.id === itemId)
    if (!item) return

    setAuctions(prev => prev.map(a => a.id === itemId ? { ...a, currentBid: bidAmount } : a))
    setHistory(prev => [...prev, {
      id: Date.now(),
      type: 'bid',
      racer: item.name,
      amount: bidAmount,
      timestamp: new Date().toLocaleString()
    }])

    alert(`Bid placed for ${item.name} at ${bidAmount.toFixed(2)} ETH!`)
  }

  // --- UPDATED FUNCTION ---
  // This now uses the real racer list
  const handleListRacer = () => {
    if (availableRacers.length === 0) {
      alert("Fetching racer list from backend... Please try again in a moment.");
      return;
    }

    // Pick a random racer from the *real* backend list
    const racer = availableRacers[Math.floor(Math.random() * availableRacers.length)]

    // Check if you've already listed this racer (simple check)
    if (auctions.some(a => a.name === racer.name && a.listedByMe)) {
      alert(`You have already listed ${racer.name}.`);
      return;
    }
    
    const startingPrice = Math.random() * 2 + 1

    const newAuction: AuctionItem = {
      id: Date.now(),
      name: racer.name,
      helmet: '❓', // We don't get helmet icons from the backend
      currentBid: startingPrice,
      timeLeftMs: 3600000,
      listedByMe: true
    }

    setAuctions(prev => [newAuction, ...prev])
    setHistory(prev => [...prev, {
      id: Date.now() + 1,
      type: 'listed',
      racer: racer.name,
      amount: startingPrice,
      timestamp: new Date().toLocaleString()
    }])

    alert(`Listed ${racer.name} for auction!`)
  }

  const handleRemoveListing = (itemId: number) => {
    setConfirmationModal({ show: true, action: 'remove', itemId })
  }

  const handleSellListing = (itemId: number) => {
    setConfirmationModal({ show: true, action: 'sell', itemId })
  }

  const handleConfirmedAction = () => {
    if (confirmationModal.itemId === null) return

    const item = auctions.find(a => a.id === confirmationModal.itemId)
    if (!item) return

    if (confirmationModal.action === 'sell') {
      setHistory(prev => [...prev, {
        id: Date.now(),
        type: 'bid',
        racer: item.name,
        amount: item.currentBid,
        timestamp: new Date().toLocaleString()
      }])
      setAuctions(prev => prev.filter(a => a.id !== confirmationModal.itemId))
      alert(`Sold ${item.name} for ${item.currentBid.toFixed(2)} ETH!`)
    } else {
      setAuctions(prev => prev.filter(a => a.id !== confirmationModal.itemId))
      alert(`Removed ${item.name} from listings`)
    }

    setConfirmationModal({ show: false, action: 'sell', itemId: null })
  }

  const myListings = auctions.filter(a => a.listedByMe)
  const availableAuctions = auctions.filter(a => !a.listedByMe)
  const confirmItem = confirmationModal.itemId ? auctions.find(a => a.id === confirmationModal.itemId) : null

  return (
    <div className="auction-container">
      <AuctionPageStyles />

      {showBidModal && <PlaceBidModal item={showBidModal} onClose={() => setShowBidModal(null)} onPlaceBid={handlePlaceBid} />}
      {showHistoryModal && <HistoryModal onClose={() => setShowHistoryModal(false)} history={history} />}
      {confirmationModal.show && confirmItem && (
        <ConfirmationModal
          action={confirmationModal.action}
          racer={confirmItem.name}
          price={confirmItem.currentBid}
          onConfirm={handleConfirmedAction}
          onCancel={() => setConfirmationModal({ show: false, action: 'sell', itemId: null })}
        />
      )}

      <div className="auction-header">
        <div className="auction-header-content">
          <h1>Live Auctions</h1>
          <p>Bid on premium racers</p>
        </div>
        <button className="history-button" onClick={() => setShowHistoryModal(true)}>
          <History size={16} />
          History
        </button>
      </div>

      {!user && <div className="wallet-required">Connect wallet to place bids</div>}

      <div className="auction-grid">
        {availableAuctions.map(item => (
          <div key={item.id} className="auction-card">
            <div className="auction-card-content">
              <h3>{item.name}</h3>
              <div className="stat-row">
                <span className="stat-label">Current Bid</span>
                <span className="stat-value">{item.currentBid.toFixed(2)} ETH</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Time Left</span>
                <span className="stat-value">{formatTime(item.timeLeftMs)}</span>
              </div>
              <button className="bid-button" onClick={() => user ? setShowBidModal(item) : alert('Connect wallet to bid')} disabled={!user}>
                {user ? 'Bid' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="my-listings-section">
        <div className="listings-header">
          <h2>My Listings</h2>
          <button className="list-racer-button" onClick={() => user ? handleListRacer() : alert('Connect wallet')} disabled={!user}>
            + {user ? 'List' : 'Connect'}
          </button>
        </div>

        {myListings.length > 0 ? (
          <div className="listings-grid">
            {myListings.map(item => (
              <div key={item.id} className="auction-card">
                <div className="auction-card-content">
                  <h3>{item.name}</h3>
                  <div className="stat-row">
                    <span className="stat-label">Price</span>
                    <span className="stat-value">{item.currentBid.toFixed(2)} ETH</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Time</span>
                    <span className="stat-value">{formatTime(item.timeLeftMs)}</span>
                  </div>
                  <div className="action-buttons-container">
                    <button className="action-button sell-button" onClick={() => handleSellListing(item.id)}>Sell</button>
                    <button className="action-button remove-button" onClick={() => handleRemoveListing(item.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-listings">{user ? 'No listings yet' : 'Connect wallet to list'}</div>
        )}
      </div>
    </div>
  )
}