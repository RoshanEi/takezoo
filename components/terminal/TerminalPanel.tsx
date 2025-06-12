'use client'

import { useState, useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { 
  TerminalIcon, 
  PlusIcon, 
  XIcon, 
  SettingsIcon,
  MaximizeIcon,
  MinimizeIcon
} from 'lucide-react'

interface TerminalTab {
  id: string
  name: string
  terminal: Terminal
  isActive: boolean
}

export function TerminalPanel() {
  const [terminals, setTerminals] = useState<TerminalTab[]>([])
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null)
  const [isMaximized, setIsMaximized] = useState(false)
  const terminalContainerRef = useRef<HTMLDivElement>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    // Create initial terminal
    createNewTerminal()
    
    return () => {
      // Cleanup terminals
      terminals.forEach(tab => {
        tab.terminal.dispose()
      })
    }
  }, [])

  useEffect(() => {
    // Fit terminal when container size changes
    if (fitAddonRef.current) {
      setTimeout(() => {
        fitAddonRef.current?.fit()
      }, 100)
    }
  }, [isMaximized])

  const createNewTerminal = () => {
    const terminalId = `terminal-${Date.now()}`
    
    const terminal = new Terminal({
      theme: {
        background: '#1a1a1a',
        foreground: '#ffffff',
        cursor: '#ffffff',
        selection: '#3b82f6',
        black: '#000000',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#ffffff',
        brightBlack: '#374151',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#f9fafb'
      },
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      tabStopWidth: 4,
      bellStyle: 'none'
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    
    terminal.loadAddon(fitAddon)
    terminal.loadAddon(webLinksAddon)
    
    fitAddonRef.current = fitAddon

    // Simulate a basic shell
    terminal.writeln('Welcome to Shinmen Takezo IDE Terminal')
    terminal.writeln('Type "help" for available commands')
    terminal.write('$ ')

    let currentLine = ''
    let commandHistory: string[] = []
    let historyIndex = -1

    terminal.onData((data) => {
      const char = data.charCodeAt(0)
      
      if (char === 13) { // Enter
        terminal.writeln('')
        if (currentLine.trim()) {
          commandHistory.push(currentLine)
          executeCommand(currentLine.trim(), terminal)
        }
        currentLine = ''
        historyIndex = -1
        terminal.write('$ ')
      } else if (char === 127) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1)
          terminal.write('\b \b')
        }
      } else if (char === 27) { // Escape sequences (arrow keys)
        // Handle arrow keys for command history
        terminal.onData((escapeData) => {
          if (escapeData === '[A') { // Up arrow
            if (historyIndex < commandHistory.length - 1) {
              historyIndex++
              const command = commandHistory[commandHistory.length - 1 - historyIndex]
              // Clear current line
              terminal.write('\r$ ' + ' '.repeat(currentLine.length) + '\r$ ')
              currentLine = command
              terminal.write(command)
            }
          } else if (escapeData === '[B') { // Down arrow
            if (historyIndex > 0) {
              historyIndex--
              const command = commandHistory[commandHistory.length - 1 - historyIndex]
              // Clear current line
              terminal.write('\r$ ' + ' '.repeat(currentLine.length) + '\r$ ')
              currentLine = command
              terminal.write(command)
            } else if (historyIndex === 0) {
              historyIndex = -1
              // Clear current line
              terminal.write('\r$ ' + ' '.repeat(currentLine.length) + '\r$ ')
              currentLine = ''
            }
          }
        })
      } else if (char >= 32) { // Printable characters
        currentLine += data
        terminal.write(data)
      }
    })

    const newTab: TerminalTab = {
      id: terminalId,
      name: `Terminal ${terminals.length + 1}`,
      terminal,
      isActive: true
    }

    setTerminals(prev => {
      const updated = prev.map(tab => ({ ...tab, isActive: false }))
      return [...updated, newTab]
    })
    setActiveTerminalId(terminalId)

    // Mount terminal to DOM after state update
    setTimeout(() => {
      if (terminalContainerRef.current) {
        const terminalElement = terminalContainerRef.current.querySelector(`[data-terminal-id="${terminalId}"]`)
        if (terminalElement) {
          terminal.open(terminalElement as HTMLElement)
          fitAddon.fit()
        }
      }
    }, 100)
  }

  const executeCommand = (command: string, terminal: Terminal) => {
    const args = command.split(' ')
    const cmd = args[0].toLowerCase()

    switch (cmd) {
      case 'help':
        terminal.writeln('Available commands:')
        terminal.writeln('  help     - Show this help message')
        terminal.writeln('  clear    - Clear the terminal')
        terminal.writeln('  echo     - Echo text')
        terminal.writeln('  date     - Show current date and time')
        terminal.writeln('  pwd      - Show current directory')
        terminal.writeln('  ls       - List files (simulated)')
        terminal.writeln('  whoami   - Show current user')
        break
      
      case 'clear':
        terminal.clear()
        break
      
      case 'echo':
        terminal.writeln(args.slice(1).join(' '))
        break
      
      case 'date':
        terminal.writeln(new Date().toString())
        break
      
      case 'pwd':
        terminal.writeln('/workspace/shinmen-takezo-ide')
        break
      
      case 'ls':
        terminal.writeln('README.md')
        terminal.writeln('index.js')
        terminal.writeln('style.css')
        terminal.writeln('package.json')
        break
      
      case 'whoami':
        terminal.writeln('developer')
        break
      
      default:
        if (command.trim()) {
          terminal.writeln(`Command not found: ${cmd}`)
          terminal.writeln('Type "help" for available commands')
        }
        break
    }
  }

  const closeTerminal = (terminalId: string) => {
    const terminal = terminals.find(t => t.id === terminalId)
    if (terminal) {
      terminal.terminal.dispose()
    }

    setTerminals(prev => {
      const filtered = prev.filter(t => t.id !== terminalId)
      if (filtered.length === 0) {
        return []
      }
      
      // If we closed the active terminal, activate another one
      if (activeTerminalId === terminalId) {
        const newActive = filtered[filtered.length - 1]
        newActive.isActive = true
        setActiveTerminalId(newActive.id)
      }
      
      return filtered
    })
  }

  const switchTerminal = (terminalId: string) => {
    setTerminals(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === terminalId
    })))
    setActiveTerminalId(terminalId)
    
    // Fit the terminal when switching
    setTimeout(() => {
      fitAddonRef.current?.fit()
    }, 100)
  }

  return (
    <div className={`h-full flex flex-col bg-background ${isMaximized ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-secondary">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={createNewTerminal}
            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
            title="New Terminal"
          >
            <PlusIcon size={14} />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <MinimizeIcon size={14} /> : <MaximizeIcon size={14} />}
          </button>
          <button
            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
            title="Settings"
          >
            <SettingsIcon size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Tabs */}
      {terminals.length > 0 && (
        <div className="flex items-center border-b border-border bg-secondary">
          {terminals.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 py-1 text-sm cursor-pointer border-r border-border ${
                tab.isActive 
                  ? 'bg-background text-foreground' 
                  : 'text-muted-foreground hover:bg-accent'
              }`}
              onClick={() => switchTerminal(tab.id)}
            >
              <span>{tab.name}</span>
              {terminals.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTerminal(tab.id)
                  }}
                  className="hover:bg-accent rounded p-0.5"
                >
                  <XIcon size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Terminal Content */}
      <div className="flex-1 relative" ref={terminalContainerRef}>
        {terminals.map((tab) => (
          <div
            key={tab.id}
            data-terminal-id={tab.id}
            className={`absolute inset-0 ${tab.isActive ? 'block' : 'hidden'}`}
          />
        ))}
        
        {terminals.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <TerminalIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Terminal Open
              </h3>
              <p className="text-muted-foreground mb-4">
                Create a new terminal to start running commands
              </p>
              <button
                onClick={createNewTerminal}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                New Terminal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
