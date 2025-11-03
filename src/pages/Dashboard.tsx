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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-center text-gray-800">Agent Studio</h1>

        <DashboardTabs selectedTab={selectedTab} onSelectTab={setSelectedTab} />

        {selectedTab === 'agents' && <AgentTab onChatWithAgent={onChatWithAgent} />}
        {selectedTab === 'kbs' && <KnowledgeBaseTab />}
        {selectedTab === 'mcps' && <MCPTab />}
        {selectedTab === 'triggers' && <TriggerTab />}
      </div>
    </div>
  )
}


export default Dashboard
