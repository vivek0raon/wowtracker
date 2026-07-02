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
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            const file = items[i].getAsFile();
            if (!file) continue;
            
            const target = e.currentTarget;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const value = target.value;
            
            setter(value.substring(0, start) + '*(Uploading image...)*' + value.substring(end));
            
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new window.Image();
              img.onload = async () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000;
                let width = img.width;
                let height = img.height;
                
                if (width > MAX_WIDTH) {
                  height = Math.round((height * MAX_WIDTH) / width);
                  width = MAX_WIDTH;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height);
                  const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
                  
                  try {
                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ data: compressedBase64 })
                    });
                    const data = await res.json();
                    if (data.url) {
                      setter(prev => prev.replace('*(Uploading image...)*', `![image](${data.url})`));
                    } else {
                      setter(prev => prev.replace('*(Uploading image...)*', '*(Image upload failed)*'));
                    }
                  } catch (err) {
                    setter(prev => prev.replace('*(Uploading image...)*', '*(Image upload failed)*'));
                  }
                }
              };
              img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
            return;
          }
        }
      }

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
