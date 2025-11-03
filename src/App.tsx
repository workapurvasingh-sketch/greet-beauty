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
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AI Studio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={navigateToDashboard}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'dashboard'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('chat')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'chat'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
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
