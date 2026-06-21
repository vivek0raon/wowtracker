import Link from 'next/link';
import { getQuizQuestion } from '@/lib/actions';
import QuizCard from '@/components/QuizCard';

export const dynamic = 'force-dynamic';

export default async function QuizPage() {
  const question = await getQuizQuestion();

  if (!question) {
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
      <QuizCard question={question} />
    </div>
  );
}
