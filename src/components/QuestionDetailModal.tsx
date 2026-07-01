'use client';

import { useTransition, useState, useEffect } from 'react';
import { deleteQuestion, updateQuestionDetails } from '@/lib/actions';
import type { QuestionWithActiveStatus } from '@/lib/actions';
import StatusBadge from '@/components/StatusBadge';
import StatusButtons from '@/components/StatusButtons';
import Modal from '@/components/Modal';
import { SpoilerCell, TopicsCell } from '@/components/QuestionTable';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

let turndownService: TurndownService | null = null;
if (typeof window !== 'undefined') {
  turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*'
  });
  turndownService.use(gfm);
}

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
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(question.title);
  const [url, setUrl] = useState(question.url);
  const [summary, setSummary] = useState(question.summary);
  const [solution, setSolution] = useState(question.solution);
  const [code, setCode] = useState(question.code);
  const [topics, setTopics] = useState(question.topics.join(', '));

  useEffect(() => {
    if (isOpen) {
      setIsEditing(false);
      setTitle(question.title);
      setUrl(question.url);
      setSummary(question.summary);
      setSolution(question.solution);
      setCode(question.code);
      setTopics(question.topics.join(', '));
    }
  }, [isOpen, question]);

  const handleDelete = () => {
    if (!confirm('Delete this question permanently?')) return;
    startTransition(async () => {
      await deleteQuestion(question.id);
      onClose();
    });
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      await updateQuestionDetails(question.id, {
        title,
        url,
        summary,
        solution,
        code,
        topics: topics.split(',').map(t => t.trim()).filter(Boolean)
      });
      setIsEditing(false);
    });
  };

  const createPasteHandler = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    return (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const html = e.clipboardData.getData('text/html');
      if (html && turndownService) {
        e.preventDefault();
        try {
          const markdown = turndownService.turndown(html);
          const target = e.currentTarget;
          const start = target.selectionStart;
          const end = target.selectionEnd;
          const value = target.value;
          setter(value.substring(0, start) + markdown + value.substring(end));
        } catch (err) {
          console.error('Failed to convert pasted HTML to Markdown', err);
        }
      }
    };
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Question" : "Question Details"}>
      {isEditing ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-title">Title *</label>
            <input
              id="edit-title"
              required
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-url">URL</label>
            <input
              id="edit-url"
              type="url"
              className="form-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Summary / Notes</label>
            <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <MDEditor
                value={summary}
                onChange={(val) => setSummary(val || '')}
                preview="edit"
                height={200}
                className="md-editor-override"
                previewOptions={{ remarkPlugins: [remarkBreaks] }}
                textareaProps={{ onPaste: createPasteHandler(setSummary) }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Solution</label>
            <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <MDEditor
                value={solution}
                onChange={(val) => setSolution(val || '')}
                preview="edit"
                height={250}
                className="md-editor-override"
                previewOptions={{ remarkPlugins: [remarkBreaks] }}
                textareaProps={{ onPaste: createPasteHandler(setSolution) }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-code">Submitted Code</label>
            <textarea
              id="edit-code"
              className="form-input"
              style={{ fontFamily: 'monospace', minHeight: '150px', resize: 'vertical' }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-topics">Topics (comma-separated)</label>
            <input
              id="edit-topics"
              className="form-input"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="form-submit-btn"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              onClick={() => setIsEditing(false)}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="form-submit-btn"
              disabled={isPending}
            >
              {isPending ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="detail-section">
            <div className="detail-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Title</span>
              <button 
                onClick={() => setIsEditing(true)}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                ✏️ Edit
              </button>
            </div>
            <div className="detail-text" style={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {question.url ? (
                <a href={question.url} target="_blank" rel="noopener noreferrer" className="detail-url" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  {question.title} ↗
                </a>
              ) : question.title}
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
              <a href={question.url} target="_blank" rel="noopener noreferrer" className="detail-url">
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

            <button onClick={handleDelete} disabled={isPending} className="detail-delete-btn">
              {isPending ? 'Deleting...' : '🗑️ Delete Question'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
