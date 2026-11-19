# RTI Pawn - Unified React Enterprise Stock & Accounts System

Full-stack enterprise React 18 & Vite management portal for **L.S. Rupasinghe Pawning Center (RTI Pawn)**.

## Features
- **🏢 Horizontal Branch Tabs / Sidebar**: Instant navigation across all 16 locations (Kadawatha, Kiribathgoda 2, Panadura, Homagama, Wattala 2, Kottawa, etc.).
- **💰 Daily Accounts Balancing (Day Book)**: Matches physical pawn accounting ledger (`CP/CB`), daily loan disbursements (Rs. 316,600.00), redemptions (Rs. 228,600.00), CCP interest, and auditor sign-off.
- **📦 In-Safe Stock Verification**: Checkable safe verification audit for 2,333 articles (Rs. 112.53M | 7,630.71g Gold), barcode scanner, sound alerts, date range filters, and discrepancy logger.
- **🔴 Auctioned Articles**: 1,119 forfeited loans.
- **📊 Branch Books**: CP 2.xlsx monthly ledgers across 22 branches.
- **📑 Document Registers**: MR.SANJAYA.xlsx (122 loans) & Name Miss List (67 loans).

## Development
```bash
npm install
npm run dev
```

## Production Build & Vercel
```bash
npm run build
```
Vercel automatically detects `vite` framework with zero configuration.
