import React, { useState, useMemo } from 'react';

function naturalCompare(a, b) {
  return String(a || '').localeCompare(String(b || ''), undefined, { numeric: true, sensitivity: 'base' });
}

export default function StockVerification({
  activeStock,
  selectedBranch,
  stockAudit,
  updateStockAudit,
  playBeep,
  showToast,
  setFlagModalItem
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateField, setDateField] = useState('pawnDate');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortCol, setSortCol] = useState('pawnDate');
  const [sortAsc, setSortAsc] = useState(true);

  const handleBarcodeSubmit = (e) => {
    if (e.key === 'Enter') {
      const val = e.target.value.trim().toUpperCase();
      if (!val) return;
      const match = activeStock.find(i => i.bill.toUpperCase() === val || i.bill.toUpperCase().includes(val));
      if (match) {
        updateStockAudit(match.bill, 'VERIFIED');
        playBeep(987, 'sine', 0.15);
        showToast(`✓ Verified: ${match.bill} (${match.itemDesc} - ${match.weight}g)`);
        e.target.value = '';
      } else {
        playBeep(220, 'sawtooth', 0.25);
        alert(`No active safe article found for: "${val}"`);
      }
    }
  };

  const filteredStock = useMemo(() => {
    let list = activeStock.filter(item => {
      if (selectedBranch !== 'ALL' && item.branch !== selectedBranch) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = item.bill.toLowerCase().includes(q) ||
          (item.branchDesc && item.branchDesc.toLowerCase().includes(q)) ||
          (item.itemDesc && item.itemDesc.toLowerCase().includes(q));
        if (!matches) return false;
      }
      const st = stockAudit[item.bill]?.status || 'PENDING';
      if (statusFilter !== 'ALL' && st !== statusFilter) return false;

      if (dateFrom || dateTo) {
        const dt = item[dateField];
        if (!dt) return false;
        if (dateFrom && dt < dateFrom) return false;
        if (dateTo && dt > dateTo) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];

      if (sortCol === 'bill') {
        return sortAsc ? naturalCompare(valA, valB) : naturalCompare(valB, valA);
      }

      if (sortCol === 'pawnDate' || sortCol === 'dueDate' || sortCol === 'forfeitDate') {
        if (!valA && !valB) return naturalCompare(a.bill, b.bill);
        if (!valA) return 1;
        if (!valB) return -1;
        const timeA = new Date(valA).getTime();
        const timeB = new Date(valB).getTime();
        if (timeA !== timeB) return sortAsc ? timeA - timeB : timeB - timeA;
        return naturalCompare(a.bill, b.bill);
      }

      if (typeof valA === 'number' || typeof valB === 'number') {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        if (numA !== numB) return sortAsc ? numA - numB : numB - numA;
        return naturalCompare(a.bill, b.bill);
      }

      const cmp = String(valA || '').localeCompare(String(valB || ''), undefined, { numeric: true, sensitivity: 'base' });
      if (cmp !== 0) return sortAsc ? cmp : -cmp;
      return naturalCompare(a.bill, b.bill);
    });

    return list;
  }, [activeStock, selectedBranch, searchQuery, statusFilter, dateField, dateFrom, dateTo, sortCol, sortAsc, stockAudit]);

  return (
    <div>
      {/* Barcode Search & Filters */}
      <div className="filter-row">
        <div style={{ flex: 1, minWidth: '280px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            className="filter-input"
            placeholder="Scan Barcode or Search Bill No (Press Enter to Verify)..."
            style={{ width: '100%' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleBarcodeSubmit}
          />
        </div>

        <select
          className="filter-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Audit Statuses</option>
          <option value="PENDING">Pending (Not in Safe yet)</option>
          <option value="VERIFIED">Verified (✓ In Safe)</option>
          <option value="FLAGGED">Flagged / Discrepancy</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b' }}>Dates:</span>
          <input
            type="date"
            className="filter-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span>-</span>
          <input
            type="date"
            className="filter-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <button className="btn btn-outline" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear</button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            Showing <strong>{filteredStock.length.toLocaleString()}</strong> Safe Articles for <strong>{selectedBranch}</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Click column headers to sort | Items order sequence strictly maintained
          </div>
        </div>

        <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                <th onClick={() => { setSortCol('bill'); setSortAsc(!sortAsc); }}>Order / Bill No</th>
                <th onClick={() => { setSortCol('branch'); setSortAsc(!sortAsc); }}>Branch</th>
                <th onClick={() => { setSortCol('itemDesc'); setSortAsc(!sortAsc); }}>Article</th>
                <th onClick={() => { setSortCol('karat'); setSortAsc(!sortAsc); }}>Karat</th>
                <th onClick={() => { setSortCol('weight'); setSortAsc(!sortAsc); }} style={{ textAlign: 'right' }}>Weight (g)</th>
                <th onClick={() => { setSortCol('loan'); setSortAsc(!sortAsc); }} style={{ textAlign: 'right' }}>Loan (Rs.)</th>
                <th onClick={() => { setSortCol('pawnDate'); setSortAsc(!sortAsc); }}>Pawn Date</th>
                <th onClick={() => { setSortCol('dueDate'); setSortAsc(!sortAsc); }}>Redeem Due</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Check / Audit</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.slice(0, 300).map((item, idx) => {
                const audit = stockAudit[item.bill];
                const st = audit ? audit.status : 'PENDING';
                return (
                  <tr key={item.bill} className={st === 'VERIFIED' ? 'row-verified' : (st === 'FLAGGED' ? 'row-flagged' : '')}>
                    <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '11px' }}>{idx + 1}</td>
                    <td><strong>{item.bill}</strong></td>
                    <td><span className="badge badge-gold">{item.branch}</span> {item.branchDesc}</td>
                    <td><strong>{item.itemDesc || item.itemCode}</strong></td>
                    <td>{item.karat ? `${item.karat}K` : '-'}</td>
                    <td style={{ textAlign: 'right' }}><strong>{Number(item.weight).toFixed(3)} g</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>Rs. {Number(item.loan).toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                    <td>{item.pawnDate || '-'}</td>
                    <td>{item.dueDate || '-'}</td>
                    <td>
                      {st === 'VERIFIED' && <span className="badge badge-verified">✓ IN SAFE</span>}
                      {st === 'PENDING' && <span className="badge badge-pending">PENDING</span>}
                      {st === 'FLAGGED' && <span className="badge badge-flagged" title={audit.notes}>⚠️ {audit.issueType}</span>}
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {st !== 'VERIFIED' ? (
                        <button
                          className="btn btn-success"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => { updateStockAudit(item.bill, 'VERIFIED'); playBeep(987, 'sine', 0.12); }}
                        >
                          ✓ Verify
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => updateStockAudit(item.bill, 'PENDING')}
                        >
                          Undo
                        </button>
                      )}
                      <button
                        className="btn btn-outline"
                        style={{ padding: '3px 8px', fontSize: '11px', marginLeft: '4px' }}
                        onClick={() => setFlagModalItem(item)}
                      >
                        ⚠️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
