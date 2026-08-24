"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, HeartPulse, Sparkles, Download, CheckCircle2,
  RefreshCw, ChevronRight, History, Calendar, Eye, ArrowRight,
  Activity, Smile, Sun
} from 'lucide-react';
import { API_URL } from '@/config';

interface AssessmentSuiteProps {
  accessToken?: string;
  onNavigateTab?: (tab: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GENERAL HEALTH & LIFE BALANCE (28 ITEMS)
// ─────────────────────────────────────────────────────────────────────────────
const GHQ28_ITEMS = [
  // A — Physical Energy & Body Comfort: Q1–Q7
  { id: 1, text: "General feeling of being healthy or unwell", subscale: 'Physical Energy & Body Comfort', group: 'A' },
  { id: 2, text: "Feeling the need for something to restore energy", subscale: 'Physical Energy & Body Comfort', group: 'A' },
  { id: 3, text: "Feeling run-down or out of sorts", subscale: 'Physical Energy & Body Comfort', group: 'A' },
  { id: 4, text: "Feeling that you are physically ill", subscale: 'Physical Energy & Body Comfort', group: 'A' },
  { id: 5, text: "Experiencing headaches", subscale: 'Physical Energy & Body Comfort', group: 'A' },
  { id: 6, text: "Experiencing pressure or tightness in the head", subscale: 'Physical Energy & Body Comfort', group: 'A' },
  { id: 7, text: "Experiencing hot or cold spells", subscale: 'Physical Energy & Body Comfort', group: 'A' },

  // B — Calmness & Restful Sleep: Q8–Q14
  { id: 8, text: "Losing sleep because of worries", subscale: 'Calmness & Restful Sleep', group: 'B' },
  { id: 9, text: "Difficulty staying asleep", subscale: 'Calmness & Restful Sleep', group: 'B' },
  { id: 10, text: "Feeling constantly under pressure", subscale: 'Calmness & Restful Sleep', group: 'B' },
  { id: 11, text: "Feeling unable to overcome difficulties", subscale: 'Calmness & Restful Sleep', group: 'B' },
  { id: 12, text: "Feeling nervous or tense", subscale: 'Calmness & Restful Sleep', group: 'B' },
  { id: 13, text: "Feeling frightened or panicky", subscale: 'Calmness & Restful Sleep', group: 'B' },
  { id: 14, text: "Feeling that things are becoming overwhelming", subscale: 'Calmness & Restful Sleep', group: 'B' },

  // C — Daily Motivation & Activities: Q15–Q21
  { id: 15, text: "Ability to keep yourself busy and occupied", subscale: 'Daily Motivation & Activities', group: 'C' },
  { id: 16, text: "Feeling that you are playing a useful role", subscale: 'Daily Motivation & Activities', group: 'C' },
  { id: 17, text: "Ability to make decisions", subscale: 'Daily Motivation & Activities', group: 'C' },
  { id: 18, text: "Enjoyment of normal daily activities", subscale: 'Daily Motivation & Activities', group: 'C' },
  { id: 19, text: "Ability to face problems", subscale: 'Daily Motivation & Activities', group: 'C' },
  { id: 20, text: "Ability to feel reasonably happy", subscale: 'Daily Motivation & Activities', group: 'C' },
  { id: 21, text: "Satisfaction with your activities and accomplishments", subscale: 'Daily Motivation & Activities', group: 'C' },

  // D — Emotional Well-Being & Hope: Q22–Q28
  { id: 22, text: "Feeling that life is not worthwhile", subscale: 'Emotional Well-Being & Hope', group: 'D' },
  { id: 23, text: "Having thoughts about ending your life", subscale: 'Emotional Well-Being & Hope', group: 'D' },
  { id: 24, text: "Feeling hopeless about the future", subscale: 'Emotional Well-Being & Hope', group: 'D' },
  { id: 25, text: "Feeling that life is not worth living", subscale: 'Emotional Well-Being & Hope', group: 'D' },
  { id: 26, text: "Thinking about taking your own life", subscale: 'Emotional Well-Being & Hope', group: 'D' },
  { id: 27, text: "Feeling unable to overcome difficulties", subscale: 'Emotional Well-Being & Hope', group: 'D' },
  { id: 28, text: "Losing confidence in yourself", subscale: 'Emotional Well-Being & Hope', group: 'D' },
];

const GHQ28_OPTIONS = [
  { label: 'Not at all / Better than usual', value: 0 },
  { label: 'No more than usual / Same as usual', value: 1 },
  { label: 'Rather more than usual / Worse than usual', value: 2 },
  { label: 'Much more than usual', value: 3 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. POSITIVE VITALITY & JOY INDEX (5 ITEMS)
// ─────────────────────────────────────────────────────────────────────────────
const WHO5_ITEMS = [
  { id: 1, text: "Feeling cheerful and in good spirits" },
  { id: 2, text: "Feeling calm and relaxed" },
  { id: 3, text: "Feeling active and energetic" },
  { id: 4, text: "Waking up feeling fresh and rested" },
  { id: 5, text: "Having daily life filled with things that interest you" },
];

const WHO5_OPTIONS = [
  { label: 'At no time', value: 0 },
  { label: 'Some of the time', value: 1 },
  { label: 'Less than half the time', value: 2 },
  { label: 'More than half the time', value: 3 },
  { label: 'Most of the time', value: 4 },
  { label: 'All of the time', value: 5 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. EMOTIONAL HARMONY & INNER BALANCE (21 ITEMS)
// ─────────────────────────────────────────────────────────────────────────────
const DASS21_ITEMS = [
  // Mood & Motivation (7 questions)
  { id: 1, text: "Difficulty experiencing positive feelings", subscale: 'Mood & Motivation' },
  { id: 2, text: "Difficulty initiating activities", subscale: 'Mood & Motivation' },
  { id: 3, text: "Feeling that there is little to look forward to", subscale: 'Mood & Motivation' },
  { id: 4, text: "Feeling sad or depressed", subscale: 'Mood & Motivation' },
  { id: 5, text: "Feeling that life has little meaning", subscale: 'Mood & Motivation' },
  { id: 6, text: "Feeling unable to become enthusiastic", subscale: 'Mood & Motivation' },
  { id: 7, text: "Feeling that you are not worth much as a person", subscale: 'Mood & Motivation' },

  // Calmness & Peace (7 questions)
  { id: 8, text: "Awareness of dryness of mouth", subscale: 'Calmness & Peace' },
  { id: 9, text: "Breathing difficulties without physical exertion", subscale: 'Calmness & Peace' },
  { id: 10, text: "Experiencing trembling", subscale: 'Calmness & Peace' },
  { id: 11, text: "Feeling close to panic", subscale: 'Calmness & Peace' },
  { id: 12, text: "Awareness of heartbeat without physical exertion", subscale: 'Calmness & Peace' },
  { id: 13, text: "Feeling frightened without a clear reason", subscale: 'Calmness & Peace' },
  { id: 14, text: "Feeling close to a panic attack", subscale: 'Calmness & Peace' },

  // Daily Pressure & Balance (7 questions)
  { id: 15, text: "Difficulty calming down", subscale: 'Daily Pressure & Balance' },
  { id: 16, text: "Overreacting to situations", subscale: 'Daily Pressure & Balance' },
  { id: 17, text: "Feeling that you are using a lot of nervous energy", subscale: 'Daily Pressure & Balance' },
  { id: 18, text: "Becoming easily agitated", subscale: 'Daily Pressure & Balance' },
  { id: 19, text: "Finding it difficult to relax", subscale: 'Daily Pressure & Balance' },
  { id: 20, text: "Being easily irritated", subscale: 'Daily Pressure & Balance' },
  { id: 21, text: "Feeling intolerant when interrupted", subscale: 'Daily Pressure & Balance' },
];

const DASS21_OPTIONS = [
  { label: 'Did not apply to me at all', value: 0 },
  { label: 'Applied to me to some degree / some of time', value: 1 },
  { label: 'Applied to me to a considerable degree', value: 2 },
  { label: 'Applied to me very much / most of time', value: 3 },
];

export default function AssessmentSuite({ accessToken, onNavigateTab }: AssessmentSuiteProps) {
  const [activeBattery, setActiveBattery] = useState<'GHQ28' | 'WHO5' | 'DASS21'>('GHQ28');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [pastHistory, setPastHistory] = useState<any[]>([]);
  const [exportNotice, setExportNotice] = useState('');

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
      console.error('Failed to fetch check-in history:', e);
    }
  };

  const handleSelectOption = (index: number, val: number) => {
    setAnswers(prev => ({ ...prev, [index]: val }));
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
  };

  const currentQuestions = activeBattery === 'GHQ28'
    ? GHQ28_ITEMS
    : activeBattery === 'WHO5'
    ? WHO5_ITEMS
    : DASS21_ITEMS;

  const currentOptions = activeBattery === 'GHQ28'
    ? GHQ28_OPTIONS
    : activeBattery === 'WHO5'
    ? WHO5_OPTIONS
    : DASS21_OPTIONS;

  const totalQuestions = currentQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // ─────────────────────────────────────────────────────────────────────────
  // SCORING LOGIC
  // ─────────────────────────────────────────────────────────────────────────
  const calculateResult = () => {
    if (activeBattery === 'GHQ28') {
      const rawTotal = Object.values(answers).reduce((a, b) => a + b, 0);
      
      const somaticScore = GHQ28_ITEMS.slice(0, 7).reduce((acc, _, idx) => acc + (answers[idx] || 0), 0);
      const anxietyScore = GHQ28_ITEMS.slice(7, 14).reduce((acc, _, idx) => acc + (answers[idx + 7] || 0), 0);
      const socialScore = GHQ28_ITEMS.slice(14, 21).reduce((acc, _, idx) => acc + (answers[idx + 14] || 0), 0);
      const depressionScore = GHQ28_ITEMS.slice(21, 28).reduce((acc, _, idx) => acc + (answers[idx + 21] || 0), 0);

      let severity = 'Balanced & Steady Well-Being';
      if (rawTotal >= 24) {
        severity = 'Experiencing Noticeable Strain — Gentle Support Recommended';
      } else if (rawTotal >= 15) {
        severity = 'Mild Everyday Fatigue & Strain';
      }

      return {
        battery: 'GHQ28',
        title: 'Daily Life & Overall Balance Check-in',
        score: rawTotal,
        max_score: 84,
        severity,
        subscales: [
          { name: 'Physical Energy & Body Comfort', score: somaticScore, max: 21 },
          { name: 'Calmness & Restful Sleep', score: anxietyScore, max: 21 },
          { name: 'Daily Motivation & Activities', score: socialScore, max: 21 },
          { name: 'Emotional Well-Being & Hope', score: depressionScore, max: 21 },
        ],
        recommendations: rawTotal >= 24
          ? [
              'Consider scheduling a relaxing 1-on-1 session with a psychologist',
              'Practice gentle grounding, warm tea breaks, and restful pauses',
              'Set peaceful evening routines and protect your resting hours'
            ]
          : [
              'Continue your healthy daily habits and enjoyable routines',
              'Keep time for joyful hobbies, rest, and uplifting social moments'
            ]
      };
    } else if (activeBattery === 'WHO5') {
      const rawScore = Object.values(answers).reduce((a, b) => a + b, 0);
      const percentage = rawScore * 4;

      let severity = 'Vibrant & Positive Well-Being (75–100%)';
      if (percentage <= 25) {
        severity = 'Low Energy & Joy — Warm Care Recommended (0–25%)';
      } else if (percentage <= 50) {
        severity = 'Gentle Rest & Extra Support Recommended (26–50%)';
      } else if (percentage < 75) {
        severity = 'Good, Steady Well-Being (51–74%)';
      }

      return {
        battery: 'WHO5',
        title: 'Vitality & Daily Joy Check-in',
        score: percentage,
        raw_score: rawScore,
        max_score: 100,
        severity,
        subscales: [
          { name: 'Daily Cheerfulness & Energy', score: percentage, max: 100 }
        ],
        recommendations: percentage <= 50
          ? [
              'Connect with a friendly psychologist for warm guidance & self-care steps',
              'Engage in gentle, uplifting activities that bring you comfort and ease',
              'Give yourself permission to slow down and rest without pressure'
            ]
          : [
              'Maintain your positive daily moments and things that spark your interest',
              'Celebrate your moments of calm, energy, and inspiration'
            ]
      };
    } else {
      // DASS-21
      const depRaw = DASS21_ITEMS.slice(0, 7).reduce((acc, _, idx) => acc + (answers[idx] || 0), 0);
      const anxRaw = DASS21_ITEMS.slice(7, 14).reduce((acc, _, idx) => acc + (answers[idx + 7] || 0), 0);
      const strRaw = DASS21_ITEMS.slice(14, 21).reduce((acc, _, idx) => acc + (answers[idx + 14] || 0), 0);

      const depScaled = depRaw * 2;
      const anxScaled = anxRaw * 2;
      const strScaled = strRaw * 2;

      const getDepSeverity = (s: number) => {
        if (s >= 28) return 'Needs Immediate Gentle Support';
        if (s >= 21) return 'Needs Extra Care & Support';
        if (s >= 14) return 'Needs Some Attention & Rest';
        if (s >= 10) return 'Mild Strain';
        return 'Balanced & Peaceful';
      };

      const getAnxSeverity = (s: number) => {
        if (s >= 20) return 'Needs Immediate Gentle Support';
        if (s >= 15) return 'Needs Extra Care & Support';
        if (s >= 10) return 'Needs Some Attention & Rest';
        if (s >= 8) return 'Mild Restlessness';
        return 'Calm & Grounded';
      };

      const getStrSeverity = (s: number) => {
        if (s >= 34) return 'Needs Immediate Gentle Support';
        if (s >= 26) return 'Needs Extra Care & Support';
        if (s >= 19) return 'Moderate Pressure';
        if (s >= 15) return 'Mild Pressure';
        return 'Balanced & Relaxed';
      };

      const totalScaled = depScaled + anxScaled + strScaled;

      return {
        battery: 'DASS21',
        title: 'Emotional Harmony & Inner Balance Check-in',
        score: totalScaled,
        max_score: 126,
        severity: `Mood: ${getDepSeverity(depScaled)} | Calmness: ${getAnxSeverity(anxScaled)} | Daily Pressure: ${getStrSeverity(strScaled)}`,
        subscales: [
          { name: 'Mood & Motivation', score: depScaled, max: 42, label: getDepSeverity(depScaled) },
          { name: 'Calmness & Peace', score: anxScaled, max: 42, label: getAnxSeverity(anxScaled) },
          { name: 'Daily Pressure & Balance', score: strScaled, max: 42, label: getStrSeverity(strScaled) },
        ],
        recommendations: (depScaled >= 14 || anxScaled >= 10 || strScaled >= 19)
          ? [
              'Connecting with a psychologist is warmly recommended for gentle guidance',
              'Practice slow, calming 4-7-8 breathing exercises and muscle relaxation',
              'Break tasks into gentle, simple steps to stay relaxed and focused'
            ]
          : [
              'Keep up your mindful relaxation habits and positive daily reflections',
              'Protect your resting hours and enjoy regular moments of peace'
            ]
      };
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const computed = calculateResult();

    try {
      if (accessToken) {
        await fetch(`${API_URL}/api/auth/assessments/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            assessment_type: computed.battery,
            score: computed.score,
            max_score: computed.max_score,
            answers: answers,
          }),
        });
        await fetchHistory();
      }
    } catch (e) {
      console.error('Check-in sync error:', e);
    } finally {
      setResult(computed);
      setIsSubmitting(false);
    }
  };

  const handleExportPDF = () => {
    if (!result) return;
    setExportNotice('Generating downloadable reflection summary...');
    setTimeout(() => {
      const blob = new Blob(
        [
          `MANMITRA SELF-REFLECTION & WELLNESS SUMMARY\n` +
          `Date: ${new Date().toLocaleString()}\n` +
          `Check-in Type: ${result.title}\n` +
          `Score: ${result.score} / ${result.max_score}\n` +
          `Well-Being Summary: ${result.severity}\n\n` +
          `DETAILED AREAS:\n` +
          (result.subscales || []).map((s: any) => `- ${s.name}: ${s.score} / ${s.max} ${s.label ? `(${s.label})` : ''}`).join('\n') +
          `\n\nRECOMMENDED SELF-CARE PATHWAYS:\n` +
          (result.recommendations || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')
        ],
        { type: 'text/plain' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manmitra_reflection_summary_${Date.now()}.txt`;
      a.click();
      setExportNotice('✔ Reflection summary downloaded successfully!');
      setTimeout(() => setExportNotice(''), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
              <Brain className="w-4 h-4 text-sky-400" /> Gentle Self-Reflection & Check-ins
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white">Daily Self-Reflection & Check-ins</h2>
            <p className="text-xs sm:text-sm text-slate-300 font-normal max-w-2xl leading-relaxed">
              Take a few mindful moments to check in with your mind, body, and emotions. Choose a check-in below that fits what you'd like to reflect on today.
            </p>
          </div>
        </div>

        {/* 3 Check-in Category Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <button
            onClick={() => { setActiveBattery('GHQ28'); handleReset(); }}
            className={`p-3.5 rounded-2xl text-xs font-bold transition-all text-left flex items-start gap-3 cursor-pointer ${
              activeBattery === 'GHQ28'
                ? 'bg-[#0284c7] text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="block font-bold">1. Daily Life & Balance</span>
              <span className="text-[10px] font-normal opacity-80">Energy, sleep, and overall wellness check-in</span>
            </div>
          </button>

          <button
            onClick={() => { setActiveBattery('WHO5'); handleReset(); }}
            className={`p-3.5 rounded-2xl text-xs font-bold transition-all text-left flex items-start gap-3 cursor-pointer ${
              activeBattery === 'WHO5'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Smile className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="block font-bold">2. Vitality & Joy Index</span>
              <span className="text-[10px] font-normal opacity-80">Cheerfulness, calm, and positive energy</span>
            </div>
          </button>

          <button
            onClick={() => { setActiveBattery('DASS21'); handleReset(); }}
            className={`p-3.5 rounded-2xl text-xs font-bold transition-all text-left flex items-start gap-3 cursor-pointer ${
              activeBattery === 'DASS21'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <HeartPulse className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="block font-bold">3. Emotional Harmony</span>
              <span className="text-[10px] font-normal opacity-80">Mood, peace of mind, and handling daily pressure</span>
            </div>
          </button>
        </div>
      </div>

      {exportNotice && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice('')} className="font-bold text-emerald-800 cursor-pointer">Dismiss</button>
        </motion.div>
      )}

      {/* Main Questionnaire Container */}
      {!result ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6">
          {/* Progress Bar & Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="font-bold text-slate-900 text-sm">
                {activeBattery === 'GHQ28' ? 'Daily Life & Overall Balance Check-in' : activeBattery === 'WHO5' ? 'Vitality & Daily Joy Check-in' : 'Emotional Harmony & Inner Balance Check-in'}
              </span>
              <span className="text-[#0284c7] font-bold">{answeredCount} of {totalQuestions} Answered ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0284c7] to-sky-400 transition-all duration-300 rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">How to Answer:</span>
            {activeBattery === 'GHQ28' && (
              <p>Over the past few weeks, how have you been feeling in comparison to your usual state?</p>
            )}
            {activeBattery === 'WHO5' && (
              <p>Please select how often you have felt this way over the last two weeks.</p>
            )}
            {activeBattery === 'DASS21' && (
              <p>Please select how much each statement applied to you over the past week.</p>
            )}
          </div>

          {/* Question Items */}
          <div className="space-y-4">
            {currentQuestions.map((q: any, idx) => {
              const isAnswered = answers[idx] !== undefined;
              return (
                <div
                  key={q.id || idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                    isAnswered
                      ? 'bg-sky-50/20 border-sky-200'
                      : 'bg-slate-50/70 hover:bg-sky-50/30 border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 ${
                        isAnswered ? 'bg-[#0284c7] text-white shadow-sm' : 'bg-sky-100 text-[#0284c7]'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 pt-0.5">{q.text}</h4>
                        {q.subscale && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                            {q.subscale}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Options Buttons */}
                  <div className={`grid gap-2 pt-1 ${
                    activeBattery === 'WHO5' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  }`}>
                    {currentOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => handleSelectOption(idx, opt.value)}
                        className={`p-2.5 rounded-xl text-xs font-medium border transition-all text-center cursor-pointer ${
                          answers[idx] === opt.value
                            ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50'
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

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Answers
            </button>

            <button
              disabled={answeredCount < totalQuestions || isSubmitting}
              onClick={handleSubmit}
              className={`glow-btn px-6 py-3 rounded-2xl text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer ${
                answeredCount === totalQuestions
                  ? 'opacity-100 shadow-md hover:scale-[1.01]'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving Your Reflection...
                </>
              ) : (
                <>
                  Complete & View My Reflection <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      ) : (
        /* Results Card */
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Reflection Saved to Your Journal
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-outfit mt-1">
                {result.title}
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200 hover:bg-sky-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Summary
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer"
              >
                Take Another Check-in
              </button>
            </div>
          </div>

          {/* Primary Score & Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-100 text-center space-y-1">
              <span className="text-xs text-slate-500 font-medium">
                {result.battery === 'WHO5' ? 'Joy & Vitality Percentage' : 'Overall Balance Score'}
              </span>
              <div className="text-4xl font-extrabold text-[#0284c7] font-outfit">
                {result.score} <span className="text-base text-slate-400 font-normal">/ {result.max_score}{result.battery === 'WHO5' ? '%' : ''}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-100 text-center space-y-1 md:col-span-2 flex flex-col justify-center">
              <span className="text-xs text-amber-700 font-bold uppercase tracking-wider">Your Current Well-Being State</span>
              <div className="text-base sm:text-lg font-bold text-amber-900 font-outfit">{result.severity}</div>
            </div>
          </div>

          {/* Subscales Breakdown */}
          {result.subscales && result.subscales.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0284c7]" /> Detailed Areas of Well-Being
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {result.subscales.map((sub: any, i: number) => {
                  const percent = Math.min(100, Math.round((sub.score / sub.max) * 100));
                  return (
                    <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{sub.name}</span>
                        <span className="font-extrabold text-[#0284c7]">{sub.score}/{sub.max}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-sky-400 to-[#0284c7]" style={{ width: `${percent}%` }} />
                      </div>
                      {sub.label && (
                        <div className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-center">
                          {sub.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Recommended Care Pathways */}
          <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" /> Personalized Self-Care & Support Suggestions
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
              <button
                onClick={() => onNavigateTab('booking')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                Connect with a Psychologist <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── PRESENT COMPLAINTS & CHECK-IN RECORDINGS PANEL ────────────────────────────── */}
      <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <History className="w-4 h-4 text-[#0284c7]" /> Present Complaints ({pastHistory.length})
          </div>
          <button onClick={fetchHistory} className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer">
            <RefreshCw className="w-3 h-3" /> Refresh Records
          </button>
        </div>

        {pastHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 italic space-y-2">
            <p>No present complaints recorded yet.</p>
            <p className="text-[11px] text-slate-400 font-normal">Complete your check-in above and your recorded complaints will automatically appear here.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {pastHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200/80 transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#0284c7] font-bold flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-800">
                        {item.assessment_type === 'GHQ28' ? 'Daily Life & Balance' : item.assessment_type === 'WHO5' ? 'Vitality & Joy Index' : item.assessment_type === 'DASS21' ? 'Emotional Harmony' : (item.assessment_type || item.type || 'Mindful Check-in')}
                      </h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-sky-100 text-sky-800">
                        Score: {item.score}/{item.max_score}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{item.created_at || item.date || 'Recent Check-in'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-700">Recorded ✔</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
