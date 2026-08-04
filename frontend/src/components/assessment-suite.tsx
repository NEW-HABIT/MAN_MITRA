"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, AlertCircle, Sparkles, Download, Brain,
  RefreshCw, ShieldAlert, Award, Clock, ArrowRight, HeartPulse, ChevronRight, History, Calendar, Eye
} from 'lucide-react';
import { API_URL } from '@/config';

interface AssessmentSuiteProps {
  accessToken?: string;
  onNavigateTab?: (tab: string) => void;
}

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading or watching TV",
  "Moving or speaking so slowly that other people could have noticed, or being fidgety and restless",
  "Thoughts that you would be better off dead, or of hurting yourself in some way"
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];

const STRESS_QUESTIONS = [
  "Been upset because of something that happened unexpectedly",
  "Felt unable to control the important things in your life",
  "Felt nervous and stressed",
  "Felt confident about your ability to handle your personal problems",
  "Felt that things were going your way",
  "Found that you could not cope with all the things you had to do",
  "Been able to control irritations in your life",
  "Felt that you were on top of things",
  "Been angered because of things that were outside of your control",
  "Felt difficulties were piling up so high that you could not overcome them"
];

const SLEEP_QUESTIONS = [
  "Had difficulty falling asleep within 30 minutes of lying down",
  "Woke up during the night or early morning and struggled to fall back asleep",
  "Felt exhausted, groggy, or unrefreshed upon waking in the morning",
  "Experienced racing thoughts, worry, or restlessness while trying to sleep",
  "Struggled to maintain energy, focus, or stay awake during daytime activities"
];

const ALL_QUESTIONS_STRUCTURED = [
  ...PHQ9_QUESTIONS.map((text, idx) => ({ id: idx, text, category: 'Mood & Energy', code: 'PHQ9' })),
  ...GAD7_QUESTIONS.map((text, idx) => ({ id: idx + 9, text, category: 'Calmness & Peace', code: 'GAD7' })),
  ...STRESS_QUESTIONS.map((text, idx) => ({ id: idx + 16, text, category: 'Daily Stress', code: 'STRESS' })),
  ...SLEEP_QUESTIONS.map((text, idx) => ({ id: idx + 26, text, category: 'Sleep Quality', code: 'SLEEP' })),
];

const FREQUENCY_OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

