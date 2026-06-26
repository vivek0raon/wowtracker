'use client';

import { useTransition } from 'react';
import { deleteQuestion } from '@/lib/actions';
import type { QuestionWithActiveStatus } from '@/lib/actions';
import StatusBadge from '@/components/StatusBadge';
import StatusButtons from '@/components/StatusButtons';
import Modal from '@/components/Modal';
import { SpoilerCell, TopicsCell } from '@/components/QuestionTable';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface QuestionDetailModalProps {
  question: QuestionWithActiveStatus;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestionDetailModal({
  question,
  isOpen,
  onClose,
}: QuestionDetailModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('Delete this question permanently?')) return;
    startTransition(async () => {
      await deleteQuestion(question.id);
      onClose();
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Question Details">
      <div className="detail-section">
        <div className="detail-label">Title</div>
        <div className="detail-text" style={{ fontWeight: 600, fontSize: '1.1rem' }}>
          {question.url ? (
            <a
              href={question.url}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-url"
              style={{ fontSize: '1.1rem', fontWeight: 600 }}
            >
              {question.title} ↗
            </a>
          ) : (
            question.title
          )}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-label">Status</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <StatusBadge status={question.activeStatus} />
          <span className="table-date">
            Last revised: {formatDate(question.lastRevisedTimestamp)}
          </span>
        </div>
      </div>

      {question.url && (
        <div className="detail-section">
          <div className="detail-label">Problem Link</div>
          <a
            href={question.url}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-url"
          >
            {question.url}
          </a>
        </div>
      )}

      {question.summary && (
        <div className="detail-section">
          <div className="detail-label">Summary</div>
          <div className="detail-text" style={{ fontSize: '0.95rem' }}>
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{question.summary}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {question.topics.length > 0 && (
        <div className="detail-section">
          <div className="detail-label">Topics</div>
          <TopicsCell topics={question.topics} />
        </div>
      )}

      {question.solution && (
        <div className="detail-section">
          <div className="detail-label">Detailed Solution</div>
          <SpoilerCell content={question.solution} blurText="Reveal solution" />
        </div>
      )}

      {question.code && (
        <div className="detail-section">
          <div className="detail-label">Submitted Code</div>
          <SpoilerCell content={`\`\`\`\n${question.code}\n\`\`\``} blurText="Reveal code" />
        </div>
      )}

      <div className="detail-actions">
        <div className="detail-label">Update Status</div>
        <StatusButtons questionId={question.id} />

        <button
          onClick={handleDelete}
          disabled={isPending}
          className="detail-delete-btn"
        >
          {isPending ? 'Deleting...' : '🗑️ Delete Question'}
        </button>
      </div>
    </Modal>
  );
}
