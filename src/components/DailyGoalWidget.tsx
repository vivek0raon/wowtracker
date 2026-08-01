'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReminderButton from './ReminderButton';

export default function DailyGoalWidget() {
  const [goal, setGoal] = useState(5);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedGoal = localStorage.getItem('dsa_tracker_goal');
    if (storedGoal) {
      setGoal(parseInt(storedGoal, 10));
    }
    
    // Get today's local date string
    const today = new Date().toLocaleDateString();
    const storedProgress = localStorage.getItem(`dsa_tracker_progress_${today}`);
    if (storedProgress) {
      setProgress(parseInt(storedProgress, 10));
    }
  }, []);

  // Sync progress if it changes across tabs or after returning from Focus Mode
  useEffect(() => {
    if (!mounted) return;
    const handleStorageChange = () => {
      const today = new Date().toLocaleDateString();
      const storedProgress = localStorage.getItem(`dsa_tracker_progress_${today}`);
      if (storedProgress) {
        setProgress(parseInt(storedProgress, 10));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll every second just in case (since same-tab localStorage changes don't fire the 'storage' event)
    const interval = setInterval(() => {
      const today = new Date().toLocaleDateString();
      const storedProgress = localStorage.getItem(`dsa_tracker_progress_${today}`);
      if (storedProgress) {
        setProgress(parseInt(storedProgress, 10));
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [mounted]);

  if (!mounted) return null; // Avoid hydration mismatch

  const handleGoalChange = (newGoal: number) => {
    setGoal(newGoal);
    localStorage.setItem('dsa_tracker_goal', newGoal.toString());
    setIsEditing(false);
  };

  const percentage = Math.min(Math.round((progress / goal) * 100), 100);

  return (
    <div className="glass-card mb-8 p-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
      <div style={{ flex: '1', minWidth: '250px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Daily Goal</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="number" 
                min="1" 
                max="50" 
                value={goal} 
                onChange={(e) => setGoal(Number(e.target.value))}
                style={{ width: '60px', padding: '0.25rem', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
              <button onClick={() => handleGoalChange(goal)} style={{ background: 'var(--accent)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', cursor: 'pointer', border: 'none' }}>Save</button>
            </div>
          ) : (
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              {progress} / {goal} Revisions Done 
              <button 
                onClick={() => setIsEditing(true)} 
                style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.875rem' }}
              >
                (Change Goal)
              </button>
            </p>
          )}
        </div>
        
        {/* Progress bar */}
        <div style={{ width: '100%', maxWidth: '300px', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', marginTop: '0.75rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${percentage}%`, background: percentage >= 100 ? 'var(--status-green-solid)' : 'var(--accent)', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <ReminderButton />
        <Link 
          href="/quiz" 
          style={{ 
            background: percentage >= 100 ? 'var(--status-green-solid)' : 'var(--accent)', 
            color: 'white', 
            padding: '0.75rem 1.25rem', 
            borderRadius: '99px', 
            fontWeight: 600,
            whiteSpace: 'nowrap',
            textDecoration: 'none',
            display: 'inline-block',
            boxShadow: percentage >= 100 ? '0 4px 14px rgba(0, 184, 163, 0.3)' : '0 4px 14px rgba(66, 153, 225, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          {percentage >= 100 ? 'Keep Going 🔥' : 'Start Focus Mode'}
        </Link>
      </div>

      {/* Temporary Migration UI */}
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          <strong>Legacy Data Migration:</strong> Paste your old Clerk User ID from the extension to migrate your questions and logs to this new account.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            id="legacyUserId"
            placeholder="user_2..." 
            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
          />
          <button 
            onClick={async () => {
              const input = document.getElementById('legacyUserId') as HTMLInputElement;
              if (input && input.value) {
                try {
                  const { migrateLegacyData } = await import('@/lib/actions');
                  const res = await migrateLegacyData(input.value);
                  alert(`Successfully migrated ${res.questions} questions and ${res.logs} logs!`);
                  window.location.reload();
                } catch (e: any) {
                  alert(e.message || 'Failed to migrate');
                }
              }
            }}
            style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: 'white', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Migrate
          </button>
        </div>
      </div>
    </div>
  );
}
