import React from 'react';

export default function Sidebar({ selectedBranch, setSelectedBranch, branchStats, totalStockCount }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">RTI</div>
        <div className="sidebar-title">
          <h1>L.S. Rupasinghe</h1>
          <p>Pawning Center Vault System</p>
        </div>
      </div>

      <div className="sidebar-section-title">🏢 Branch Locations</div>
      <div className="sidebar-branch-list">
        <button
          className={`branch-tab-item ${selectedBranch === 'ALL' ? 'active' : ''}`}
          onClick={() => setSelectedBranch('ALL')}
        >
          <span>🏢 ALL BRANCHES</span>
          <span className="branch-tab-badge">{totalStockCount.toLocaleString()}</span>
        </button>

        {branchStats.map(b => (
          <button
            key={b.code}
            className={`branch-tab-item ${selectedBranch === b.code ? 'active' : ''}`}
            onClick={() => setSelectedBranch(b.code)}
          >
            <div>
              <strong>{b.code}</strong> - {b.name}
            </div>
            <span className="branch-tab-badge">
              {b.count}
            </span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <span>RTI Pawn React v2.4</span>
        <span style={{ color: '#16a34a', fontWeight: 800 }}>● Online</span>
      </div>
    </aside>
  );
}
