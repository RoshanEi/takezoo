'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: ReactNode
  className?: string
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className={cn(
      "h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden",
      className
    )}>
      {/* Header/Menu Bar */}
      <header className="h-8 bg-secondary border-b border-border flex items-center px-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-muted-foreground">Shinmen Takezo IDE</span>
        </div>
        
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-4 text-muted-foreground">
            <button className="hover:text-foreground transition-colors">File</button>
            <button className="hover:text-foreground transition-colors">Edit</button>
            <button className="hover:text-foreground transition-colors">View</button>
            <button className="hover:text-foreground transition-colors">Terminal</button>
            <button className="hover:text-foreground transition-colors">Help</button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Shinmen AI Ready</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Status Bar */}
      <footer className="h-6 bg-secondary border-t border-border flex items-center justify-between px-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>JavaScript</span>
          <span>Spaces: 2</span>
        </div>
      </footer>
    </div>
  )
}
