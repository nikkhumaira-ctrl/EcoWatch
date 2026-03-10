import React from 'react';
import { Home, Camera, Trophy, MessageCircle, BarChart } from 'lucide-react';
import './BottomNav.css';

const BottomNav = ({ currentTab, setCurrentTab }) => {
    return (
        <nav className="bottom-nav glass-panel">
            <button
                className={`nav-item ${currentTab === 'feed' ? 'active' : ''}`}
                onClick={() => setCurrentTab('feed')}
            >
                <div className="nav-icon-container">
                    <Home size={24} />
                </div>
                <span>Feed</span>
            </button>

            <button
                className={`nav-item ${currentTab === 'camera' ? 'active' : ''}`}
                onClick={() => setCurrentTab('camera')}
            >
                <div className="nav-icon-container camera-btn">
                    <Camera size={28} />
                </div>
                <span>Observe</span>
            </button>

            <button
                className={`nav-item ${currentTab === 'chat' ? 'active' : ''}`}
                onClick={() => setCurrentTab('chat')}
            >
                <div className="nav-icon-container">
                    <MessageCircle size={24} />
                </div>
                <span>AI Chat</span>
            </button>

            <button
                className={`nav-item ${currentTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setCurrentTab('leaderboard')}
            >
                <div className="nav-icon-container">
                    <Trophy size={24} />
                </div>
                <span>Ranks</span>
            </button>

            {/* NEW Analytics tab */}
            <button
                className={`nav-item ${currentTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setCurrentTab('analytics')}
            >
                <div className="nav-icon-container">
                    <BarChart size={24} />
                </div>
                <span>Analytics</span>
            </button>
        </nav>
    );
};

export default BottomNav;