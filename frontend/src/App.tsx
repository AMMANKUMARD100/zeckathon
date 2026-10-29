import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './components/Overview';
import { ClientManager } from './components/ClientManager';
import { GoalPlanner } from './components/GoalPlanner';
import { DocumentAssistant } from './components/DocumentAssistant';
import { ProposalList } from './components/ProposalList';
import { SuitabilityLab } from './components/SuitabilityLab';
import { DocumentLibrary } from './components/DocumentLibrary';
import { SettingsTab } from './components/SettingsTab';

export function App() {
  const [currentTab, setCurrentTab] = useState('overview');

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Persistent Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {currentTab === 'overview' && <Overview setCurrentTab={setCurrentTab} />}
        {currentTab === 'clients' && <ClientManager />}
        {currentTab === 'goals' && <GoalPlanner />}
        {currentTab === 'rag' && <DocumentAssistant />}
        {currentTab === 'proposals' && <ProposalList />}
        {currentTab === 'suitability-lab' && <SuitabilityLab />}
        {currentTab === 'documents' && <DocumentLibrary />}
        {currentTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

export default App;
