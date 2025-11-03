import React from 'react'

type TabType = 'agents' | 'kbs' | 'mcps' | 'triggers'

interface DashboardTabsProps {
  selectedTab: TabType
  onSelectTab: (tab: TabType) => void
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ selectedTab, onSelectTab }) => {
  const tabs: { key: TabType; label: string; color: string }[] = [
    { key: 'agents', label: 'Agents', color: 'blue' },
    { key: 'kbs', label: 'Knowledge Bases', color: 'green' },
    { key: 'mcps', label: 'MCP Servers', color: 'purple' },
    { key: 'triggers', label: 'Triggers', color: 'red' }
  ]

  return (
    <div className="flex flex-wrap justify-center mb-10 gap-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            selectedTab === tab.key
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105'
              : 'bg-card text-foreground hover:bg-muted border border-border hover-scale'
          }`}
          onClick={() => onSelectTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default DashboardTabs
