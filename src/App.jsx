import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar.jsx';
import DailyAccounts from './components/DailyAccounts.jsx';
import StockVerification from './components/StockVerification.jsx';
import AuctionedStock from './components/AuctionedStock.jsx';
import BranchReconciliation from './components/BranchReconciliation.jsx';
import DocumentRegisters from './components/DocumentRegisters.jsx';

function playBeep(freq = 880, type = 'sine', duration = 0.12) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

export default function App() {
  const [activeStock, setActiveStock] = useState([]);
  const [auctionedStock, setAuctionedStock] = useState([]);
  const [dailyAccounts, setDailyAccounts] = useState([]);
  const [sanjayaList, setSanjayaList] = useState([]);
  const [nameMissList, setNameMissList] = useState([]);
  const [cpBranches, setCpBranches] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [activeMode, setActiveMode] = useState('accounts'); // 'accounts' or 'stock'
  const [selectedDate, setSelectedDate] = useState('2025-10-27'); // Matching user photo

  // Stock audit state
  const [stockAudit, setStockAudit] = useState(() => {
    try {
      const saved = localStorage.getItem('RTI_STOCK_AUDIT_STATE');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Day reconciled state
  const [dayReconciledState, setDayReconciledState] = useState(() => {
    try {
      const saved = localStorage.getItem('RTI_DAY_RECONCILED_STATE');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Modal
  const [flagModalItem, setFlagModalItem] = useState(null);
  const [flagIssue, setFlagIssue] = useState('Weight Mismatch');
  const [flagWeight, setFlagWeight] = useState('');
  const [flagNotes, setFlagNotes] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load Data
  useEffect(() => {
    if (window.RTI_INITIAL_DATA) {
      setActiveStock(window.RTI_INITIAL_DATA.active || []);
      setAuctionedStock(window.RTI_INITIAL_DATA.auctioned || []);
      setDailyAccounts(window.RTI_INITIAL_DATA.dailyAccounts || []);
      setSanjayaList(window.RTI_INITIAL_DATA.sanjaya || []);
      setNameMissList(window.RTI_INITIAL_DATA.nameMiss || []);
      setCpBranches(window.RTI_INITIAL_DATA.cp || []);
    } else {
      // Async fetch fallback from public/data
      Promise.all([
        fetch('/data/active_stock.json').then(r => r.json()),
        fetch('/data/auctioned_stock.json').then(r => r.json()),
        fetch('/data/daily_accounts.json').then(r => r.json()),
        fetch('/data/sanjaya_items.json').then(r => r.json()),
        fetch('/data/name_miss_items.json').then(r => r.json()),
        fetch('/data/cp_branches.json').then(r => r.json())
      ]).then(([act, auc, dly, san, nam, cp]) => {
        setActiveStock(act || []);
        setAuctionedStock(auc || []);
        setDailyAccounts(dly || []);
        setSanjayaList(san || []);
        setNameMissList(nam || []);
        setCpBranches(cp || []);
      }).catch(err => {
        console.error('Error fetching data:', err);
      });
    }
  }, []);

  const updateStockAudit = (bill, status, extra = {}) => {
    const updated = {
      ...stockAudit,
      [bill]: { status, timestamp: new Date().toISOString(), ...extra }
    };
    setStockAudit(updated);
    try {
      localStorage.setItem('RTI_STOCK_AUDIT_STATE', JSON.stringify(updated));
    } catch (e) {}
  };

  const toggleDayReconciled = (dateStr, branchCode) => {
    const key = `${dateStr}_${branchCode}`;
    const current = !!dayReconciledState[key];
    const next = !current;
    const updated = {
      ...dayReconciledState,
      [key]: next
        ? { reconciled: true, timestamp: new Date().toISOString(), signedBy: 'Auditor & Cashier' }
        : null
    };
    if (!next) delete updated[key];
    setDayReconciledState(updated);
    try {
      localStorage.setItem('RTI_DAY_RECONCILED_STATE', JSON.stringify(updated));
    } catch (e) {}
    if (next) {
      playBeep(987, 'sine', 0.2);
      showToast(`✓ Day ${dateStr} for ${branchCode} marked as Reconciled & Checked!`);
    }
  };

  // Branch statistics for sidebar
  const branchStats = useMemo(() => {
    const map = {};
    activeStock.forEach(item => {
      const b = item.branch || 'OTHER';
      if (!map[b]) {
        map[b] = { code: b, name: item.branchDesc || b, count: 0, loan: 0, weight: 0, verified: 0 };
      }
      map[b].count++;
      map[b].loan += item.loan;
      map[b].weight += item.weight;
      if (stockAudit[item.bill]?.status === 'VERIFIED') map[b].verified++;
    });
    return Object.values(map).sort((a, b) => b.loan - a.loan);
  }, [activeStock, stockAudit]);

  return (
    <div className="app-container">
      {/* LEFT SIDEBAR: Horizontal Branch Tabs / List */}
      <Sidebar
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        branchStats={branchStats}
        totalStockCount={activeStock.length}
      />

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <header className="top-navbar">
          <div className="mode-switch-group">
            <button
              className={`mode-btn ${activeMode === 'accounts' ? 'active' : ''}`}
              onClick={() => setActiveMode('accounts')}
            >
              <span>💰 Daily Accounts (Day Book)</span>
            </button>
            <button
              className={`mode-btn ${activeMode === 'stock' ? 'active' : ''}`}
              onClick={() => setActiveMode('stock')}
            >
              <span>📦 Safe Stock Verification</span>
            </button>
            <button
              className={`mode-btn ${activeMode === 'auctioned' ? 'active' : ''}`}
              onClick={() => setActiveMode('auctioned')}
            >
              <span>🔴 Auctioned Stock</span>
            </button>
            <button
              className={`mode-btn ${activeMode === 'cp' ? 'active' : ''}`}
              onClick={() => setActiveMode('cp')}
            >
              <span>📊 CP 2.xlsx Reconciliation</span>
            </button>
            <button
              className={`mode-btn ${activeMode === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveMode('documents')}
            >
              <span>📑 Document Registers</span>
            </button>
          </div>

          <div className="top-stats-row">
            <span className="stat-pill stat-pill-blue">Active Safe: Rs. 112.53M (2,333 items)</span>
            <span className="stat-pill stat-pill-gold">Gold: 7,630.71 g</span>
            <button className="btn btn-outline" onClick={() => window.print()}>🖨️ Print</button>
          </div>
        </header>

        <div className="content-body">
          {activeMode === 'accounts' && (
            <DailyAccounts
              selectedBranch={selectedBranch}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              dailyAccounts={dailyAccounts}
              dayReconciledState={dayReconciledState}
              toggleDayReconciled={toggleDayReconciled}
            />
          )}

          {activeMode === 'stock' && (
            <StockVerification
              activeStock={activeStock}
              selectedBranch={selectedBranch}
              stockAudit={stockAudit}
              updateStockAudit={updateStockAudit}
              playBeep={playBeep}
              showToast={showToast}
              setFlagModalItem={setFlagModalItem}
            />
          )}

          {activeMode === 'auctioned' && (
            <AuctionedStock auctionedStock={auctionedStock} />
          )}

          {activeMode === 'cp' && (
            <BranchReconciliation cpBranches={cpBranches} />
          )}

          {activeMode === 'documents' && (
            <DocumentRegisters sanjayaList={sanjayaList} nameMissList={nameMissList} />
          )}
        </div>
      </main>

      {/* FLAG DISCREPANCY MODAL */}
      {flagModalItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <span>Flag Safe Discrepancy: {flagModalItem.bill}</span>
              <button
                onClick={() => setFlagModalItem(null)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Issue Type</label>
                <select className="filter-input" style={{ width: '100%' }} value={flagIssue} onChange={(e) => setFlagIssue(e.target.value)}>
                  <option value="Weight Mismatch">Weight Mismatch (Scale vs Record)</option>
                  <option value="Missing Article">Missing Packet from Vault</option>
                  <option value="Karat Mismatch">Karat Test Mismatch</option>
                  <option value="Label Damaged">Barcode / Label Unreadable</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Actual Weighed Grams (Optional)</label>
                <input
                  type="number"
                  step="0.001"
                  className="filter-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. 15.420"
                  value={flagWeight}
                  onChange={(e) => setFlagWeight(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Auditor Notes</label>
                <textarea
                  rows="3"
                  className="filter-input"
                  style={{ width: '100%' }}
                  placeholder="Enter auditor remarks..."
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setFlagModalItem(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  updateStockAudit(flagModalItem.bill, 'FLAGGED', { issueType: flagIssue, actualWeight: flagWeight, notes: flagNotes });
                  setFlagModalItem(null);
                  showToast(`⚠️ Item ${flagModalItem.bill} Flagged`);
                }}
              >
                Save Discrepancy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCANNER TOAST */}
      {toast && (
        <div className="scanner-toast">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
