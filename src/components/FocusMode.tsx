'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { updateQuestionStatus } from '@/lib/actions';
import type { QuestionWithActiveStatus } from '@/lib/actions';
import StatusBadge from '@/components/StatusBadge';
import { TopicsCell } from '@/components/QuestionTable';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface FocusModeProps {
  questions: QuestionWithActiveStatus[];
}

export default function FocusMode({ questions }: FocusModeProps) {
  const [queue, setQueue] = useState<QuestionWithActiveStatus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [goal, setGoal] = useState(5);
  const [progress, setProgress] = useState(0);
  const [showDoneScreen, setShowDoneScreen] = useState(false);
  const [keepGoing, setKeepGoing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 1. Filter out Green (Mastered) questions
    const needsRevision = questions.filter(q => q.activeStatus !== 'Green');
    
    // 2. Sort by priority: Red > Yellow > Orange
    const statusWeight: Record<string, number> = {
      'Red': 3,
      'Yellow': 2,
      'Orange': 1,
    };
    
    // Sort by priority, then randomize within the same priority
    const sortedQueue = needsRevision.sort((a, b) => {
      const weightA = statusWeight[a.activeStatus] || 0;
      const weightB = statusWeight[b.activeStatus] || 0;
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      return Math.random() - 0.5;
    });
    
    setQueue(sortedQueue);

    // 3. Load daily goal and progress
    const storedGoal = localStorage.getItem('dsa_tracker_goal');
    if (storedGoal) setGoal(parseInt(storedGoal, 10));
    
    const today = new Date().toLocaleDateString();
    const storedProgress = localStorage.getItem(`dsa_tracker_progress_${today}`);
    let currentProgress = 0;
    if (storedProgress) {
      currentProgress = parseInt(storedProgress, 10);
      setProgress(currentProgress);
    }
    
    // Check if goal is already met
    if (storedGoal && currentProgress >= parseInt(storedGoal, 10)) {
      setShowDoneScreen(true);
    }
  }, [questions]);

  if (!mounted) return null;

  if (queue.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <div className="empty-state-icon">🎉</div>
        <div className="empty-state-title">All Caught Up!</div>
        <div className="empty-state-text">
          You have absolutely no questions that need revision. Everything is Mastered!
        </div>
        <Link href="/" className="empty-state-link">
          ← Go to Dashboard
        </Link>
      </div>
    );
  }

  if (showDoneScreen && !keepGoing) {
    return (
      <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '480px', margin: '0 auto', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(0,184,163,0.1) 100%)', border: '1px solid rgba(0,184,163,0.3)' }}>
        <div className="empty-state-icon" style={{ fontSize: '4rem' }}>🏆</div>
        <div className="empty-state-title" style={{ color: 'var(--status-green)' }}>Daily Goal Reached!</div>
        <div className="empty-state-text" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
          You have completed your {goal} revisions for today. Amazing job building consistency!
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', borderRadius: '99px', fontWeight: 600, textDecoration: 'none' }}>
            Go to Dashboard
          </Link>
          <button 
            onClick={() => setKeepGoing(true)} 
            style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '99px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Keep Going
          </button>
        </div>
      </div>
    );
  }

  if (currentIndex >= queue.length) {
    return (
      <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <div className="empty-state-icon">👏</div>
        <div className="empty-state-title">Session Complete</div>
        <div className="empty-state-text">
          You've reviewed all queued questions for now. Great work!
        </div>
        <Link href="/" className="empty-state-link">
          ← Go to Dashboard
        </Link>
      </div>
    );
  }

  const question = queue[currentIndex];

  const handleAssessment = (newStatus: string) => {
    startTransition(async () => {
      // 1. Update DB
      await updateQuestionStatus(question.id, newStatus);
      
      // 2. Update Progress
      const today = new Date().toLocaleDateString();
      const newProgress = progress + 1;
      setProgress(newProgress);
      localStorage.setItem(`dsa_tracker_progress_${today}`, newProgress.toString());
      
      // Notify other tabs
      window.dispatchEvent(new Event('storage'));

      // 3. Check goal
      if (!keepGoing && newProgress === goal) {
        setShowDoneScreen(true);
      }

      // 4. Next card
      setRevealed(false);
      setCurrentIndex(prev => prev + 1);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Mini Progress Tracker */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.5rem 1.5rem', borderRadius: '99px', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Today's Progress</span>
        <div style={{ width: '100px', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min((progress / goal) * 100, 100)}%`, background: progress >= goal ? 'var(--status-green)' : 'var(--accent-primary)', transition: 'width 0.3s' }}></div>
        </div>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: progress >= goal ? 'var(--status-green)' : 'var(--text-primary)' }}>{progress} / {goal}</span>
      </div>

      <div className="quiz-card glass-card" style={{ width: '100%', maxWidth: '700px' }}>
        <div className="quiz-label">Question {currentIndex + 1} of {queue.length}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <StatusBadge status={question.activeStatus} />
        </div>

        <h2 className="quiz-title">
          {question.url ? (
            <a href={question.url} target="_blank" rel="noopener noreferrer">
              {question.title} ↗
            </a>
          ) : (
            question.title
          )}
        </h2>

        {question.summary && (
          <div className="quiz-summary" style={{ fontSize: '0.95rem' }}>
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{question.summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {question.topics.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <TopicsCell topics={question.topics} />
          </div>
        )}

        {!revealed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              className="quiz-reveal-btn"
              onClick={() => setRevealed(true)}
            >
              🔓 Reveal Detailed Solution
            </button>
            
            <button
              onClick={() => {
                setRevealed(false);
                setCurrentIndex(prev => prev + 1);
              }}
              className="quiz-skip-btn"
              style={{ marginTop: 0 }}
            >
              Skip to Next Question ⏭️
            </button>
          </div>
        ) : (
          <div className="quiz-solution-wrapper">
            {question.solution ? (
              <div className="quiz-solution" style={{ fontSize: '0.95rem' }}>
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{question.solution}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div
                className="quiz-solution"
                style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}
              >
                No solution provided for this question.
              </div>
            )}

            {question.code && (
              <div style={{ marginTop: '2rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                  Submitted Code
                </div>
                <div className="quiz-solution" style={{ fontSize: '0.95rem' }}>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{`\`\`\`\n${question.code}\n\`\`\``}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            <div className="quiz-rating-section">
              <div className="quiz-rating-label">How well did you remember this?</div>
              <div className="quiz-rating-buttons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                  onClick={() => handleAssessment('Green')}
                  disabled={isPending}
                  className="rating-btn btn-green"
                  style={{ cursor: 'pointer', minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', borderRadius: '16px', gap: '0.5rem' }}
                >
                  <span style={{ fontSize: '2rem' }}>🟢</span>
                  <span>Mastered</span>
                </button>
                <button
                  onClick={() => handleAssessment('Orange')}
                  disabled={isPending}
                  className="rating-btn btn-orange"
                  style={{ cursor: 'pointer', minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', borderRadius: '16px', gap: '0.5rem' }}
                >
                  <span style={{ fontSize: '2rem' }}>🟠</span>
                  <span>Slow</span>
                </button>
                <button
                  onClick={() => handleAssessment('Yellow')}
                  disabled={isPending}
                  className="rating-btn btn-yellow"
                  style={{ cursor: 'pointer', minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', borderRadius: '16px', gap: '0.5rem' }}
                >
                  <span style={{ fontSize: '2rem' }}>🟡</span>
                  <span>Partial</span>
                </button>
                <button
                  onClick={() => handleAssessment('Red')}
                  disabled={isPending}
                  className="rating-btn btn-red"
                  style={{ cursor: 'pointer', minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', borderRadius: '16px', gap: '0.5rem' }}
                >
                  <span style={{ fontSize: '2rem' }}>🔴</span>
                  <span>Forgot</span>
                </button>
              </div>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setRevealed(false);
                    setCurrentIndex(prev => prev + 1);
                  }}
                  className="quiz-skip-btn"
                  style={{ marginTop: 0, padding: '0.5rem 1.5rem', fontSize: '0.9rem', width: 'auto' }}
                >
                  Skip without Rating ⏭️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
