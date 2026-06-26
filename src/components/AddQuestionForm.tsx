'use client';

import { useState, useTransition } from 'react';
import { addQuestion } from '@/lib/actions';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import remarkBreaks from 'remark-breaks';
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

export default function AddQuestionForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<string>('');
  const [solution, setSolution] = useState<string>('');
  const [code, setCode] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Inject the markdown state into formData
    formData.set('summary', summary || '');
    formData.set('solution', solution || '');
    formData.set('code', code || '');

    startTransition(async () => {
      await addQuestion(formData);
      form.reset();
      setSummary('');
      setSolution('');
      setCode('');
      setIsOpen(false);
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
          
          const newValue = value.substring(0, start) + markdown + value.substring(end);
          setter(newValue);
          
          setTimeout(() => {
            target.selectionStart = target.selectionEnd = start + markdown.length;
          }, 0);
        } catch (err) {
          console.error("Paste conversion failed:", err);
        }
      }
    };
  };

  return (
    <div className="add-form-wrapper" data-color-mode="dark">
      <button
        className={`add-form-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="9" y1="3" x2="9" y2="15" />
          <line x1="3" y1="9" x2="15" y2="9" />
        </svg>
        Add New Question
      </button>

      <div className={`add-form-container ${isOpen ? 'open' : ''}`}>
        <form onSubmit={handleSubmit} className="add-form glass-card">
          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-input"
                placeholder="e.g. Two Sum"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="url">
                Problem URL
              </label>
              <input
                id="url"
                name="url"
                type="url"
                className="form-input"
                placeholder="e.g. https://leetcode.com/problems/two-sum"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="summary">
              Summary
            </label>
            <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <MDEditor
                value={summary}
                onChange={(val) => setSummary(val || '')}
                preview="edit"
                height={150}
                className="md-editor-override"
                previewOptions={{
                  remarkPlugins: [remarkBreaks]
                }}
                textareaProps={{
                  placeholder: 'Brief summary of the approach (Markdown supported)...',
                  onPaste: createPasteHandler(setSummary)
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="solution">
              Detailed Solution
            </label>
            <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <MDEditor
                value={solution}
                onChange={(val) => setSolution(val || '')}
                preview="live"
                height={250}
                className="md-editor-override"
                previewOptions={{
                  remarkPlugins: [remarkBreaks]
                }}
                textareaProps={{
                  placeholder: 'Full solution with explanation (Markdown supported)...',
                  onPaste: createPasteHandler(setSolution)
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="code">
              Submitted Code
            </label>
            <textarea
              id="code"
              name="code"
              className="form-input"
              style={{ fontFamily: 'monospace', minHeight: '150px', resize: 'vertical' }}
              placeholder="Paste your raw code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="topics">
              Topics (comma-separated)
            </label>
            <input
              id="topics"
              name="topics"
              type="text"
              className="form-input"
              placeholder="e.g. Array, Hash Map, Two Pointers"
            />
          </div>

          <button
            type="submit"
            className="form-submit-btn"
            disabled={isPending}
          >
            {isPending ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="loading-spinner" /> Saving...
              </span>
            ) : (
              '✨ Add Question'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
