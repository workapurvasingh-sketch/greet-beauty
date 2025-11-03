import React, { useState } from 'react'
import Dashboard from './pages/Dashboard'
import ChatPage from './pages/chatPage'
import { MasterAgent } from './types/dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'chat'>('dashboard')
  const [selectedAgent, setSelectedAgent] = useState<MasterAgent | null>(null)

  const navigateToChat = (agent: MasterAgent) => {
    setSelectedAgent(agent)
    setCurrentPage('chat')
  }

  const navigateToDashboard = () => {
    setCurrentPage('dashboard')
    setSelectedAgent(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-md shadow-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold gradient-text">AI Studio</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={navigateToDashboard}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 'dashboard'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('chat')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 'chat'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Test Agent
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === 'dashboard' ? (
        <Dashboard onChatWithAgent={navigateToChat} />
      ) : (
        <ChatPage selectedAgent={selectedAgent} onBack={navigateToDashboard} />
      )}
    </div>
  )
}

export default App