export default function AssessmentSuite({ accessToken, onNavigateTab }: AssessmentSuiteProps) {
  const [activeType, setActiveType] = useState<'ALL' | 'PHQ9' | 'GAD7' | 'STRESS' | 'SLEEP'>('ALL');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [pastHistory, setPastHistory] = useState<any[]>([]);
  const [exportNotice, setExportNotice] = useState('');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [accessToken]);

  const fetchHistory = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/assessments/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPastHistory(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch assessment history:', e);
    }
  };

  const getQuestionsForType = (type: string) => {
    switch (type) {
      case 'ALL': return ALL_QUESTIONS_STRUCTURED.map(q => q.text);
      case 'PHQ9': return PHQ9_QUESTIONS;
      case 'GAD7': return GAD7_QUESTIONS;
      case 'STRESS': return STRESS_QUESTIONS;
      case 'SLEEP': return SLEEP_QUESTIONS;
      default: return ALL_QUESTIONS_STRUCTURED.map(q => q.text);
    }
  };

  const getTitleForType = (type: string) => {
    switch (type) {
      case 'ALL': return 'Complete Health & Wellness Check-in';
      case 'PHQ9': return 'Mood & Energy Check-in';
      case 'GAD7': return 'Calmness & Peace Check-in';
      case 'STRESS': return 'Daily Stress Check-in';
      case 'SLEEP': return 'Sleep Quality Check-in';
      default: return 'Self-Reflection Check-in';
    }
  };

  const getMaxScoreForType = (type: string) => {
    switch (type) {
      case 'ALL': return 93;
      case 'PHQ9': return 27;
      case 'GAD7': return 21;
      case 'STRESS': return 30;
      case 'SLEEP': return 15;
      default: return 93;
    }
  };

  const questions = getQuestionsForType(activeType);
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (qIndex: number, val: number) => {
    setAnswers(prev => ({ ...prev, [qIndex]: val }));
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
    setSelectedHistoryItem(null);
  };

  const handleSubmit = async () => {
    const rawScore = Object.values(answers).reduce((acc, curr) => acc + curr, 0);
    const maxScore = getMaxScoreForType(activeType);
    setIsSubmitting(true);

    try {
      if (accessToken) {
        const res = await fetch(`${API_URL}/api/auth/assessments/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            assessment_type: activeType === 'ALL' ? 'COMPREHENSIVE' : activeType,
            score: rawScore,
            max_score: maxScore,
            answers: answers,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setResult(data);
          setIsSubmitting(false);
          fetchHistory(); // Refresh recorded history timeline immediately
          return;
        }
      }
    } catch (e) {
      console.error('Assessment submission error:', e);
    }

    // Local fallback calculation
    let severity = 'Balanced & Steady Well-Being';
    let recommendations: string[] = ['Maintain healthy daily routines & sleep schedules', 'Practice 10 minutes of daily mindfulness'];

    if (activeType === 'ALL') {
      if (rawScore > 50) severity = 'Warm Guided Care & Support Recommended';
      else if (rawScore > 30) severity = 'Moderate Support & Guided Reflection';
      else if (rawScore > 15) severity = 'Gentle Rest & Self-Care Reflection';
      else severity = 'High Vitality & Calm Well-Being';
    } else if (activeType === 'PHQ9') {
      if (rawScore > 14) severity = 'Warm Guided Care Recommended';
      else if (rawScore > 9) severity = 'Extra Care & Support Recommended';
      else if (rawScore > 4) severity = 'Gentle Self-Care Reflection';
    } else if (activeType === 'GAD7') {
      if (rawScore > 14) severity = 'Deep Grounding & Guided Support';
      else if (rawScore > 9) severity = 'Mindful Pause & Support';
      else if (rawScore > 4) severity = 'Slight Restlessness';
      else severity = 'Calm & Grounded';
    } else if (activeType === 'STRESS') {
      if (rawScore > 20) severity = 'Elevated Stress — Guided Support';
      else if (rawScore > 10) severity = 'Moderate Stress — Mindful Break';
      else severity = 'Low Stress & Balanced';
    } else if (activeType === 'SLEEP') {
      if (rawScore > 8) severity = 'Sleep Support Recommended';
      else if (rawScore > 4) severity = 'Mild Sleep Restlessness';
      else severity = 'Restful & Rejuvenating Sleep';
    }

    const newRes = {
      type: activeType,
      score: rawScore,
      max_score: maxScore,
      severity: severity,
      recommendations: recommendations,
      date: new Date().toLocaleString()
    };
    setResult(newRes);
    setIsSubmitting(false);
  };

  const handleExportPDF = () => {
    if (!result) return;
    setExportNotice('Generating downloadable reflection summary...');
    setTimeout(() => {
      const blob = new Blob(
        [
          `MANMITRA SELF-REFLECTION RECORD\n` +
          `Date Recorded: ${result.created_at || result.date || new Date().toLocaleString()}\n` +
          `Check-in Type: ${getTitleForType(result.type || activeType)}\n` +
          `Score: ${result.score} / ${result.max_score}\n` +
          `Well-Being Status: ${result.severity}\n\n` +
          `RECOMMENDED CARE PATHWAY:\n` +
          (result.recommendations || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')
        ],
        { type: 'text/plain' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manmitra_reflection_${activeType.toLowerCase()}_${Date.now()}.txt`;
      a.click();
      setExportNotice('✔ Reflection record downloaded successfully!');
      setTimeout(() => setExportNotice(''), 4000);
    }, 800);
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
              <Brain className="w-4 h-4 text-sky-400" /> Guided Self-Reflection Check-ins
            </div>
            <h2 className="text-2xl font-extrabold font-outfit text-white">Emotional Well-Being & Health Check-in</h2>
            <p className="text-sm text-slate-300 font-normal max-w-xl leading-relaxed">
              Take focused check-in categories or complete a full wellness assessment. All your check-in submissions are saved to your daily reflection history.
            </p>
          </div>
        </div>

        {/* 5 Assessment Type Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          <button
            onClick={() => { setActiveType('ALL'); handleReset(); }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeType === 'ALL' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Complete Check-in
          </button>
          <button
            onClick={() => { setActiveType('PHQ9'); handleReset(); }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeType === 'PHQ9' ? 'bg-[#0284c7] text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> Mood & Energy
          </button>
          <button
            onClick={() => { setActiveType('GAD7'); handleReset(); }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeType === 'GAD7' ? 'bg-[#0284c7] text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" /> Calmness & Peace
          </button>
          <button
            onClick={() => { setActiveType('STRESS'); handleReset(); }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeType === 'STRESS' ? 'bg-[#0284c7] text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Daily Stress
          </button>
          <button
            onClick={() => { setActiveType('SLEEP'); handleReset(); }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeType === 'SLEEP' ? 'bg-[#0284c7] text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Sleep Quality
          </button>
        </div>
      </div>

      {exportNotice && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice('')} className="font-bold text-emerald-800">Dismiss</button>
        </motion.div>
      )}

      {/* Main Assessment Container */}
      {!result ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="font-bold text-slate-800">{getTitleForType(activeType)}</span>
              <span>{answeredCount} of {totalQuestions} Answered ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0284c7] to-sky-400 transition-all duration-300 rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <p className="text-xs text-slate-500 italic bg-sky-50/50 p-3 rounded-xl border border-sky-100/60">
            "Over the last 2 weeks, how often have you felt bothered by any of the following experiences?"
          </p>

          {/* Question Items */}
          <div className="space-y-4">
            {questions.map((qText, idx) => {
              const meta = activeType === 'ALL' ? ALL_QUESTIONS_STRUCTURED[idx] : null;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 hover:bg-sky-50/30 border border-slate-100 transition-all space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-sky-100 text-[#0284c7] text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-800 pt-0.5">{qText}</h4>
                    </div>
                    {meta && (
                      <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0">
                        {meta.category}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleSelectOption(idx, opt.value)}
                        className={`p-2.5 rounded-xl text-xs font-medium border transition-all text-center ${
                          answers[idx] === opt.value
                            ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button onClick={handleReset} className="px-4 py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Reset Form
            </button>
            <button
              disabled={answeredCount < totalQuestions || isSubmitting}
              onClick={handleSubmit}
              className={`px-6 py-3 rounded-2xl text-xs font-bold text-white transition-all flex items-center gap-2 ${
                answeredCount === totalQuestions
                  ? 'bg-gradient-to-r from-[#0284c7] to-sky-500 shadow-md hover:shadow-lg hover:scale-[1.01]'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Recording Reflection...
                </>
              ) : (
                <>
                  Complete & Record Check-in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      ) : (
        /* Results Card */
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Recorded to Daily History
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-outfit">
                {getTitleForType(result.type || activeType)}
              </h3>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExportPDF} className="px-4 py-2 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200 hover:bg-sky-100 text-xs font-bold flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Download Insights
              </button>
              <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold">
                Take Another Check-in
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-100 text-center space-y-1">
              <span className="text-xs text-slate-500 font-medium">Insight Score</span>
              <div className="text-4xl font-extrabold text-[#0284c7] font-outfit">{result.score} <span className="text-base text-slate-400 font-normal">/ {result.max_score}</span></div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-100 text-center space-y-1">
              <span className="text-xs text-amber-700 font-medium">Well-Being Status</span>
              <div className="text-lg font-bold text-amber-900 font-outfit">{result.severity}</div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center space-y-1">
              <span className="text-xs text-emerald-700 font-medium">Suggested Care Path</span>
              <div className="text-xs font-bold text-emerald-900 pt-1">
                {result.score >= (result.max_score / 2) ? 'Connecting with a Guide Recommended' : 'Mindful Self-Care & Guided Practice'}
              </div>
            </div>
          </div>

          {/* AI Recommended Care Plan */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" /> Personalized Wellness & Care Suggestions
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {(result.recommendations || []).map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {onNavigateTab && (
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => onNavigateTab('doctors')} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-2">
                Book Session with a Guide <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── DAILY RECORDING HISTORY TIMELINE PANEL ────────────────────────────── */}
      <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <History className="w-4 h-4 text-[#0284c7]" /> Your Daily Reflection History & Saved Records ({pastHistory.length})
          </div>
          <button onClick={fetchHistory} className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh Records
          </button>
        </div>

        {pastHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 italic space-y-2">
            <p>No check-in recordings found yet.</p>
            <p className="text-[11px] text-slate-400 font-normal">Complete your check-in above and it will automatically be saved here every day.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {pastHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200/80 transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#0284c7] font-bold flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-800">{getTitleForType(item.type)}</h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-sky-100 text-sky-800">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{item.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-extrabold text-[#0284c7] text-sm">{item.score}</span>
                    <span className="text-[10px] text-slate-400">/{item.max_score}</span>
                    <div className="text-[10px] font-bold text-emerald-700">{item.severity}</div>
                  </div>
                  <button
                    onClick={() => { setResult(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0284c7] hover:border-sky-300"
                    title="View Past Reflection"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
