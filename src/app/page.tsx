import { getQuestions, getRevisionLogs } from '@/lib/actions';
import AddQuestionForm from '@/components/AddQuestionForm';
import QuestionTable from '@/components/QuestionTable';
import DailyGoalWidget from '@/components/DailyGoalWidget';
import ActivityHeatmap from '@/components/ActivityHeatmap';

export default async function DashboardPage() {
  const questions = await getQuestions();
  const revisionLogs = await getRevisionLogs();

  return (
    <div className="main-content">
      <h1 className="page-title">Dashboard</h1>

      {/* Activity Heatmap */}
      <ActivityHeatmap logs={revisionLogs} />

      {/* Daily Goal Focus Mode Widget */}
      <DailyGoalWidget />

      <AddQuestionForm />
      <QuestionTable questions={questions} />
    </div>
  );
}
