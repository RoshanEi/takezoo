import axios from 'axios'
import type { 
  AIModel, 
  AIRequest, 
  AIResponse, 
  AIStreamResponse, 
  AIConfig,
  AIContext,
  AIMessage
} from '@/types/ai'

export class AIService {
  private config: AIConfig
  private abortController?: AbortController

  constructor() {
    this.config = {
      provider: 'CHUTS AI',
      apiKey: process.env.NEXT_PUBLIC_AI_API_KEY || '',
      baseUrl: process.env.NEXT_PUBLIC_AI_BASE_URL || 'https://llm.chutes.ai/v1/',
      defaultModel: 'deepseek-ai/DeepSeek-R1',
      models: [
        {
          id: 'deepseek-ai/DeepSeek-R1',
          name: 'DeepSeek R1',
          description: 'Latest DeepSeek reasoning model',
          capabilities: ['reasoning', 'code-generation', 'analysis'],
          contextWindow: 32768,
          costPerToken: 0.0001,
          provider: 'CHUTS AI'
        },
        {
          id: 'DeepSeek-R1-0528',
          name: 'DeepSeek R1 (0528)',
          description: 'DeepSeek R1 May 28 checkpoint',
          capabilities: ['reasoning', 'code-review', 'debugging'],
          contextWindow: 32768,
          costPerToken: 0.0001,
          provider: 'CHUTS AI'
        },
        {
          id: 'DeepSeek-V3-0324',
          name: 'DeepSeek V3',
          description: 'DeepSeek V3 March 24 release',
          capabilities: ['conversation', 'code-completion', 'documentation'],
          contextWindow: 16384,
          costPerToken: 0.00005,
          provider: 'CHUTS AI'
        },
        {
          id: 'Qwen3-32B',
          name: 'Qwen 3 32B',
          description: 'Qwen 3 32 billion parameter model',
          capabilities: ['multilingual', 'code-generation', 'reasoning'],
          contextWindow: 32768,
          costPerToken: 0.0001,
          provider: 'CHUTS AI'
        }
      ],
      rateLimits: {
        requestsPerMinute: 60,
        tokensPerMinute: 100000
      },
      features: {
        streaming: true,
        functionCalling: true,
        imageAnalysis: true,
        codeExecution: true
      }
    }
  }

  getModels(): AIModel[] {
    return this.config.models
  }

  getModel(modelId: string): AIModel | undefined {
    return this.config.models.find(model => model.id === modelId)
  }

  async sendMessage(request: AIRequest): Promise<AIResponse> {
    try {
      this.abortController = new AbortController()

      const response = await axios.post(
        `${this.config.baseUrl}chat/completions`,
        {
          model: request.model,
          messages: this.buildMessages(request),
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 4000,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          signal: this.abortController.signal
        }
      )

      const data = response.data
      const choice = data.choices[0]

      return {
        id: data.id,
        content: choice.message.content,
        model: request.model,
        tokens: data.usage?.total_tokens || 0,
        cost: this.calculateCost(request.model, data.usage?.total_tokens || 0),
        finishReason: choice.finish_reason,
        metadata: {
          usage: data.usage,
          created: data.created
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Request was cancelled')
      }
      
      console.error('AI Service Error:', error)
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async *streamMessage(request: AIRequest): AsyncGenerator<AIStreamResponse> {
    try {
      this.abortController = new AbortController()

      const response = await fetch(`${this.config.baseUrl}chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: request.model,
          messages: this.buildMessages(request),
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 4000,
          stream: true
        }),
        signal: this.abortController.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              
              if (data === '[DONE]') {
                yield {
                  id: '',
                  delta: '',
                  done: true,
                  model: request.model
                }
                return
              }

              try {
                const parsed = JSON.parse(data)
                const choice = parsed.choices[0]
                
                if (choice?.delta?.content) {
                  yield {
                    id: parsed.id,
                    delta: choice.delta.content,
                    done: false,
                    model: request.model,
                    tokens: parsed.usage?.total_tokens
                  }
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming response:', parseError)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled')
      }
      
      console.error('AI Streaming Error:', error)
      throw new Error(`Failed to stream message: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private buildMessages(request: AIRequest): any[] {
    const messages: any[] = []

    // Add system prompt
    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt
      })
    }

    // Add context if provided
    if (request.context) {
      const contextMessage = this.buildContextMessage(request.context)
      if (contextMessage) {
        messages.push({
          role: 'system',
          content: contextMessage
        })
      }
    }

    // Add user message
    messages.push({
      role: 'user',
      content: request.message
    })

    return messages
  }

  private buildContextMessage(context: AIContext): string {
    const parts: string[] = []

    if (context.currentFile) {
      parts.push(`Current file: ${context.currentFile}`)
    }

    if (context.selectedText) {
      parts.push(`Selected text:\n\`\`\`\n${context.selectedText}\n\`\`\``)
    }

    if (context.openFiles && context.openFiles.length > 0) {
      parts.push(`Open files: ${context.openFiles.join(', ')}`)
    }

    if (context.recentChanges && context.recentChanges.length > 0) {
      parts.push(`Recent changes: ${JSON.stringify(context.recentChanges, null, 2)}`)
    }

    if (context.errorLogs && context.errorLogs.length > 0) {
      parts.push(`Recent errors: ${JSON.stringify(context.errorLogs, null, 2)}`)
    }

    return parts.length > 0 ? `Context:\n${parts.join('\n\n')}` : ''
  }

  private calculateCost(modelId: string, tokens: number): number {
    const model = this.getModel(modelId)
    return model ? model.costPerToken * tokens : 0
  }

  cancelRequest(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.sendMessage({
        message: 'Hello, this is a test message.',
        model: this.config.defaultModel
      })
      return !!response.content
    } catch (error) {
      console.error('AI connection test failed:', error)
      return false
    }
  }
}
