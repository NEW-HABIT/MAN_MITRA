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

const DEFAULT_PLAN: Plan = {
  id: 'default-plan',
  plan_type: 'daily',
  generated_by_ai: true,
  content: {
    tasks: [
      { time: '08:00 AM', title: 'Morning 4-7-8 Breathing Exercise', duration_mins: 10, completed: false },
      { time: '01:00 PM', title: 'Mid-day Mindfulness & Stretch', duration_mins: 15, completed: false },
      { time: '09:00 PM', title: 'Evening Emotion Journaling', duration_mins: 10, completed: false },
    ]
  }
};

export default function WellnessChecklist({ accessToken }: WellnessChecklistProps) {
  const [plans, setPlans] = useState<Plan[]>([DEFAULT_PLAN]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/api/wellness/plans/active/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          let plansList: Plan[] = [];
          if (Array.isArray(data)) {
            plansList = data;
          } else if (data && Array.isArray(data.results)) {
            plansList = data.results;
          }
          if (plansList.length > 0) {
            setPlans(plansList);
          } else {
            setPlans([DEFAULT_PLAN]);
          }
        }
      } else {
        setPlans([DEFAULT_PLAN]);
      }
    } catch (e) {
      console.warn('Wellness plans fetch notice (using active default routine):', e);
      setPlans([DEFAULT_PLAN]);
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
    <div className="glass-panel p-6 rounded-3xl h-full flex flex-col justify-between bg-white/80">
      <div>
        <div className="flex items-center justify-between mb-6 text-left">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Wellness Routines</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your personalized daily routine.</p>
          </div>
          <button
            onClick={handleGenerateNew}
            disabled={loading}
            className="p-2 rounded-xl glass-panel border-sky-100 hover:border-sky-300 transition-all cursor-pointer disabled:opacity-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0284c7] ${loading ? 'animate-spin' : ''}`} />
            Refresh Routine
          </button>
        </div>

        {tasks.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
              <span>Routines Checklist Completed</span>
              <span className="font-semibold text-[#0284c7]">{completedCount}/{totalCount} ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-sky-100/60 rounded-full h-1.5 overflow-hidden border border-sky-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="bg-[#0284c7] h-full"
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
                      ? 'bg-sky-50/50 border-sky-100 text-slate-400' 
                      : 'glass-panel border-sky-100 hover:border-sky-300 text-slate-800'
                  }`}
                  onClick={() => handleToggle(dailyPlan!.id, idx, task.completed)}
                >
                  <div className="flex items-center gap-3 text-left">
                    <button className="text-[#0284c7] focus:outline-none">
                      {task.completed ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
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
                No active routines found. Tap "Refresh Routine" above to create one.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {tasks.length > 0 && progressPercent === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-2.5 text-xs text-[#0284c7] font-medium"
        >
          <Zap className="w-4 h-4 text-[#0284c7]" /> Complete checklist finished! Keep up the wellness journey.
        </motion.div>
      )}
    </div>
  );
}
