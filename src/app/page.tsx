import { getQuestions } from '@/lib/actions';
import AddQuestionForm from '@/components/AddQuestionForm';
import QuestionTable from '@/components/QuestionTable';
import DailyGoalWidget from '@/components/DailyGoalWidget';

export default async function DashboardPage() {
  const questions = await getQuestions();

  // Compute stats
  const stats = {
    green: questions.filter((q) => q.activeStatus === 'Green').length,
    orange: questions.filter((q) => q.activeStatus === 'Orange').length,
    yellow: questions.filter((q) => q.activeStatus === 'Yellow').length,
    red: questions.filter((q) => q.activeStatus === 'Red').length,
  };

  return (
    <div className="main-content">
      <h1 className="page-title">Dashboard</h1>

      {/* Stats Bar */}
      {questions.length > 0 && (
        <div className="stats-bar">
          <div className="stat-card stat-green">
            <div className="stat-count">{stats.green}</div>
            <div className="stat-label">Mastered</div>
          </div>
          <div className="stat-card stat-orange">
            <div className="stat-count">{stats.orange}</div>
            <div className="stat-label">Slow</div>
          </div>
          <div className="stat-card stat-yellow">
            <div className="stat-count">{stats.yellow}</div>
            <div className="stat-label">Partial</div>
          </div>
          <div className="stat-card stat-red">
            <div className="stat-count">{stats.red}</div>
            <div className="stat-label">Forgot</div>
          </div>
        </div>
      )}

      {/* Daily Goal Focus Mode Widget */}
      <DailyGoalWidget />

      <AddQuestionForm />
      <QuestionTable questions={questions} />
    </div>
  );
}
