'use client'

import { useState } from 'react'
import { AIMessage } from '@/types/ai'
import { BotIcon, UserIcon, CopyIcon, CheckIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ChatMessageProps {
  message: AIMessage
  onCopy: () => void
}

export function ChatMessage({ message, onCopy }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      onCopy()
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    const lines = content.split('\n')
    const formattedLines = lines.map((line, index) => {
      // Code blocks
      if (line.startsWith('```')) {
        return (
          <div key={index} className="text-xs text-muted-foreground font-mono">
            {line}
          </div>
        )
      }
      
      // Inline code
      if (line.includes('`')) {
        const parts = line.split('`')
        return (
          <div key={index}>
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <code key={partIndex} className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                  {part}
                </code>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </div>
        )
      }
      
      // Bullet points
      if (line.startsWith('•') || line.startsWith('-')) {
        return (
          <div key={index} className="ml-2">
            {line}
          </div>
        )
      }
      
      // Headers
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)?.[0].length || 1
        const text = line.replace(/^#+\s*/, '')
        const className = level === 1 ? 'text-lg font-bold' : 'text-base font-semibold'
        return (
          <div key={index} className={className}>
            {text}
          </div>
        )
      }
      
      return <div key={index}>{line || <br />}</div>
    })
    
    return formattedLines
  }

  return (
    <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        message.role === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-secondary text-secondary-foreground'
      }`}>
        {message.role === 'user' ? (
          <UserIcon size={16} />
        ) : (
          <BotIcon size={16} />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-full p-3 rounded-lg ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}>
          <div className="text-sm whitespace-pre-wrap break-words">
            {formatContent(message.content)}
          </div>
        </div>

        {/* Message Footer */}
        <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
          message.role === 'user' ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatDate(message.timestamp)}</span>
          
          {message.model && (
            <span>• {message.model.split('/').pop()}</span>
          )}
          
          {message.tokens && (
            <span>• {message.tokens} tokens</span>
          )}
          
          {message.cost && (
            <span>• ${message.cost.toFixed(4)}</span>
          )}

          <button
            onClick={handleCopy}
            className="p-1 hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy message"
          >
            {copied ? (
              <CheckIcon size={12} className="text-green-500" />
            ) : (
              <CopyIcon size={12} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
