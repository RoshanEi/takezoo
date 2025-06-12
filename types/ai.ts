export interface AIModel {
  id: string
  name: string
  description: string
  capabilities: AICapability[]
  contextWindow: number
  costPerToken: number
  provider: string
}

export type AICapability = 
  | 'reasoning'
  | 'code-generation'
  | 'code-review'
  | 'debugging'
  | 'analysis'
  | 'conversation'
  | 'code-completion'
  | 'documentation'
  | 'multilingual'
  | 'image-analysis'
  | 'function-calling'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  model?: string
  tokens?: number
  cost?: number
  metadata?: Record<string, any>
}

export interface AIConversation {
  id: string
  title: string
  messages: AIMessage[]
  model: string
  createdAt: Date
  updatedAt: Date
  context?: AIContext
}

export interface AIContext {
  currentFile?: string
  selectedText?: string
  openFiles?: string[]
  projectStructure?: any
  recentChanges?: any[]
  debugInfo?: any
  errorLogs?: any[]
}

export interface AIRequest {
  message: string
  model: string
  context?: AIContext
  stream?: boolean
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface AIResponse {
  id: string
  content: string
  model: string
  tokens: number
  cost: number
  finishReason: 'stop' | 'length' | 'content_filter' | 'function_call'
  metadata?: Record<string, any>
}

export interface AIStreamResponse {
  id: string
  delta: string
  done: boolean
  model: string
  tokens?: number
}

export interface AIAgent {
  id: string
  name: string
  description: string
  systemPrompt: string
  model: string
  capabilities: AICapability[]
  temperature: number
  maxTokens: number
  isActive: boolean
  avatar?: string
}

export interface AICodeSuggestion {
  id: string
  type: 'completion' | 'refactor' | 'fix' | 'optimize' | 'generate'
  title: string
  description: string
  code: string
  language: string
  confidence: number
  fileId?: string
  line?: number
  column?: number
  range?: {
    startLine: number
    startColumn: number
    endLine: number
    endColumn: number
  }
}

export interface AIAnalysis {
  id: string
  type: 'code-review' | 'security' | 'performance' | 'quality' | 'documentation'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  description: string
  fileId: string
  line?: number
  column?: number
  suggestions?: AICodeSuggestion[]
  confidence: number
}

export interface AITask {
  id: string
  type: 'code-generation' | 'debugging' | 'testing' | 'documentation' | 'refactoring'
  status: 'pending' | 'running' | 'completed' | 'failed'
  title: string
  description: string
  input: any
  output?: any
  error?: string
  progress?: number
  createdAt: Date
  completedAt?: Date
}

export interface AIConfig {
  provider: string
  apiKey: string
  baseUrl: string
  models: AIModel[]
  defaultModel: string
  rateLimits: {
    requestsPerMinute: number
    tokensPerMinute: number
  }
  features: {
    streaming: boolean
    functionCalling: boolean
    imageAnalysis: boolean
    codeExecution: boolean
  }
}

export interface AIUsageStats {
  totalRequests: number
  totalTokens: number
  totalCost: number
  requestsByModel: Record<string, number>
  tokensByModel: Record<string, number>
  costByModel: Record<string, number>
  averageResponseTime: number
  errorRate: number
}
