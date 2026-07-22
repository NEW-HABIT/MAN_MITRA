"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, RefreshCw, Zap, Clock } from 'lucide-react';
import { API_URL } from '@/config';

interface Task {
  time: string;
  title: string;
  duration_mins: number;
  completed: boolean;
}

interface Plan {
  id: string;
  plan_type: string;
  content: { tasks: Task[] };
  generated_by_ai: boolean;
}

interface WellnessChecklistProps {
  accessToken: string;
}

export default function WellnessChecklist({ accessToken }: WellnessChecklistProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_URL}/api/wellness/plans/active/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        let plansList: Plan[] = [];
        if (Array.isArray(data)) {
          plansList = data;
        } else if (data && Array.isArray(data.results)) {
          plansList = data.results;
        }
        setPlans(plansList);
      }
    } catch (e) {
      console.error(e);
      setPlans([]);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [accessToken]);

  const handleToggle = async (planId: string, index: number, currentStatus: boolean) => {
    // Optimistic UI update
    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        const updatedTasks = [...p.content.tasks];
        updatedTasks[index].completed = !currentStatus;
        return { ...p, content: { tasks: updatedTasks } };
      }
      return p;
    }));

    try {
      const res = await fetch(`${API_URL}/api/wellness/plans/${planId}/toggle-task/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          task_index: index,
          completed: !currentStatus,
        }),
      });
      if (!res.ok) throw new Error('Toggle failed.');
    } catch (e) {
      // Revert if API call fails
      fetchPlans();
    }
  };

  const handleGenerateNew = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/wellness/plans/generate/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (res.ok) {
        fetchPlans();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const dailyPlan = plans.find(p => p.plan_type === 'daily');
  const tasks = dailyPlan?.content.tasks || [];
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="glass-panel p-6 rounded-3xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">Wellness Routines</h3>
            <p className="text-xs text-slate-400 mt-0.5">Your personalized daily routine.</p>
          </div>
          <button
            onClick={handleGenerateNew}
            disabled={loading}
            className="p-2 rounded-xl glass-panel border-transparent hover:border-[#12b886] transition-all cursor-pointer disabled:opacity-50 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate Plan
          </button>
        </div>

        {tasks.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
              <span>Routines Checklist Completed</span>
              <span>{completedCount}/{totalCount} ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-[#0a0f0d] rounded-full h-1.5 overflow-hidden border border-[rgba(18,184,134,0.05)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="bg-[#12b886] h-full"
              />
            </div>
          </div>
        )}

        <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
          <AnimatePresence mode="popLayout">
            {tasks.length > 0 ? (
              tasks.map((task, idx) => (
                <motion.div
                  key={task.title + idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    task.completed 
                      ? 'bg-[rgba(18,184,134,0.04)] border-[rgba(18,184,134,0.15)] text-slate-400' 
                      : 'glass-panel border-transparent hover:border-[rgba(18,184,134,0.2)]'
                  }`}
                  onClick={() => handleToggle(dailyPlan!.id, idx, task.completed)}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-[#12b886] focus:outline-none">
                      {task.completed ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                    <div>
                      <span className={`text-xs font-medium ${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.time}</span>
                        <span>•</span>
                        <span>{task.duration_mins} mins</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-xs text-slate-500">
                No active routines found. Tap "Regenerate Plan" above to create one.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {tasks.length > 0 && progressPercent === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-3 rounded-2xl bg-[#12b886] bg-opacity-10 border border-[#12b886] border-opacity-20 flex items-center gap-2.5 text-xs text-[#12b886] font-medium"
        >
          <Zap className="w-4 h-4 text-[#12b886]" /> Complete checklist finished! Keep up the wellness journey.
        </motion.div>
      )}
    </div>
  );
}
