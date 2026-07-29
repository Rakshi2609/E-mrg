'use client';
import React, { useState } from 'react';
import { StickyNote, Plus, MoreHorizontal, Calendar, User } from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';

export default function NotesPage() {
  const { notes, addNote } = useLiveData();


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Dispatcher Notes</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Collaborative notes, handovers, and reminders.</p>
        </div>
        <button style={{ background: 'var(--text-primary)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', color: 'var(--card-bg)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <Plus size={18} /> New Note
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {notes.map((note, i) => (
          <div key={i} style={{ background: note.color, borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '250px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                <StickyNote size={18} /> {note.title}
              </div>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <MoreHorizontal size={18} />
              </button>
            </div>
            
            <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {note.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> {note.author}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {note.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
