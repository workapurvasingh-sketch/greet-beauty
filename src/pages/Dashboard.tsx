import React, { useState } from 'react'
import DashboardTabs from '../components/dashboard/DashboardTabs'
import AgentTab from '../components/dashboard/AgentTab'
import KnowledgeBaseTab from '../components/dashboard/KnowledgeBaseTab'
import MCPTab from '../components/dashboard/MCPTab'
import TriggerTab from '../components/dashboard/TriggerTab'
import { MasterAgent } from '../types/dashboard'

interface DashboardProps {
  onChatWithAgent: (agent: MasterAgent) => void
}

const Dashboard: React.FC<DashboardProps> = ({ onChatWithAgent }) => {
  const [selectedTab, setSelectedTab] = useState<'agents' | 'kbs' | 'mcps' | 'triggers'>('agents')

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container mx-auto px-4 py-8 md:p-8 max-w-7xl">
        <div className="text-center mb-12 animate-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 gradient-text">
            Agent Studio
          </h1>
          <p className="text-muted-foreground text-lg">
            Build and manage your AI agents with ease
          </p>
        </div>

        <DashboardTabs selectedTab={selectedTab} onSelectTab={setSelectedTab} />

        <div className="animate-in">
          {selectedTab === 'agents' && <AgentTab onChatWithAgent={onChatWithAgent} />}
          {selectedTab === 'kbs' && <KnowledgeBaseTab />}
          {selectedTab === 'mcps' && <MCPTab />}
          {selectedTab === 'triggers' && <TriggerTab />}
        </div>
      </div>
    </div>
  )
}


export default Dashboard
