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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Agent Selector */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Chat with Agents</h1>
          <div className="flex flex-wrap gap-2">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgent(agent)
                  setMessages([]) // Clear messages when switching agents
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedAgent?.id === agent.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {agent.name}
              </button>
            ))}
          </div>
          {selectedAgent && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: <span className="font-medium">{selectedAgent.name}</span> - {selectedAgent.model}
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {!selectedAgent ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Select an Agent</h2>
              <p className="text-gray-500">Choose an agent from above to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="h-full overflow-y-auto p-4 space-y-4 bg-white rounded-lg shadow-inner">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <p>Start a conversation with {selectedAgent.name}</p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-lg shadow-sm ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>

                      {/* Token Usage for Assistant Messages */}
                      {message.role === 'assistant' && message.tokenUsage && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                            {message.tokenUsage.input_tokens !== undefined && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Input: {message.tokenUsage.input_tokens}
                              </span>
                            )}
                            {message.tokenUsage.output_tokens !== undefined && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                Output: {message.tokenUsage.output_tokens}
                              </span>
                            )}
                            {message.tokenUsage.total_tokens !== undefined && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                                Total: {message.tokenUsage.total_tokens}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestion Prompts */}
            {suggestionPrompts.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">💡 Suggestion Questions</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestionPrompts.map(prompt => (
                    <button
                      key={prompt.id}
                      onClick={() => setInputMessage(prompt.prompt)}
                      className="bg-green-100 hover:bg-green-200 text-green-800 text-xs px-3 py-2 rounded-full border border-green-300 transition-colors hover:border-green-400"
                      title={prompt.prompt}
                    >
                      {prompt.prompt_title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask ${selectedAgent.name} something...`}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
