'use client'

import { useEffect, useState } from 'react'

export function LoadingScreen() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Shinmen Takezo IDE
          </h1>
          <p className="text-muted-foreground">
            Initializing your development environment{dots}
          </p>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span>Loading Monaco Editor</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <span>Initializing File System</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span>Connecting AI Services</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            <span>Setting up Terminal</span>
          </div>
        </div>
      </div>
    </div>
  )
}
