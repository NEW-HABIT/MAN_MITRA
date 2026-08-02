"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, AlertCircle, Sparkles, Download, Brain,
  RefreshCw, ShieldAlert, Award, Clock, ArrowRight, HeartPulse, ChevronRight
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
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things, such as reading or watching TV",
  "Moving or speaking so slowly that other people could have noticed",
  "Thoughts that you would be better off dead, or of hurting yourself"
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

const FREQUENCY_OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

export default function AssessmentSuite({ accessToken, onNavigateTab }: AssessmentSuiteProps) {
  const [activeType, setActiveType] = useState<'PHQ9' | 'GAD7' | 'STRESS' | 'SLEEP'>('PHQ9');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [exportNotice, setExportNotice] = useState('');

  const questions = activeType === 'PHQ9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (qIndex: number, val: number) => {
    setAnswers(prev => ({ ...prev, [qIndex]: val }));
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
  };

  const handleSubmit = async () => {
    const rawScore = Object.values(answers).reduce((acc, curr) => acc + curr, 0);
    const maxScore = activeType === 'PHQ9' ? 27 : 21;
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
            assessment_type: activeType,
            score: rawScore,
            max_score: maxScore,
            answers: answers,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setResult(data);
          setIsSubmitting(false);
          return;
        }
      }
    } catch (e) {
      console.error('Assessment submission error:', e);
    }

    // Local calculation fallback
    let severity = 'Minimal';
    let recommendations: string[] = [];

    if (activeType === 'PHQ9') {
      if (rawScore <= 4) {
        severity = 'Minimal Depression';
        recommendations = [
          'Maintain regular daily wellness routines & sleep schedules',
          'Practice 10 minutes of daily mindfulness or breathing',
          'Log your daily mood check-in'
        ];
      } else if (rawScore <= 9) {
        severity = 'Mild Depression';
        recommendations = [
          'Engage in daily CBT thought reframing exercises',
          'Increase physical activity or morning walks',
          'Utilize ManMitra AI Chat Assistant for guided coping strategies'
        ];
      } else if (rawScore <= 14) {
        severity = 'Moderate Depression';
        recommendations = [
          'Schedule a 1-on-1 session with a verified specialist therapist',
          'Practice structured CBT gratitude and emotion logging',
          'Share progress with family or support network'
        ];
      } else {
        severity = 'Severe Depression';
        recommendations = [
          'Prioritize a consultation session with a psychiatrist or doctor',
          'Access 24/7 crisis helpline support if feeling overwhelmed',
          'Set small manageable daily micro-goals'
        ];
      }
    } else {
      if (rawScore <= 4) {
        severity = 'Minimal Anxiety';
        recommendations = [
          'Use 4-7-8 Breathing exercises during stress peaks',
          'Maintain regular exercise and sleep hygiene'
        ];
      } else if (rawScore <= 9) {
        severity = 'Mild Anxiety';
        recommendations = [
          'Practice daily Box Breathing & progressive relaxation',
          'Limit caffeine and evening blue light exposure'
        ];
      } else if (rawScore <= 14) {
        severity = 'Moderate Anxiety';
        recommendations = [
          'Book an online therapy consultation for CBT anxiety protocols',
          'Use ambient sleep sounds and guided relaxation'
        ];
      } else {
        severity = 'Severe Anxiety';
        recommendations = [
          'Urgent clinical therapist evaluation recommended',
          'Use ManMitra panic attack grounding toolkit'
        ];
      }
    }

    setResult({
      type: activeType,
      score: rawScore,
      max_score: maxScore,
      severity: severity,
      recommendations: recommendations,
      created_at: new Date().toLocaleString(),
    });
    setIsSubmitting(false);
  };

  const handleExportPDF = () => {
    setExportNotice('Generating clinical assessment PDF summary...');
    setTimeout(() => {
      const blob = new Blob(
        [
          `MANMITRA CLINICAL ASSESSMENT REPORT\n` +
          `Date: ${new Date().toLocaleString()}\n` +
          `Assessment Type: ${activeType === 'PHQ9' ? 'PHQ-9 Depression Scale' : 'GAD-7 Anxiety Scale'}\n` +
          `Score: ${result?.score} / ${result?.max_score}\n` +
          `Severity Level: ${result?.severity}\n\n` +
          `RECOMMENDED CARE PATHWAY:\n` +
          (result?.recommendations || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')
        ],
        { type: 'text/plain' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manmitra_${activeType.toLowerCase()}_report_${Date.now()}.txt`;
      a.click();
      setExportNotice('✔ Clinical report downloaded successfully!');
      setTimeout(() => setExportNotice(''), 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Banner Header */}
      <div className="glass-panel p-6 rounded-3xl bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
            <Brain className="w-4 h-4" /> Guided Self-Reflection Check-ins
          </div>
          <h2 className="text-2xl font-bold font-outfit">Emotional Well-Being Check-in</h2>
          <p className="text-xs text-sky-200/80 max-w-xl">
            Take a gentle, guided check-in to reflect on your emotional energy, calm, and receive personalized self-care recommendations.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveType('PHQ9')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeType === 'PHQ9' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Mood & Energy Check
          </button>
          <button
            onClick={() => setActiveType('GAD7')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeType === 'GAD7' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Calmness & Peace Check
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
              <span>{activeType === 'PHQ9' ? 'Mood & Energy Check-in' : 'Calmness & Peace Check-in'}</span>
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
            {questions.map((qText, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 hover:bg-sky-50/30 border border-slate-100 transition-all space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-[#0284c7] text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 pt-0.5">{qText}</h4>
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
            ))}
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
                  <RefreshCw className="w-4 h-4 animate-spin" /> Preparing Your Insights...
                </>
              ) : (
                <>
                  Complete Check-in <ArrowRight className="w-4 h-4" />
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
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Check-in Completed</span>
              <h3 className="text-xl font-bold text-slate-900 font-outfit">
                {result.type === 'PHQ9' ? 'Mood & Energy Insights' : 'Calmness & Peace Insights'}
              </h3>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExportPDF} className="px-4 py-2 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200 hover:bg-sky-100 text-xs font-bold flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Download Insights
              </button>
              <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold">
                Retake Check-in
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
                {result.score >= 15 ? 'Connecting with a Guide Recommended' : 'Mindful Self-Care & Guided Practice'}
              </div>
            </div>
          </div>

          {/* AI Recommended Care Plan */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" /> Personalized Wellness & Care Suggestions

            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {result.recommendations.map((rec: string, i: number) => (
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
                Book Consultation with Doctor <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
