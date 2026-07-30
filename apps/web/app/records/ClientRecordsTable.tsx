'use client';

import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

type RecordType = {
  _id: string;
  incident_id: string;
  type: string;
  severity: string;
  location: string;
  status: string;
  timestamp: Date | string;
};

export default function ClientRecordsTable({ records }: { records: RecordType[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.incident_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          record.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          record.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || record.severity.toLowerCase() === severityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'ALL' || record.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', background: 'var(--card-bg)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by ID, type, or location..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none', fontWeight: 600 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select 
            value={severityFilter} 
            onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Incident ID</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Severity</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1rem' }}>
                  No records match your filters.
                </td>
              </tr>
            ) : paginatedRecords.map((record, i) => (
              <tr key={record._id} style={{ borderBottom: i === paginatedRecords.length - 1 ? 'none' : '1px solid var(--border-color)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{record.incident_id}</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>{record.type}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span className="hero-badge" style={{ 
                    margin: 0, padding: '4px 10px', fontSize: '0.75rem', 
                    background: record.severity.toLowerCase() === 'critical' || record.severity.toLowerCase() === 'high' ? 'var(--accent-red-light)' : record.severity.toLowerCase() === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)',
                    color: record.severity.toLowerCase() === 'critical' || record.severity.toLowerCase() === 'high' ? 'var(--accent-red)' : record.severity.toLowerCase() === 'medium' ? '#d97706' : 'var(--text-secondary)',
                    borderColor: 'transparent', boxShadow: 'none'
                  }}>
                    {record.severity}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{record.location}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ 
                    padding: '4px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700,
                    background: record.status.toLowerCase() === 'active' ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-tertiary)',
                    color: record.status.toLowerCase() === 'active' ? '#2563eb' : 'var(--text-secondary)'
                  }}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '1rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ padding: '0.5rem 1.25rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, transition: 'background 0.2s' }}
            >
              Previous
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{ padding: '0.5rem 1.25rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, transition: 'background 0.2s' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
