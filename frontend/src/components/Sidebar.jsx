import React from 'react';
import { Plus, MessageSquare, Database, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({ sessions = [], currentSessionId, onNewChat }) => {
    return (
        <div className="sidebar">
            <Link to="/" className="new-chat-btn" onClick={onNewChat}>
                <Plus size={16} />
                New chat
            </Link>

            <div className="sidebar-nav">
                {sessions.map((s) => (
                    <Link
                        key={s.id}
                        to={`/c/${s.id}`}
                        className="sidebar-nav-item"
                        style={{ backgroundColor: currentSessionId === s.id ? '#343541' : 'transparent' }}
                    >
                        <MessageSquare size={16} />
                        {s.name || 'New Chat'}
                    </Link>
                ))}
            </div>

            <div style={{ borderTop: '1px solid #4d4d4f', padding: '0.5rem 0' }}>
                <div className="sidebar-nav-item">
                    <Database size={16} />
                    Check Usage
                </div>
                <div className="sidebar-nav-item">
                    <Settings size={16} />
                    Settings
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
