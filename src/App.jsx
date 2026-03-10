import React, { useState } from 'react';
import { useAppContext } from './context/AppContext';
import Auth from './pages/Auth';
import Layout from './components/Layout';

import Feed from './pages/Feed';
import Observation from './pages/Observation';
import LogDetails from './pages/LogDetails';
import Leaderboard from './pages/Leaderboard';
import AiChat from './pages/AiChat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Faq from './pages/Faq';
import Analytics from './pages/Analytics'; // <-- NEW PAGE IMPORT

function App() {
  const { currentUser } = useAppContext();
  const [currentTab, setCurrentTab] = useState('feed');
  const [selectedLog, setSelectedLog] = useState(null);

  // If user is not logged in, show Auth screen
  if (!currentUser) {
    return <Auth />;
  }

  // Define components for tabs
  const renderTabContent = () => {
  switch (currentTab) {
    case 'feed':
      return <Feed onLogClick={setSelectedLog} />;

    case 'camera':
      return <Observation onSuccess={() => setCurrentTab('feed')} />;

    case 'chat':
      return <AiChat />;

    case 'leaderboard':
      return <Leaderboard />;

    case 'profile':
      return <Profile onBack={() => setCurrentTab('feed')} />;

    case 'settings':
      return <Settings onBack={() => setCurrentTab('feed')} />;

    case 'faq':
      return <Faq onBack={() => setCurrentTab('feed')} />;

    case 'analytics':
      return <Analytics />;

    default:
      return <div style={{ padding: '1rem', textAlign: 'center' }}>Not Found</div>;
  }
};

  // Show log details if selected
  if (selectedLog) {
    return <LogDetails log={selectedLog} onBack={() => setSelectedLog(null)} />;
  }

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab} onNavigate={setCurrentTab}>
      <div className="animate-fade-in" key={currentTab}>
        {renderTabContent()}
      </div>
    </Layout>
  );
}

export default App;