"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface WalletUser {
  address: string
  name: string
  isVerified: boolean
  signedAt: number
}

interface AuthContextType {
  user: WalletUser | null
  isConnecting: boolean
  connectWallet: () => Promise<void>
  signMessage: (message: string) => Promise<string>
  disconnectWallet: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<WalletUser | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Check if user is already connected
    const storedUser = localStorage.getItem("turbotrade_user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("[v0] Error parsing stored user:", error)
      }
    }
  }, [])

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      // Simulate MetaMask connection request
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })

        if (accounts && accounts.length > 0) {
          const address = accounts[0]

          // Create SIWE message for signing
          const message = createSIWEMessage(address)

          // Request user to sign the message
          const signature = await (window as any).ethereum.request({
            method: "personal_sign",
            params: [message, address],
          })

          if (signature) {
            const userData: WalletUser = {
              address,
              name: "Racer " + address.slice(0, 6),
              isVerified: true,
              signedAt: Date.now(),
            }

            setUser(userData)
            localStorage.setItem("turbotrade_user", JSON.stringify(userData))
            localStorage.setItem("turbotrade_signature", signature)
          }
        }
      } else {
        // Fallback for demo/testing
        const mockAddress = "0x" + Math.random().toString(16).slice(2, 42)
        const userData: WalletUser = {
          address: mockAddress,
          name: "Racer " + mockAddress.slice(0, 6),
          isVerified: true,
          signedAt: Date.now(),
        }

        setUser(userData)
        localStorage.setItem("turbotrade_user", JSON.stringify(userData))
      }
    } catch (error) {
      console.error("[v0] Wallet connection error:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const signMessage = async (message: string): Promise<string> => {
    if (!user) throw new Error("No wallet connected")

    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const signature = await (window as any).ethereum.request({
          method: "personal_sign",
          params: [message, user.address],
        })
        return signature
      }
      return ""
    } catch (error) {
      console.error("[v0] Message signing error:", error)
      throw error
    }
  }

  const disconnectWallet = () => {
    console.log("[v0] Disconnecting wallet")
    setUser(null)
    localStorage.removeItem("turbotrade_user")
    localStorage.removeItem("turbotrade_signature")
  }

  return (
    <AuthContext.Provider value={{ user, isConnecting, connectWallet, signMessage, disconnectWallet }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

function createSIWEMessage(address: string): string {
  const chainId = 11155111 // Ethereum Sepolia
  const domain = typeof window !== "undefined" ? window.location.host : "turbotradex.app"
  const origin = typeof window !== "undefined" ? window.location.origin : "https://turbotradex.app"
  const timestamp = new Date().toISOString()

  return `${domain} wants you to sign in with your Ethereum account:
${address}

TurboTradeX - Web3 F1 GameFi Trading Platform

URI: ${origin}
Version: 1
Chain ID: ${chainId}
Nonce: ${Math.random().toString(36).substring(2, 15)}
Issued At: ${timestamp}
Expiration Time: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}`
}
