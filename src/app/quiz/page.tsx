import Link from 'next/link';
import { getQuestions } from '@/lib/actions';
import FocusMode from '@/components/FocusMode';

export const dynamic = 'force-dynamic';

export default async function QuizPage() {
  const questions = await getQuestions();

  if (!questions || questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '480px' }}>
          <div className="empty-state-icon">🧠</div>
          <div className="empty-state-title">No Questions Yet</div>
          <div className="empty-state-text">
            Add some DSA questions to your tracker first, then come back for intelligent revision.
          </div>
          <Link href="/" className="empty-state-link">
            ← Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <FocusMode questions={questions} />
    </div>
  );
}
