'use client';
import { useState } from 'react';
import ReminderModal from './ReminderModal';

export default function ReminderButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="px-3 sm:px-5 py-3"
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          color: 'var(--text-secondary)',
          borderRadius: '99px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'var(--bg-secondary)';
          e.currentTarget.style.borderColor = 'var(--text-tertiary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
        <span className="hidden sm:inline">Add Reminder</span>
      </button>

      {isModalOpen && (
        <ReminderModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
