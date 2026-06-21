'use client';

import { useState, useTransition } from 'react';
import { addQuestion } from '@/lib/actions';

export default function AddQuestionForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      await addQuestion(formData);
      form.reset();
      setIsOpen(false);
    });
  };

  return (
    <div className="add-form-wrapper">
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
            <textarea
              id="summary"
              name="summary"
              className="form-textarea"
              placeholder="Brief summary of the approach..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="solution">
              Detailed Solution
            </label>
            <textarea
              id="solution"
              name="solution"
              className="form-textarea"
              placeholder="Full solution with explanation..."
              rows={4}
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
