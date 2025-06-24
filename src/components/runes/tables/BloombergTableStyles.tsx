'use client';

import React from 'react';

/**
 * Bloomberg Terminal styled wrapper for Runes tables
 * Provides the iconic Bloomberg Terminal aesthetic with:
 * - Professional black/orange color scheme
 * - Monospace fonts for data
 * - Terminal-style borders and effects
 * - Bloomberg-inspired animations
 */

interface BloombergTableStylesProps {
  children: React.ReactNode;
  className?: string;
}

export const BloombergTableStyles: React.FC<BloombergTableStylesProps> = ({
  children,
  className = ''
}) => {
  return (
    <>
      {/* Bloomberg Terminal CSS Styles */}
      <style jsx global>{`
        /* Bloomberg Terminal Theme Variables */
        :root {
          --bloomberg-bg: #000000;
          --bloomberg-surface: #1a1a1a;
          --bloomberg-border: #333333;
          --bloomberg-orange: #ff8c00;
          --bloomberg-green: #00ff00;
          --bloomberg-red: #ff0000;
          --bloomberg-blue: #0080ff;
          --bloomberg-yellow: #ffff00;
          --bloomberg-text: #ffffff;
          --bloomberg-text-dim: #cccccc;
          --bloomberg-text-muted: #888888;
        }

        /* Bloomberg Table Container */
        .bloomberg-table-container {
          background: var(--bloomberg-bg);
          color: var(--bloomberg-text);
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          border: 2px solid var(--bloomberg-orange);
          border-radius: 0;
          box-shadow: 
            0 0 20px rgba(255, 140, 0, 0.3),
            inset 0 0 20px rgba(255, 140, 0, 0.1);
        }

        /* Bloomberg Table Header */
        .bloomberg-table-header {
          background: linear-gradient(90deg, var(--bloomberg-orange) 0%, #ff6b00 100%);
          color: var(--bloomberg-bg);
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 3px solid var(--bloomberg-orange);
          padding: 12px 16px;
        }

        .bloomberg-table-header h1 {
          font-size: 1.5rem;
          margin: 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .bloomberg-table-header p {
          font-size: 0.875rem;
          margin: 4px 0 0 0;
          opacity: 0.9;
        }

        /* Bloomberg Table */
        .bloomberg-table {
          background: var(--bloomberg-bg);
          width: 100%;
          border-collapse: collapse;
        }

        .bloomberg-table th {
          background: var(--bloomberg-surface);
          color: var(--bloomberg-orange);
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid var(--bloomberg-border);
          border-bottom: 2px solid var(--bloomberg-orange);
          padding: 12px 8px;
          font-size: 0.75rem;
        }

        .bloomberg-table th:hover {
          background: linear-gradient(90deg, var(--bloomberg-surface) 0%, #2a2a2a 100%);
          color: var(--bloomberg-yellow);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bloomberg-table td {
          background: var(--bloomberg-bg);
          color: var(--bloomberg-text);
          border: 1px solid var(--bloomberg-border);
          padding: 8px;
          font-size: 0.875rem;
          font-family: 'SF Mono', monospace;
        }

        .bloomberg-table tbody tr:hover {
          background: linear-gradient(90deg, #001a00 0%, #000d1a 100%);
          border-left: 3px solid var(--bloomberg-orange);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .bloomberg-table tbody tr:hover td {
          color: var(--bloomberg-yellow);
        }

        /* Bloomberg Data Types */
        .bloomberg-currency {
          color: var(--bloomberg-green);
          font-weight: bold;
          text-align: right;
        }

        .bloomberg-percentage-positive {
          color: var(--bloomberg-green);
          font-weight: bold;
        }

        .bloomberg-percentage-negative {
          color: var(--bloomberg-red);
          font-weight: bold;
        }

        .bloomberg-address {
          color: var(--bloomberg-blue);
          font-family: 'SF Mono', monospace;
          font-size: 0.75rem;
        }

        .bloomberg-hash {
          color: var(--bloomberg-text-dim);
          font-family: 'SF Mono', monospace;
          font-size: 0.75rem;
        }

        /* Bloomberg Status Indicators */
        .bloomberg-status-confirmed {
          color: var(--bloomberg-green);
          font-weight: bold;
        }

        .bloomberg-status-pending {
          color: var(--bloomberg-yellow);
          font-weight: bold;
          animation: bloomberg-blink 1.5s infinite;
        }

        .bloomberg-status-failed {
          color: var(--bloomberg-red);
          font-weight: bold;
        }

        @keyframes bloomberg-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.5; }
        }

        /* Bloomberg Transaction Types */
        .bloomberg-tx-mint {
          background: rgba(0, 255, 0, 0.1);
          color: var(--bloomberg-green);
          border: 1px solid var(--bloomberg-green);
          padding: 2px 6px;
          border-radius: 2px;
          font-size: 0.6875rem;
          font-weight: bold;
        }

        .bloomberg-tx-transfer {
          background: rgba(0, 128, 255, 0.1);
          color: var(--bloomberg-blue);
          border: 1px solid var(--bloomberg-blue);
          padding: 2px 6px;
          border-radius: 2px;
          font-size: 0.6875rem;
          font-weight: bold;
        }

        .bloomberg-tx-burn {
          background: rgba(255, 0, 0, 0.1);
          color: var(--bloomberg-red);
          border: 1px solid var(--bloomberg-red);
          padding: 2px 6px;
          border-radius: 2px;
          font-size: 0.6875rem;
          font-weight: bold;
        }

        .bloomberg-tx-trade {
          background: rgba(255, 255, 0, 0.1);
          color: var(--bloomberg-yellow);
          border: 1px solid var(--bloomberg-yellow);
          padding: 2px 6px;
          border-radius: 2px;
          font-size: 0.6875rem;
          font-weight: bold;
        }

        /* Bloomberg Loading States */
        .bloomberg-loading {
          background: linear-gradient(90deg, transparent 0%, var(--bloomberg-orange) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: bloomberg-loading 1.5s infinite;
        }

        @keyframes bloomberg-loading {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Bloomberg Stats Cards */
        .bloomberg-stat-card {
          background: var(--bloomberg-surface);
          border: 1px solid var(--bloomberg-orange);
          color: var(--bloomberg-text);
          padding: 16px;
          margin: 8px 0;
        }

        .bloomberg-stat-card h3 {
          color: var(--bloomberg-orange);
          font-size: 0.875rem;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .bloomberg-stat-card .value {
          color: var(--bloomberg-green);
          font-size: 1.5rem;
          font-weight: bold;
          font-family: 'SF Mono', monospace;
        }

        /* Bloomberg Filters */
        .bloomberg-filter {
          background: var(--bloomberg-surface);
          border: 1px solid var(--bloomberg-border);
          color: var(--bloomberg-text);
          padding: 8px 12px;
          font-family: 'SF Mono', monospace;
        }

        .bloomberg-filter:focus {
          border-color: var(--bloomberg-orange);
          box-shadow: 0 0 10px rgba(255, 140, 0, 0.3);
        }

        .bloomberg-filter-button {
          background: var(--bloomberg-surface);
          border: 1px solid var(--bloomberg-orange);
          color: var(--bloomberg-orange);
          padding: 8px 16px;
          font-family: 'SF Mono', monospace;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bloomberg-filter-button:hover {
          background: var(--bloomberg-orange);
          color: var(--bloomberg-bg);
        }

        .bloomberg-filter-button.active {
          background: var(--bloomberg-orange);
          color: var(--bloomberg-bg);
          box-shadow: 0 0 15px rgba(255, 140, 0, 0.5);
        }

        /* Bloomberg Pagination */
        .bloomberg-pagination {
          background: var(--bloomberg-surface);
          border-top: 2px solid var(--bloomberg-orange);
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bloomberg-pagination button {
          background: var(--bloomberg-bg);
          border: 1px solid var(--bloomberg-orange);
          color: var(--bloomberg-orange);
          padding: 6px 12px;
          font-family: 'SF Mono', monospace;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bloomberg-pagination button:hover:not(:disabled) {
          background: var(--bloomberg-orange);
          color: var(--bloomberg-bg);
        }

        .bloomberg-pagination button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .bloomberg-pagination button.active {
          background: var(--bloomberg-orange);
          color: var(--bloomberg-bg);
        }

        /* Bloomberg Responsive */
        @media (max-width: 768px) {
          .bloomberg-table {
            font-size: 0.75rem;
          }
          
          .bloomberg-table th,
          .bloomberg-table td {
            padding: 6px 4px;
          }
          
          .bloomberg-table-header h1 {
            font-size: 1.25rem;
          }
        }

        /* Bloomberg Terminal Glow Effects */
        .bloomberg-glow {
          box-shadow: 
            0 0 5px var(--bloomberg-orange),
            0 0 10px var(--bloomberg-orange),
            0 0 15px var(--bloomberg-orange);
        }

        .bloomberg-pulse {
          animation: bloomberg-pulse 2s infinite;
        }

        @keyframes bloomberg-pulse {
          0% { box-shadow: 0 0 5px var(--bloomberg-orange); }
          50% { box-shadow: 0 0 20px var(--bloomberg-orange), 0 0 30px var(--bloomberg-orange); }
          100% { box-shadow: 0 0 5px var(--bloomberg-orange); }
        }
      `}</style>

      {/* Main Container */}
      <div className={`bloomberg-table-container ${className}`}>
        {children}
      </div>
    </>
  );
};