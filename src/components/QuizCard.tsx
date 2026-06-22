'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateQuestionStatus } from '@/lib/actions';
import type { QuestionWithActiveStatus } from '@/lib/actions';
import StatusBadge from '@/components/StatusBadge';
import { TopicsCell } from '@/components/QuestionTable';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface QuizCardProps {
  question: QuestionWithActiveStatus;
}

const assessmentButtons = [
  { status: 'Green', label: 'Mastered', className: 'green' },
  { status: 'Orange', label: 'Remembered but Slow', className: 'orange' },
  { status: 'Yellow', label: 'Partially Remembered', className: 'yellow' },
  { status: 'Red', label: 'Forgot', className: 'red' },
];

export default function QuizCard({ question }: QuizCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAssessment = (newStatus: string | null) => {
    startTransition(async () => {
      if (newStatus) {
        await updateQuestionStatus(question.id, newStatus);
      }
      // Reset state and load next question
      setRevealed(false);
      router.refresh();
    });
  };

  return (
    <div className="quiz-card glass-card">
      <div className="quiz-label">Revision Question</div>

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
            onClick={() => handleAssessment(null)}
            disabled={isPending}
            className="quiz-skip-btn"
            style={{ marginTop: 0 }}
          >
            {isPending ? 'Loading...' : 'Skip to Next Question ⏭️'}
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
              style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}
            >
              No solution recorded yet.
            </div>
          )}

          <hr className="quiz-divider" />

          <div className="quiz-assess-label">How well did you remember?</div>

          <div className="quiz-status-grid">
            {assessmentButtons.map((btn) => (
              <button
                key={btn.status}
                onClick={() => handleAssessment(btn.status)}
                disabled={isPending}
                className={`quiz-status-btn ${btn.className}`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleAssessment(null)}
            disabled={isPending}
            className="quiz-skip-btn"
          >
            {isPending ? 'Loading...' : 'Skip without assessing ⏭️'}
          </button>
        </div>
      )}
    </div>
  );
}
