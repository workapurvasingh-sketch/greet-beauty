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
    <div className="flex flex-wrap justify-center mb-8 space-x-2 md:space-x-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`px-4 py-3 mb-2 rounded-lg shadow-md transform hover:scale-105 transition duration-200 ${
            selectedTab === tab.key
              ? `bg-${tab.color}-600 text-white shadow-lg`
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
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
