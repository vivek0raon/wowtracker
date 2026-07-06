'use client';
import { useState } from 'react';
import Modal from './Modal';
import AnalogClockPicker from './AnalogClockPicker';

export default function ReminderModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [time, setTime] = useState('09:00'); // Default to 9:00 AM

  const handleAddToCalendar = () => {
    // time is in "HH:MM" format (24-hour)
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create a date object for today at the selected time
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    // Format for Google Calendar UTC: YYYYMMDDTHHMMSSZ
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    const startStr = `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
    
    // Add 30 minutes for the event duration
    const endDate = new Date(date.getTime() + 30 * 60000);
    const endStr = `${endDate.getUTCFullYear()}${pad(endDate.getUTCMonth() + 1)}${pad(endDate.getUTCDate())}T${pad(endDate.getUTCHours())}${pad(endDate.getUTCMinutes())}${pad(endDate.getUTCSeconds())}Z`;

    const title = encodeURIComponent('DSA Revision');
    const details = encodeURIComponent('Time to revise your Data Structures and Algorithms! Consistency is key.');
    // RRULE for daily repetition
    const recur = 'RRULE:FREQ=DAILY';

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${startStr}/${endStr}&recur=${recur}`;

    // Open in new tab
    window.open(url, '_blank');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Daily Reminder">
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Drag the clock hands to pick a time for your daily Google Calendar revision reminder.
        </p>

        <AnalogClockPicker time={time} onChange={setTime} />

        <button 
          onClick={handleAddToCalendar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            marginTop: '2.5rem',
            padding: '1.2rem',
            background: 'linear-gradient(135deg, #4285F4, #34A853)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(66, 133, 244, 0.3)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(66, 133, 244, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(66, 133, 244, 0.3)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.3)';
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 2V6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 2V6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 16H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Add to Google Calendar
        </button>
      </div>
    </Modal>
  );
}
