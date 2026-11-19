/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Boards from './components/Boards';
import Sprints from './components/Sprints';
import Retrospectives from './components/Retrospectives';
import AIMeetingAssistant from './components/AIMeetingAssistant';
import Toast from './components/Toast';
import WorkspaceSelection from './components/WorkspaceSelection';
import { useSyncLogic } from './context/SyncLogicContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('boards');
  const { state } = useSyncLogic();

  useEffect(() => {
    document.body.dataset.theme = state.theme;
  }, [state.theme]);

  if (!state.currentTeamId) {
    return (
      <div className="h-screen w-full overflow-hidden font-sans">
        <WorkspaceSelection />
        <Toast />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 h-full overflow-hidden relative">
        {activeTab === 'boards' && <Boards />}
        {activeTab === 'sprints' && <Sprints />}
        {activeTab === 'retrospectives' && <Retrospectives />}
        <AIMeetingAssistant />
        <Toast />
      </main>
    </div>
  );
}
