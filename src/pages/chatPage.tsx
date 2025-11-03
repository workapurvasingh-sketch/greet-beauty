import React, { useEffect, useState } from 'react'
import { useAgents } from '../hooks/useAgents'
import { useSuggestionPrompts } from '../hooks/useSuggestionPrompts'
import { MasterAgent, SuggestionPrompt } from '../types/dashboard'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  tokenUsage?: {
    input_tokens?: number
    output_tokens?: number
    total_tokens?: number
  }
}

interface ChatPageProps {
  selectedAgent?: MasterAgent | null
  onBack?: () => void
}

const ChatPage: React.FC<ChatPageProps> = ({ selectedAgent: initialSelectedAgent, onBack }) => {
  const { agents, fetchAgents } = useAgents()
  const [selectedAgent, setSelectedAgent] = useState<MasterAgent | null>(initialSelectedAgent || null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Suggestion prompts for the selected agent
  const {
    suggestionPrompts,
    fetchSuggestionPrompts
  } = useSuggestionPrompts(selectedAgent?.id || '')

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    if (initialSelectedAgent) {
      setSelectedAgent(initialSelectedAgent)
    }
  }, [initialSelectedAgent])

  // Load suggestion prompts when agent changes
  useEffect(() => {
    if (selectedAgent?.id) {
      fetchSuggestionPrompts()
    }
  }, [selectedAgent?.id, fetchSuggestionPrompts])

  const sendMessage = async () => {
    if (!selectedAgent || !inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`http://localhost:8000/master/ask?agent_id=${selectedAgent.id}&message=${encodeURIComponent(inputMessage)}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      // Handle the response format with messages array
      let assistantContent = ''
      let tokenUsage = undefined

      if (data && data.messages && Array.isArray(data.messages)) {
        // Find the last AI message
        const lastMessage = data.messages[data.messages.length - 1]
        if (lastMessage && lastMessage.type === 'ai') {
          assistantContent = lastMessage.content || ''
          tokenUsage = lastMessage.usage_metadata || lastMessage.response_metadata?.token_usage
        }
      } else if (typeof data === 'string') {
        assistantContent = data
      } else {
        assistantContent = JSON.stringify(data, null, 2)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        tokenUsage: tokenUsage
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Agent Selector */}
      <div className="bg-card border-b border-border p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold gradient-text mb-4">Chat with Agents</h1>
          <div className="flex flex-wrap gap-3">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgent(agent)
                  setMessages([]) // Clear messages when switching agents
                }}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  selectedAgent?.id === agent.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'bg-muted text-foreground hover:bg-muted/60 border border-border'
                }`}
              >
                {agent.name}
              </button>
            ))}
          </div>
          {selectedAgent && (
            <div className="mt-3 text-sm text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{selectedAgent.name}</span> • {selectedAgent.model}
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        {!selectedAgent ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center animate-in">
              <div className="text-7xl mb-6">🤖</div>
              <h2 className="text-3xl font-bold text-foreground mb-3">Select an Agent</h2>
              <p className="text-muted-foreground text-lg">Choose an agent from above to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="h-full overflow-y-auto p-6 space-y-4 bg-card rounded-xl shadow-lg border border-border">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground mt-8">
                  <p className="text-lg">Start a conversation with {selectedAgent.name}</p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-2xl px-5 py-4 rounded-2xl shadow-md ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground border border-border'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>

                      {/* Token Usage for Assistant Messages */}
                      {message.role === 'assistant' && message.tokenUsage && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex flex-wrap gap-2 text-xs">
                            {message.tokenUsage.input_tokens !== undefined && (
                              <span className="badge bg-accent/10 text-accent">
                                Input: {message.tokenUsage.input_tokens}
                              </span>
                            )}
                            {message.tokenUsage.output_tokens !== undefined && (
                              <span className="badge-success">
                                Output: {message.tokenUsage.output_tokens}
                              </span>
                            )}
                            {message.tokenUsage.total_tokens !== undefined && (
                              <span className="badge bg-primary/10 text-primary font-medium">
                                Total: {message.tokenUsage.total_tokens}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start animate-in">
                  <div className="bg-muted text-foreground px-5 py-4 rounded-2xl shadow-md border border-border">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm font-medium">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestion Prompts */}
            {suggestionPrompts.length > 0 && (
              <div className="border-t border-border p-4 bg-muted/30 rounded-b-xl">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-foreground">💡 Suggestion Questions</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestionPrompts.map(prompt => (
                    <button
                      key={prompt.id}
                      onClick={() => setInputMessage(prompt.prompt)}
                      className="badge-success hover:bg-success hover:text-success-foreground transition-all duration-200 cursor-pointer"
                      title={prompt.prompt}
                    >
                      {prompt.prompt_title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border p-4 bg-card">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask ${selectedAgent.name} something...`}
                  className="input"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="btn-primary px-8"
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatPage
