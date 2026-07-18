import { CheckSquare, Bug, Milestone, ListChecks, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useModuleTasks } from '@/hooks/useTasks';
import { useModuleIssues } from '@/hooks/useIssues';
import { useRoadmap } from '@/hooks/useRoadmap';
import { useActivities } from '@/hooks/useActivities';
import { useFiles } from '@/hooks/useFiles';

function RatioTile({ icon: Icon, label, done, total }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <Card className="p-3.5">
      <div className="mb-1.5 flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="truncate text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
        {done}
        <span className="text-lg font-semibold text-slate-400">/{total}</span>
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-elevated">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
    </Card>
  );
}

function CountTile({ icon: Icon, label, value }) {
  return (
    <Card className="p-3.5">
      <div className="mb-1.5 flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="truncate text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums text-slate-800 dark:text-slate-100">{value}</p>
    </Card>
  );
}

export function ModuleRecap({ moduleId }) {
  const { data: tasks = [] } = useModuleTasks(moduleId);
  const { data: issues = [] } = useModuleIssues(moduleId);
  const { data: steps = [] } = useRoadmap(moduleId);
  const { data: activities = [] } = useActivities({ module_id: moduleId });
  const { data: files = [] } = useFiles(moduleId);

  const tasksDone = tasks.filter((t) => t.status === 'done').length;
  const issuesDone = issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
  const stepsDone = steps.filter((s) => s.status === 'done').length;

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <RatioTile icon={CheckSquare} label="Tugas selesai" done={tasksDone} total={tasks.length} />
      <RatioTile icon={Bug} label="Issue selesai" done={issuesDone} total={issues.length} />
      <RatioTile icon={Milestone} label="Roadmap selesai" done={stepsDone} total={steps.length} />
      <CountTile icon={ListChecks} label="Aktivitas" value={activities.length} />
      <CountTile icon={FileText} label="Berkas" value={files.length} />
    </div>
  );
}
