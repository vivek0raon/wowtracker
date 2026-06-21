'use client';

import { useTransition } from 'react';
import { updateQuestionStatus } from '@/lib/actions';

interface StatusButtonsProps {
  questionId: string;
  onUpdate?: () => void;
}

const buttons = [
  { status: 'Green', label: 'Mastered', className: 'status-btn-green' },
  { status: 'Orange', label: 'Slow', className: 'status-btn-orange' },
  { status: 'Yellow', label: 'Partial', className: 'status-btn-yellow' },
  { status: 'Red', label: 'Forgot', className: 'status-btn-red' },
];

export default function StatusButtons({ questionId, onUpdate }: StatusButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = (newStatus: string) => {
    startTransition(async () => {
      await updateQuestionStatus(questionId, newStatus);
      onUpdate?.();
    });
  };

  return (
    <div className="status-buttons-grid">
      {buttons.map((btn) => (
        <button
          key={btn.status}
          onClick={(e) => {
            e.stopPropagation();
            handleClick(btn.status);
          }}
          disabled={isPending}
          className={`status-btn ${btn.className}`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
