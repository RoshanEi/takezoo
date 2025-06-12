'use client'

import { useState, useEffect, useRef } from 'react'
import { AIService } from '@/lib/aiService'
import { FileSystemService } from '@/lib/fileSystem'
import { ChatMessage } from './ChatMessage'
import { AgentSelector } from './AgentSelector'
import type { AIMessage, AIModel } from '@/types/ai'
import { SendIcon, BotIcon, UserIcon, SettingsIcon } from 'lucide-react'
import { generateId } from '@/lib/utils'

interface ChatPanelProps {
  aiService: AIService
  fileSystem: FileSystemService
}

export function ChatPanel({ aiService, fileSystem }: ChatPanelProps) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('deepseek-ai/DeepSeek-R1')
  const [models] = useState<AIModel[]>(aiService.getModels())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: AIMessage = {
      id: generateId(),
      role: 'assistant',
      content: `Hello! I'm Shinmen, your AI coding assistant. I'm here to help you with:

• Code generation and completion
• Debugging and error fixing
• Code review and optimization
• Documentation writing
• Explaining complex concepts
• Architecture recommendations

How can I assist you today?`,
      timestamp: new Date(),
      model: selectedModel
    }
    setMessages([welcomeMessage])
  }, [selectedModel])

  // Listen for AI requests from editor
  useEffect(() => {
    const handleAIRequest = (event: CustomEvent) => {
      const { type, code, file, language } = event.detail
      let prompt = ''
      
      switch (type) {
        case 'explain':
          prompt = `Please explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
          break
        case 'improve':
          prompt = `Please suggest improvements for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
          break
        case 'fix':
          prompt = `Please help fix any issues in this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
          break
      }
      
      if (prompt) {
        setInputMessage(prompt)
        inputRef.current?.focus()
      }
    }

    window.addEventListener('ai-request', handleAIRequest as EventListener)
    return () => {
      window.removeEventListener('ai-request', handleAIRequest as EventListener)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: AIMessage = {
      id: generateId(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      model: selectedModel
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await aiService.sendMessage({
        message: userMessage.content,
        model: selectedModel,
        context: {
          // Add context from current file system state
          openFiles: [], // TODO: Get from editor state
          projectStructure: await getProjectStructure()
        }
      })

      const assistantMessage: AIMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        model: selectedModel,
        tokens: response.tokens,
        cost: response.cost
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      
      const errorMessage: AIMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
        model: selectedModel
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getProjectStructure = async () => {
    try {
      const files = await fileSystem.getFileTree()
      return files.map(file => ({
        name: file.name,
        type: file.type,
        path: file.path
      }))
    } catch (error) {
      console.error('Failed to get project structure:', error)
      return []
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BotIcon size={16} className="text-primary" />
            <h3 className="text-sm font-medium text-foreground">Shinmen AI</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground text-xs"
              title="Clear Chat"
            >
              Clear
            </button>
            <button
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
              title="Settings"
            >
              <SettingsIcon size={14} />
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <AgentSelector
          models={models}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onCopy={() => {
              navigator.clipboard.writeText(message.content)
            }}
          />
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <BotIcon size={16} className="animate-pulse" />
            <span className="text-sm">Shinmen is thinking...</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Shinmen anything about your code..."
              className="w-full p-2 pr-10 text-sm bg-background border border-border rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              rows={3}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2 bottom-2 p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendIcon size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{messages.length} messages</span>
        </div>
      </div>
    </div>
  )
}
