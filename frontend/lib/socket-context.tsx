// lib/socket-context.tsx
'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

// Your backend URL from server.js/index.html
const SOCKET_URL = "http://localhost:3001"

interface ISocketContext {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<ISocketContext>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Connect to the socket server
    const socketInstance = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    })

    socketInstance.on("connect", () => {
      console.log("Socket connected!")
      setIsConnected(true)
    })

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected.")
      setIsConnected(false)
    })

    setSocket(socketInstance)

    // Clean up on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}