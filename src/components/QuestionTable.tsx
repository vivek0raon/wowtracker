'use client';

import { useState } from 'react';
import type { QuestionWithActiveStatus } from '@/lib/actions';
import StatusBadge from '@/components/StatusBadge';
import QuestionDetailModal from '@/components/QuestionDetailModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface QuestionTableProps {
  questions: QuestionWithActiveStatus[];
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatDateFull(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getRowClass(status: string) {
  switch (status) {
    case 'Green':
      return 'row-green';
    case 'Orange':
      return 'row-orange';
    case 'Yellow':
      return 'row-yellow';
    case 'Red':
      return 'row-red';
    default:
      return 'row-red';
  }
}

export function SpoilerCell({ content, blurText = "Click to reveal", maxHeight = 250 }: { content: string, blurText?: string, maxHeight?: number }) {
  const [revealed, setRevealed] = useState(false);

  if (!content) return <span style={{ color: 'var(--text-tertiary)' }}>—</span>;

  return (
    <div 
      className="blur-reveal-container"
      onClick={(e) => {
        e.stopPropagation();
        setRevealed(true);
      }}
    >
      <div 
        className={`blur-reveal-content ${revealed ? 'revealed' : ''}`}
        style={maxHeight ? { maxHeight: `${maxHeight}px`, overflowY: revealed ? 'auto' : 'hidden' } : undefined}
      >
        <div className="spoiler-text" style={{ cursor: revealed ? 'auto' : 'pointer' }} onClick={(e) => revealed && e.stopPropagation()}>
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
      <div className={`blur-reveal-overlay ${revealed ? 'revealed' : ''}`}>
        {blurText}
      </div>
    </div>
  );
}

export function TopicsCell({ topics }: { topics: string[] }) {
  const [revealed, setRevealed] = useState(false);

  if (topics.length === 0)
    return <span style={{ color: 'var(--text-tertiary)' }}>—</span>;

  return (
    <div 
      className="blur-reveal-container"
      onClick={(e) => {
        e.stopPropagation();
        setRevealed(true);
      }}
      style={{ display: 'inline-block', minWidth: '100px' }}
    >
      <div className={`blur-reveal-content ${revealed ? 'revealed' : ''}`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', padding: '0.5rem' }}>
          {topics.map((t) => (
            <span key={t} className="topic-tag">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className={`blur-reveal-overlay ${revealed ? 'revealed' : ''}`}>
        Reveal tags
      </div>
    </div>
  );
}

// Desktop Table — Compact Notion database view
function DesktopTable({ 
  questions, 
  onSelectQuestion 
}: { 
  questions: QuestionWithActiveStatus[], 
  onSelectQuestion: (q: QuestionWithActiveStatus) => void 
}) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '36px' }}>#</th>
            <th>Problem Name</th>
            <th style={{ width: '80px' }}>Status</th>
            <th style={{ width: '180px' }}>Topic</th>
            <th>Approach Summary</th>
            <th style={{ width: '100px' }}>Revised</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, i) => (
            <tr 
              key={q.id} 
              className={`${getRowClass(q.activeStatus)} clickable-row`}
              onClick={() => onSelectQuestion(q)}
            >
              <td className="cell-muted">{i + 1}</td>
              <td>
                <div className="cell-title">
                  {q.url ? (
                    <a
                      href={q.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="table-title-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {q.title} ↗
                    </a>
                  ) : (
                    <span className="table-title-link">{q.title}</span>
                  )}
                </div>
              </td>
              <td>
                <StatusBadge status={q.activeStatus} size="sm" />
              </td>
              <td>
                <div className="cell-tags">
                  {q.topics.length > 0 ? (
                    q.topics.map((t) => (
                      <span key={t} className="topic-tag">{t}</span>
                    ))
                  ) : (
                    <span className="cell-muted">—</span>
                  )}
                </div>
              </td>
              <td>
                <div className="cell-summary">
                  {q.summary || <span className="cell-muted">—</span>}
                </div>
              </td>
              <td>
                <span className="table-date">
                  {formatDateFull(q.lastRevisedTimestamp)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mobile Card List
function MobileCards({ 
  questions, 
  onSelectQuestion 
}: { 
  questions: QuestionWithActiveStatus[], 
  onSelectQuestion: (q: QuestionWithActiveStatus) => void 
}) {
  return (
    <div className="mobile-cards-container">
      <div className="mobile-cards-header">
        <span>Problem Name</span>
        <span>Revised</span>
      </div>
      <div className="mobile-cards">
        {questions.map((q) => (
          <div
            key={q.id}
            className={`mobile-card ${getRowClass(q.activeStatus)}`}
            onClick={() => onSelectQuestion(q)}
          >
            <div className="mobile-card-inner">
              <span className="mobile-card-title">{q.title}</span>
              <span className="mobile-card-date">
                {formatDate(q.lastRevisedTimestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QuestionTable({ questions }: QuestionTableProps) {
  const [filter, setFilter] = useState<string>('All');
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionWithActiveStatus | null>(null);

  if (questions.length === 0) {
    return (
      <div className="empty-state glass-card-static">
        <div className="empty-state-icon">📚</div>
        <div className="empty-state-title">No questions yet</div>
        <div className="empty-state-text">
          Add your first DSA question using the form above to start tracking!
        </div>
      </div>
    );
  }

  const filteredQuestions = questions.filter((q) => {
    if (filter === 'All') return true;
    return q.activeStatus === filter;
  });

  const filters = [
    { id: 'All', label: 'All' },
    { id: 'Green', label: '🟢 Mastered' },
    { id: 'Orange', label: '🟠 Slow' },
    { id: 'Yellow', label: '🟡 Partial' },
    { id: 'Red', label: '🔴 Forgot' },
  ];

  return (
    <>
      <div className="filter-bar">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`filter-btn ${filter === f.id ? 'active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="empty-state glass-card-static">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No matching questions</div>
          <div className="empty-state-text">
            There are no questions with the "{filter}" status.
          </div>
          <button onClick={() => setFilter('All')} className="form-submit-btn" style={{ marginTop: '1rem' }}>
            Clear Filter
          </button>
        </div>
      ) : (
        <>
          <div className="desktop-only">
            <DesktopTable questions={filteredQuestions} onSelectQuestion={setSelectedQuestion} />
          </div>
          <div className="mobile-only">
            <MobileCards questions={filteredQuestions} onSelectQuestion={setSelectedQuestion} />
          </div>
        </>
      )}

      {selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          isOpen={!!selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </>
  );
}
