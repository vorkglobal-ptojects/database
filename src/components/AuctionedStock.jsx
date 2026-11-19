import React from 'react';

export default function AuctionedStock({ auctionedStock }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">🔴 Forfeited & Auctioned Stock (1,119 Items)</div>
        <strong style={{ color: '#b91c1c' }}>Total: Rs. 24,116,865.00 | 2,303.49 g</strong>
      </div>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Bill No</th>
              <th>Branch</th>
              <th>Article</th>
              <th>Karat</th>
              <th style={{ textAlign: 'right' }}>Weight (g)</th>
              <th style={{ textAlign: 'right' }}>Loan (Rs.)</th>
              <th>Auction Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {auctionedStock.slice(0, 150).map((a, idx) => (
              <tr key={a.bill}>
                <td>{idx + 1}</td>
                <td><strong>{a.bill}</strong></td>
                <td><span className="badge badge-gold">{a.branch}</span> {a.branchDesc}</td>
                <td>{a.itemDesc}</td>
                <td>{a.karat}K</td>
                <td style={{ textAlign: 'right' }}>{Number(a.weight).toFixed(3)} g</td>
                <td style={{ textAlign: 'right' }}>Rs. {Number(a.loan).toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                <td>{a.auctionDate || '-'}</td>
                <td><span className="badge badge-urgent">AUCTIONED</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
