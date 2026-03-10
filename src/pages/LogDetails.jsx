import React, { useState } from 'react';
import { ArrowLeft, Sparkles, MapPin, Globe, Leaf, MoreVertical, Trash2, Flag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './LogDetails.css';


const LogDetails = ({ log, onBack }) => {
    const { getUserById, aseanCountries, currentUser, deleteLog, reportLog } = useAppContext();
    const [showMenu, setShowMenu] = useState(false);

    const user = getUserById(log.userId);
    const isOwner = currentUser?.id === log.userId;
    const timeString = new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

    if (!log) return null;

    const aiThemeColor = log.aiAnalysis?.health === 'Good' || log.aiAnalysis?.health === 'Excellent'
        ? 'var(--accent-primary)'
        : log.aiAnalysis?.severity === 'High' ? 'var(--error-color)' : '#3b82f6';

    const handleActionClick = (action) => {
        setShowMenu(false);
        if (action === 'delete') {
            deleteLog(log.id);
            onBack();
        } else if (action === 'report') {
            reportLog(log.id);
            onBack();
        }
    };

    return (
        <div className="log-details-container animate-fade-in">
            <div className="details-header" style={{ position: 'relative' }}>
                <button className="icon-button back-button" onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <span className="details-title">Observation Details</span>
                <div className="post-options-container" style={{ position: 'relative' }}>
                    <button className="icon-button" onClick={() => setShowMenu(!showMenu)}>
                        <MoreVertical size={24} />
                    </button>
                    {showMenu && (
                        <div className="post-context-menu animate-fade-in" style={{ right: 0, top: '100%', minWidth: '150px' }}>
                            {isOwner ? (
                                <button className="context-item danger" onClick={() => handleActionClick('delete')}>
                                    <Trash2 size={16} /> Delete Log
                                </button>
                            ) : (
                                <button className="context-item alert" onClick={() => handleActionClick('report')}>
                                    <Flag size={16} /> Report Log
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="details-content">
                <div className="details-hero-image">
                    {log.imageUrl ? (
                        <img src={log.imageUrl} alt="Observation" />
                    ) : (
                        <div className="no-image-placeholder">
                            <Leaf size={48} opacity={0.3} />
                        </div>
                    )}
                    <div className="hero-overlay"></div>
                </div>

                <div className="main-info-card glass-panel">
                    <div className="user-row">
                        <div className="avatar-small">{user?.avatar}</div>
                        <div className="meta-col">
                            <span className="user-name">{user?.name}</span>
                            <span className="timestamp">{timeString}</span>
                        </div>
                    </div>

                    <p className="detailed-notes">{log.notes}</p>

                    <div className="location-row">
                        <MapPin size={16} className="text-muted" />
                        <span>{log.location?.name || 'Unknown Location'}</span>
                    </div>
                </div>

                {log.aiAnalysis && (
                    <div className="ai-analysis-card glass-panel" style={{ '--theme-color': aiThemeColor }}>
                        <div className="ai-header">
                            <Sparkles size={20} color="var(--theme-color)" />
                            <h3>AI Discovery & Analysis</h3>
                        </div>

                        <div className="ai-data-grid">
                            <div className="ai-data-item">
                                <span className="data-label">Identified</span>
                                <span className="data-value highlight">
                                    {log.aiAnalysis.species || log.aiAnalysis.category}
                                </span>
                            </div>
                            <div className="ai-data-item">
                                <span className="data-label">Confidence</span>
                                <span className="data-value">{(log.aiAnalysis.confidence * 100).toFixed(1)}%</span>
                            </div>
                            {log.aiAnalysis.health && (
                                <div className="ai-data-item">
                                    <span className="data-label">Health</span>
                                    <span className="data-value" style={{ color: 'var(--theme-color)' }}>
                                        {log.aiAnalysis.health}
                                    </span>
                                </div>
                            )}
                            {log.aiAnalysis.severity && (
                                <div className="ai-data-item">
                                    <span className="data-label">Severity</span>
                                    <span className="data-value" style={{ color: 'var(--theme-color)' }}>
                                        {log.aiAnalysis.severity}
                                    </span>
                                </div>
                            )}
                        </div>

                        {log.aiAnalysis.actionableInsight && (
                            <div className="actionable-insight">
                                <strong>Recommendation:</strong> {log.aiAnalysis.actionableInsight}
                            </div>
                        )}

                        {log.aiAnalysis.identifiedObjects && (
                            <div className="tags-container">
                                {log.aiAnalysis.identifiedObjects.map(obj => (
                                    <span key={obj} className="tag">{obj}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {log.aiAnalysis?.culturalContext && (
                    <div className="cultural-card glass-panel">
                        <div className="cultural-header">
                            <Globe size={20} color="#eab308" />
                            <h3>ASEAN Cultural Context</h3>
                        </div>
                        <p className="cultural-subtitle">How this observation is understood across the region:</p>

                        <div className="translations-list">
                            {Object.entries(log.aiAnalysis.culturalContext).map(([langId, text]) => {
                                const country = aseanCountries.find(c => c.id === langId);
                                const isEnglish = langId === 'en';
                                return (
                                    <div key={langId} className="translation-item">
                                        <div className="lang-badge">
                                            {isEnglish ? '🌐 EN' : `${country?.flag} ${langId.toUpperCase()}`}
                                        </div>
                                        <p className="translated-text">{text}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogDetails;
