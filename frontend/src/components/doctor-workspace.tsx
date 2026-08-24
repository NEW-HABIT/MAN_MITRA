"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Users, Calendar, Clock, Activity, Video, FileText, CheckCircle2,
  AlertTriangle, Heart, User, Sparkles, X, ChevronRight, MessageSquare, Plus, Save,
  Pill, Download, Phone, ShieldAlert, Check, RefreshCw, Brain, TrendingUp, Zap, Info,
  Timer, Compass, Wind, Sun, Feather, Target, Layers, ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { API_URL } from '@/config';

interface DoctorWorkspaceProps {
  accessToken: string;
  doctorName: string;
}

export type PsychologistWorkspaceProps = DoctorWorkspaceProps;

export interface ModeOfApproach {
  id: string;
  name: string;
  shortName: string;
  badgeColor: string;
  bgLight: string;
  borderColor: string;
  tagline: string;
  description: string;
  defaultGoals: string[];
  defaultExercises: string[];
}

export const MODES_OF_APPROACH: ModeOfApproach[] = [
  {
    id: 'cbt',
    name: 'Cognitive Behavioral Therapy (CBT)',
    shortName: 'CBT',
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    bgLight: 'bg-indigo-50/40',
    borderColor: 'border-indigo-200',
    tagline: 'Thought Reframing & Behavioral Restructuring',
    description: 'Focuses on identifying automatic negative thoughts, evaluating cognitive distortions, and introducing structured behavioral activation.',
    defaultGoals: [
      'Identify and reframe automatic negative thinking patterns',
      'Reduce avoidant behaviors via graduated behavioral experiments',
      'Develop adaptive problem-solving skills for daily challenges'
    ],
    defaultExercises: [
      'CBT 3-Column Thought Record',
      'Daily Behavioral Activation Schedule',
      'Cognitive Distortion Identifier Worksheet'
    ]
  },
  {
    id: 'mbsr',
    name: 'Mindfulness-Based Stress Reduction (MBSR)',
    shortName: 'MBSR',
    badgeColor: 'text-sky-700 bg-sky-50 border-sky-200',
    bgLight: 'bg-sky-50/40',
    borderColor: 'border-sky-200',
    tagline: 'Somatic Grounding & Present-Moment Awareness',
    description: 'Cultivates non-judgmental awareness of present somatic sensations, diaphragmatic breath regulation, and nervous system decompression.',
    defaultGoals: [
      'De-escalate physiological fight-or-flight stress responses',
      'Deepen body-scan somatic awareness and breath control',
      'Cultivate non-reactive observation of stressful thoughts'
    ],
    defaultExercises: [
      '4-7-8 Diaphragmatic Breath Regulation (10 mins)',
      'Progressive Body Scan Meditation (15 mins)',
      'Mindful Sensory Grounding (5-4-3-2-1 Technique)'
    ]
  },
  {
    id: 'act',
    name: 'Acceptance & Commitment Therapy (ACT)',
    shortName: 'ACT',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    bgLight: 'bg-emerald-50/40',
    borderColor: 'border-emerald-200',
    tagline: 'Values Clarification & Psychological Flexibility',
    description: 'Helps patients accept difficult internal experiences without struggling, defuse from unhelpful thoughts, and commit to value-driven action.',
    defaultGoals: [
      'Clarify core personal values across life domains',
      'Practice cognitive defusion to step back from rigid self-stories',
      'Take committed, values-aligned action despite discomfort'
    ],
    defaultExercises: [
      'Values Compass & Domain Priority Matrix',
      'Leaves on a Stream Cognitive Defusion',
      'Committed Action Daily Micro-Goals'
    ]
  },
  {
    id: 'dbt',
    name: 'Dialectical Behavior Therapy (DBT)',
    shortName: 'DBT',
    badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
    bgLight: 'bg-rose-50/40',
    borderColor: 'border-rose-200',
    tagline: 'Distress Tolerance & Emotion Regulation',
    description: 'Combines standard cognitive-behavioral techniques with mindfulness and radical acceptance for managing intense emotional overwhelm.',
    defaultGoals: [
      'Build immediate distress tolerance tools for crisis moments',
      'Enhance emotion regulation and interpersonal effectiveness',
      'Practice radical acceptance of unchangeable situations'
    ],
    defaultExercises: [
      'TIPP Crisis Temperature & Paced Breathing Protocol',
      'DEAR MAN Assertive Communication Script',
      'Radical Acceptance Self-Soothing Log'
    ]
  },
  {
    id: 'sfbt',
    name: 'Solution-Focused Brief Therapy (SFBT)',
    shortName: 'SFBT',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    bgLight: 'bg-amber-50/40',
    borderColor: 'border-amber-200',
    tagline: 'Strengths-Based Goal Setting & Solutions',
    description: 'Empowers patients by identifying past coping successes, amplifying existing strengths, and formulating pragmatic next-step goals.',
    defaultGoals: [
      'Identify times when the issue was less intense (exceptions)',
      'Leverage personal strengths and community resources',
      'Implement scalable 1-to-10 progress goal milestones'
    ],
    defaultExercises: [
      'The Miracle Question Visioning Worksheet',
      'Personal Strengths & Resilience Inventory',
      '0-10 Scaling Question Daily Progress Log'
    ]
  },
  {
    id: 'humanistic',
    name: 'Person-Centered / Humanistic Therapy',
    shortName: 'Humanistic',
    badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    bgLight: 'bg-purple-50/40',
    borderColor: 'border-purple-200',
    tagline: 'Self-Actualization & Empathetic Validation',
    description: 'Fosters organic personal growth and emotional healing through unconditional positive regard, deep empathy, and authentic exploration.',
    defaultGoals: [
      'Rebuild unconditional self-trust and inner compassion',
      'Explore authentic emotional needs without external judgment',
      'Align daily life choices with the authentic self'
    ],
    defaultExercises: [
      'Self-Compassion Journaling & Letter Writing',
      'Emotional Needs & Boundary Assessment',
      'Daily Gratitude & Self-Validation Reflection'
    ]
  },
  {
    id: 'psychodynamic',
    name: 'Insight & Psychodynamic Therapy',
    shortName: 'Psychodynamic',
    badgeColor: 'text-teal-700 bg-teal-50 border-teal-200',
    bgLight: 'bg-teal-50/40',
    borderColor: 'border-teal-200',
    tagline: 'Root Patterns & Relational Dynamics',
    description: 'Explores subconscious patterns, past attachment styles, and core relational dynamics that influence present emotional wellbeing.',
    defaultGoals: [
      'Uncover recurring relational patterns and root triggers',
      'Develop insight into unconscious defense mechanisms',
      'Integrate emotional self-awareness into present relationships'
    ],
    defaultExercises: [
      'Recurring Trigger & Attachment Pattern Log',
      'Free Association Expressive Reflection',
      'Relational Boundaries & Core Dynamics Map'
    ]
  },
  {
    id: 'integrative',
    name: 'Holistic & Integrative Mental Wellness',
    shortName: 'Integrative',
    badgeColor: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    bgLight: 'bg-cyan-50/40',
    borderColor: 'border-cyan-200',
    tagline: 'Multi-Modal Bio-Psycho-Social Alignment',
    description: 'A tailored blend of somatic regulation, psychological coping tools, routine pacing, and lifestyle adjustments for complete balance.',
    defaultGoals: [
      'Establish a harmonious daily circadian and wellness routine',
      'Integrate cognitive, somatic, and lifestyle interventions',
      'Foster long-term sustainable mental and emotional vitality'
    ],
    defaultExercises: [
      'Circadian Pacing & Restful Sleep Hygiene Protocol',
      'Somatic Grounding & Vagus Nerve Exercises',
      'Holistic Wellness Weekly Pacing Plan'
    ]
  }
];

export default function DoctorWorkspace({ accessToken, doctorName }: DoctorWorkspaceProps) {
  const psychologistName = doctorName;
  const [activeTab, setActiveTab] = useState<'patients' | 'schedule' | 'crisis'>('patients');
  const [patients, setPatients] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [dutyStatus, setDutyStatus] = useState<'Available' | 'In Session' | 'Off Duty'>('Available');
  const [notice, setNotice] = useState('');

  // Treatment Plan & Mode of Approach Form state
  const [selectedModeId, setSelectedModeId] = useState<string>('');
  const [treatmentTitle, setTreatmentTitle] = useState('');
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [careNoteInput, setCareNoteInput] = useState('');
  const [goalsInput, setGoalsInput] = useState<string[]>([]);
  const [exercisesInput, setExercisesInput] = useState<string[]>([]);
  const [medicationInput, setMedicationInput] = useState('');
  const [treatmentSubmitting, setTreatmentSubmitting] = useState(false);
  const [treatmentSaved, setTreatmentSaved] = useState(false);

  // Roster Filter State
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Client Analysis state (manual modal)
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analyzingPatient, setAnalyzingPatient] = useState<any | null>(null);
  const [analysisData, setAnalysisData] = useState<any | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // Auto AI Analysis state (background 10-min polling)
  const AUTO_SCAN_INTERVAL_MS = 10 * 60 * 1000;
  const [autoAnalysisResults, setAutoAnalysisResults] = useState<Record<string, any>>({});
  const [criticalPatients, setCriticalPatients] = useState<any[]>([]);
  const [autoScanRunning, setAutoScanRunning] = useState(false);
  const [lastAutoScanTime, setLastAutoScanTime] = useState<Date | null>(null);
  const [nextScanCountdown, setNextScanCountdown] = useState<number | null>(null);
  const autoScanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const patientsRef = useRef<any[]>([]);

  const handleFetchAIAnalysis = async (patient: any) => {
    setAnalyzingPatient(patient);
    setAnalysisModalOpen(true);
    setAnalysisLoading(true);
    setAnalysisError('');
    setAnalysisData(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/therapist/patients/${patient.id}/analysis/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisData(data);
      } else {
        const err = await res.json();
        setAnalysisError(err.error || 'Failed to generate wellness analysis.');
      }
    } catch (e) {
      setAnalysisError('Network error while analyzing patient interactions.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const runAutoAnalysisForAll = useCallback(async () => {
    const currentPatients = patientsRef.current;
    if (!currentPatients.length || !accessToken) return;
    setAutoScanRunning(true);
    const results: Record<string, any> = {};
    const critical: any[] = [];

    await Promise.allSettled(
      currentPatients.map(async (patient) => {
        try {
          const res = await fetch(`${API_URL}/api/auth/therapist/patients/${patient.id}/analysis/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            results[patient.id] = data;
            if (
              data.overall_condition === 'Critical' ||
              data.risk_level === 'High'
            ) {
              critical.push({ ...patient, aiAnalysis: data });
            }
          }
        } catch (_) {}
      })
    );

    setAutoAnalysisResults((prev) => ({ ...prev, ...results }));
    setCriticalPatients(critical);
    setLastAutoScanTime(new Date());
    setAutoScanRunning(false);

    setNextScanCountdown(AUTO_SCAN_INTERVAL_MS / 1000);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setNextScanCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
    }, 1000);
  }, [accessToken, AUTO_SCAN_INTERVAL_MS]);

  useEffect(() => {
    patientsRef.current = patients;
  }, [patients]);

  useEffect(() => {
    if (!patients.length) return;
    runAutoAnalysisForAll();
    autoScanIntervalRef.current = setInterval(runAutoAnalysisForAll, AUTO_SCAN_INTERVAL_MS);
    return () => {
      if (autoScanIntervalRef.current) clearInterval(autoScanIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [patients.length > 0, runAutoAnalysisForAll]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    fetchPsychologistData();
  }, [accessToken]);

  const fetchPsychologistData = async () => {
    setLoading(true);
    try {
      const resPatients = await fetch(`${API_URL}/api/auth/therapist/patients/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resPatients.ok) {
        const pData = await resPatients.json();
        setPatients(Array.isArray(pData) ? pData : []);
      }

      const resSchedule = await fetch(`${API_URL}/api/auth/therapist/schedule/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resSchedule.ok) {
        const sData = await resSchedule.json();
        setSchedule(Array.isArray(sData) ? sData : []);
      }
    } catch (e) {
      console.error('Failed to fetch psychologist data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPatientDrawer = (patient: any) => {
    setSelectedPatient(patient);
    setCareNoteInput(patient.care_notes || '');
    setDiagnosisInput(patient.diagnosis || '');
    
    // Determine initial mode of approach from patient or leave blank for doctor to choose
    const existingModeName = patient.mode_of_approach || patient.treatment_plan?.title || '';
    const foundMode = MODES_OF_APPROACH.find(m => 
      m.name.toLowerCase() === existingModeName.toLowerCase() ||
      m.shortName.toLowerCase() === existingModeName.toLowerCase() ||
      (existingModeName && existingModeName.toLowerCase().includes(m.shortName.toLowerCase()))
    );

    if (foundMode) {
      setSelectedModeId(foundMode.id);
      setTreatmentTitle(foundMode.name);
    } else if (existingModeName) {
      setSelectedModeId('custom');
      setTreatmentTitle(existingModeName);
    } else {
      setSelectedModeId('');
      setTreatmentTitle('');
    }

    setGoalsInput(patient.wellness_goals || []);
    setExercisesInput(patient.assigned_exercises || []);
    setMedicationInput(patient.prescribed_medications?.[0] || '');
    setTreatmentSaved(false);
  };

  const handleSelectMode = (mode: ModeOfApproach) => {
    setSelectedModeId(mode.id);
    setTreatmentTitle(mode.name);
    setGoalsInput(mode.defaultGoals);
    setExercisesInput(mode.defaultExercises);
  };

  const handleSaveTreatmentPlan = async () => {
    if (!selectedPatient) return;
    setTreatmentSubmitting(true);

    const activeMode = MODES_OF_APPROACH.find(m => m.id === selectedModeId);
    const finalModeName = activeMode ? activeMode.name : (treatmentTitle.trim() || 'General Supportive Care');

    try {
      if (accessToken) {
        const res = await fetch(`${API_URL}/api/auth/treatment-plans/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            client_id: selectedPatient.id,
            mode_of_approach: finalModeName,
            title: finalModeName,
            diagnosis: diagnosisInput.trim(),
            primary_goals: goalsInput,
            assigned_exercises: exercisesInput,
            prescribed_medications: medicationInput.trim() ? [medicationInput.trim()] : [],
            care_notes: careNoteInput.trim(),
          }),
        });

        if (res.ok) {
          // Optimistically update patient in state
          setPatients(prev => prev.map(p => {
            if (p.id === selectedPatient.id) {
              return {
                ...p,
                mode_of_approach: finalModeName,
                diagnosis: diagnosisInput.trim(),
                care_notes: careNoteInput.trim(),
                assigned_exercises: exercisesInput,
                wellness_goals: goalsInput,
                prescribed_medications: medicationInput.trim() ? [medicationInput.trim()] : [],
              };
            }
            return p;
          }));

          setTreatmentSaved(true);
          setNotice(`✔ Treatment Plan and Mode of Approach saved successfully!`);
          setTimeout(() => {
            setTreatmentSaved(false);
            setNotice('');
          }, 4500);
        }
      }
    } catch (e) {
      console.error('Error saving treatment plan:', e);
      setNotice('⚠ Failed to save treatment plan to server.');
    } finally {
      setTreatmentSubmitting(false);
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, newStatus: string) => {
    setSchedule(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    try {
      const res = await fetch(`${API_URL}/api/auth/therapist/schedule/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setNotice(`✔ Appointment status updated to ${newStatus}.`);
      } else {
        setSchedule(prev => prev.map(item => item.id === id ? { ...item, status: item.status } : item));
        const err = await res.json().catch(() => ({}));
        setNotice(`⚠ Failed to update appointment: ${err.error || 'Server error.'}`);
      }
    } catch {
      setSchedule(prev => prev.map(item => item.id === id ? { ...item, status: item.status } : item));
      setNotice('⚠ Network error — appointment status was not saved.');
    }
    setTimeout(() => setNotice(''), 4000);
  };

  const handleExportProgressReport = (patient: any) => {
    const activeMode = MODES_OF_APPROACH.find(m => m.id === selectedModeId);
    const finalModeName = activeMode ? activeMode.name : (treatmentTitle.trim() || 'General Supportive Care');
    setNotice(`Generating clinical progress report for ${patient.full_name}...`);
    setTimeout(() => {
      const blob = new Blob(
        [
          `MANMITRA PSYCHOLOGICAL PROGRESS & TREATMENT REPORT\n` +
          `=====================================================\n` +
          `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n` +
          `Psychologist: ${psychologistName}\n` +
          `Patient: ${patient.full_name} (${patient.email})\n` +
          `Occupation: ${patient.occupation || 'Not Specified'}\n\n` +
          `MODE OF THERAPEUTIC APPROACH:\n` +
          `-------------------------------\n` +
          `Modality: ${finalModeName}\n\n` +
          `CLINICAL DIAGNOSIS / FOCUS:\n` +
          `${diagnosisInput || 'Not specified'}\n\n` +
          `SESSION PROGRESS NOTES:\n` +
          `${careNoteInput || 'No session notes recorded yet.'}\n\n` +
          `PRESCRIBED MEDICATION / RECOMMENDATIONS:\n` +
          `${medicationInput || 'None prescribed.'}\n`
        ],
        { type: 'text/plain' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `treatment_report_${patient.full_name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.txt`;
      a.click();
      setNotice('✔ Progress & Treatment Report downloaded successfully.');
      setTimeout(() => setNotice(''), 4000);
    }, 800);
  };

  // Filtered patients by mode of approach and search query
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const pMode = (p.mode_of_approach || '').toLowerCase();
      const matchesMode = modeFilter === 'all' || pMode.includes(modeFilter.toLowerCase());
      const matchesSearch = !searchQuery || 
        p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pMode.includes(searchQuery.toLowerCase());
      return matchesMode && matchesSearch;
    });
  }, [patients, modeFilter, searchQuery]);

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Psychologist Header Bar */}
      <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0284c7]/10 text-[#0284c7] border border-sky-200 flex items-center justify-center font-bold text-xl font-outfit">
            {psychologistName.replace('Dr. ', '').charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold font-outfit text-slate-900">{psychologistName}</h2>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                dutyStatus === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                dutyStatus === 'In Session' ? 'bg-sky-50 text-[#0284c7] border-sky-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                ● {dutyStatus}
              </span>
              {autoScanRunning ? (
                <span className="flex items-center gap-1.5 text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
                  <Brain className="w-3 h-3 animate-pulse" /> AI Scanning All Patients…
                </span>
              ) : lastAutoScanTime ? (
                <span className="flex items-center gap-1.5 text-[10px] bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold">
                  <Timer className="w-3 h-3" />
                  Next AI scan in {nextScanCountdown !== null ? formatCountdown(nextScanCountdown) : '--:--'}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Clinical Psychologist Workspace • Patient Treatment & Modes of Approach</p>
          </div>
        </div>

        {/* Duty Status Controls */}
        <div className="flex items-center gap-2 p-1 bg-sky-50 rounded-2xl border border-sky-100 text-xs">
          {(['Available', 'In Session', 'Off Duty'] as const).map(status => (
            <button
              key={status}
              onClick={() => setDutyStatus(status)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                dutyStatus === status ? 'bg-white text-[#0284c7] shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </motion.div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('patients')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'patients' ? 'bg-[#0284c7] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Patients & Treatment Plans ({patients.length})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'schedule' ? 'bg-[#0284c7] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Session Schedule ({schedule.length})
          </button>
          <button
            onClick={() => setActiveTab('crisis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'crisis' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-red-600 hover:bg-red-50 border border-red-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Immediate Care Alerts
            {criticalPatients.length > 0 && (
              <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                activeTab === 'crisis' ? 'bg-white text-red-600' : 'bg-red-600 text-white'
              }`}>
                {criticalPatients.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Assigned Patients & Mode of Approach Roster */}
      {activeTab === 'patients' && (
        <div className="space-y-4">
          {/* Mode of Approach Filter & Search Bar */}
          <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
              <span className="text-slate-400 font-bold text-[11px] uppercase mr-1 flex items-center gap-1 shrink-0">
                <Target className="w-3.5 h-3.5 text-[#0284c7]" /> Filter Approach:
              </span>
              <button
                onClick={() => setModeFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  modeFilter === 'all' ? 'bg-[#0284c7] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Approaches ({patients.length})
              </button>
              {MODES_OF_APPROACH.map(m => (
                <button
                  key={m.id}
                  onClick={() => setModeFilter(m.shortName)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-[11px] ${
                    modeFilter.toLowerCase() === m.shortName.toLowerCase()
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-[#0284c7] border border-slate-200/60'
                  }`}
                >
                  {m.shortName}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search patient name, email, mode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0284c7] focus:bg-white"
              />
            </div>
          </div>

          {/* Patients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map(p => {
              const currentModeStr = p.mode_of_approach || 'Cognitive Behavioral Therapy (CBT)';
              const matchedMode = MODES_OF_APPROACH.find(m => 
                m.name.toLowerCase() === currentModeStr.toLowerCase() ||
                m.shortName.toLowerCase() === currentModeStr.toLowerCase() ||
                currentModeStr.toLowerCase().includes(m.shortName.toLowerCase())
              ) || MODES_OF_APPROACH[0];

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4 flex flex-col justify-between hover:border-sky-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-outfit">{p.full_name}</h3>
                        <p className="text-[11px] text-slate-500">{p.email}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        p.stress_level >= 7 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        Stress: {p.stress_level}/10
                      </span>
                    </div>

                    {/* Mode of Approach Card Badge */}
                    <div className={`p-3 rounded-2xl border ${matchedMode.bgLight} ${matchedMode.borderColor} space-y-1`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Target className="w-3 h-3 text-[#0284c7]" /> Mode of Approach
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${matchedMode.badgeColor}`}>
                          {matchedMode.shortName}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{matchedMode.name}</h4>
                      <p className="text-[11px] text-slate-600 line-clamp-1">{matchedMode.tagline}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Recent Mood Trend</span>
                        <span className="text-slate-500 font-medium">{p.total_journals_logged || 0} Journals</span>
                      </div>
                      <div className="h-14 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={p.mood_history || []}>
                            <Line type="monotone" dataKey="score" stroke="#0284c7" strokeWidth={2.5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                      <span className="font-bold text-slate-700 block">Session Notes & Diagnosis</span>
                      <p className="text-slate-500 line-clamp-2">{p.care_notes || p.diagnosis || 'Active patient engagement.'}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      onClick={() => handleFetchAIAnalysis(p)}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Brain className="w-3.5 h-3.5" /> AI Condition Analysis
                    </button>
                    <button
                      onClick={() => handleOpenPatientDrawer(p)}
                      className="w-full py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284c7] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-sky-200"
                    >
                      <Target className="w-3.5 h-3.5" /> Configure Treatment & Mode
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredPatients.length === 0 && (
            <div className="p-12 text-center glass-panel rounded-3xl bg-white border border-sky-100 space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Patients Found</h4>
              <p className="text-xs text-slate-500">No patients matched the selected Mode of Approach filter or search query.</p>
              <button
                onClick={() => { setModeFilter('all'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-sky-50 text-[#0284c7] text-xs font-bold mt-2 cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Consultation Schedule */}
      {activeTab === 'schedule' && (
        <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 font-outfit">Today's Appointment Schedule</h3>
          <div className="space-y-3">
            {schedule.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Clock className="w-4 h-4 text-[#0284c7]" /> {item.time_slot}
                  </div>
                  <div className="text-xs text-[#475569] font-medium">Patient: {item.client_name} ({item.client_email})</div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    <span className="text-indigo-600 font-bold">Approach: {item.session_type}</span> • {item.meeting_type}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    item.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-[#0284c7]'
                  }`}>
                    {item.status}
                  </span>
                  {item.status !== 'Completed' && (
                    <button
                      onClick={() => handleUpdateAppointmentStatus(item.id, 'Completed')}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateAppointmentStatus(item.id, 'Cancelled')}
                    className="px-3 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Crisis Management Alerts */}
      {activeTab === 'crisis' && (
        <div className="glass-panel p-6 rounded-3xl bg-white border border-red-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base">
              <ShieldAlert className="w-5 h-5" /> Urgent Safety & Crisis Alerts Protocol
            </div>
            <div className="flex items-center gap-2">
              {autoScanRunning && (
                <span className="flex items-center gap-1.5 text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
                  <Brain className="w-3 h-3 animate-pulse" /> AI Scanning…
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[10px] bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Live Safety Monitoring
              </span>
            </div>
          </div>

          {lastAutoScanTime && (
            <p className="text-[11px] text-slate-400 -mt-4">
              Last AI scan: {lastAutoScanTime.toLocaleTimeString()} •{' '}
              {nextScanCountdown !== null ? `Next in ${formatCountdown(nextScanCountdown)}` : ''}
            </p>
          )}

          {/* Section 1: AI-Detected Critical Patients */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-800">AI-Detected Critical Conditions</h4>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                Auto-scanned every 10 min
              </span>
            </div>
            <p className="text-xs text-slate-500">Patients flagged Critical or High-Risk by the latest AI wellness analysis.</p>

            {criticalPatients.length > 0 ? (
              <div className="space-y-3">
                {criticalPatients.map((patient) => {
                  const ai = patient.aiAnalysis;
                  return (
                    <motion.div
                      key={`ai-${patient.id}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-red-50 border border-purple-200 space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Brain className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-bold text-slate-900">{patient.full_name}</span>
                          <span className="text-[10px] text-slate-500">{patient.email}</span>
                          {ai?.overall_condition && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              ai.overall_condition === 'Critical'
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}>
                              ● {ai.overall_condition}
                            </span>
                          )}
                          {ai?.risk_level && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ai.risk_level === 'High' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                            }`}>
                              {ai.risk_level} Risk
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">
                          AI Flagged
                        </span>
                      </div>

                      {ai?.detailed_summary && (
                        <p className="text-xs text-slate-700 leading-relaxed bg-white/70 rounded-xl p-3 border border-purple-100">
                          {ai.detailed_summary}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => setNotice(`Initiating priority call to ${patient.full_name}...`)}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call Patient
                        </button>
                        <button
                          onClick={() => handleFetchAIAnalysis(patient)}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Brain className="w-3.5 h-3.5" /> Full Analysis
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl border border-slate-100">
                No critical conditions detected in latest AI scan. All patients evaluated as stable.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Patient Treatment Plan & Mode of Approach Drawer Overlay ── */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left"
          >
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div>
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">CLINICAL WORKSPACE</span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-outfit mt-0.5">{selectedPatient.full_name}</h3>
              <p className="text-xs text-slate-500">{selectedPatient.email} • {selectedPatient.occupation || 'Community Member'}</p>
            </div>

            {treatmentSaved && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Treatment plan & mode of approach successfully saved!</span>
              </motion.div>
            )}

            <div className="space-y-3.5 border-t border-slate-100 pt-3">
              {/* 1. Run AI Wellness Analysis */}
              <button
                type="button"
                onClick={() => handleFetchAIAnalysis(selectedPatient)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Brain className="w-4 h-4" /> Run AI Wellness Analysis
              </button>

              {/* 2. Mode of Approach (Therapeutic Modality) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#0284c7]" /> Mode of Approach (Therapeutic Modality)
                  </label>
                  {treatmentTitle && (
                    <span className="text-[10px] text-sky-600 font-semibold truncate max-w-[200px]">
                      Selected: {treatmentTitle}
                    </span>
                  )}
                </div>
                
                <select
                  value={selectedModeId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedModeId(val);
                    if (val === 'custom') {
                      setTreatmentTitle('');
                    } else {
                      const m = MODES_OF_APPROACH.find(item => item.id === val);
                      if (m) {
                        setTreatmentTitle(m.name);
                        setGoalsInput(m.defaultGoals);
                        setExercisesInput(m.defaultExercises);
                      }
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-[#0284c7] focus:bg-white text-slate-900 font-semibold"
                >
                  <option value="">-- Select Mode of Approach --</option>
                  {MODES_OF_APPROACH.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.tagline}
                    </option>
                  ))}
                  <option value="custom">✦ Custom / Write Other Mode of Approach</option>
                </select>

                {(selectedModeId === 'custom' || (!MODES_OF_APPROACH.some(m => m.id === selectedModeId) && treatmentTitle)) && (
                  <input
                    type="text"
                    value={treatmentTitle}
                    onChange={(e) => setTreatmentTitle(e.target.value)}
                    placeholder="Type custom mode of approach (e.g. Somatic Experiencing, Schema Therapy, Gestalt)..."
                    className="w-full p-2.5 rounded-xl border border-sky-300 text-xs bg-sky-50/40 focus:outline-none focus:border-[#0284c7] focus:bg-white text-slate-900 font-medium mt-1"
                  />
                )}
              </div>

              {/* 3. Clinical Diagnosis */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  value={diagnosisInput}
                  onChange={(e) => setDiagnosisInput(e.target.value)}
                  placeholder="Enter clinical diagnosis / primary focus..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-[#0284c7] focus:bg-white text-slate-900"
                />
              </div>

              {/* 4. Session Progress Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Session Progress Notes</label>
                <textarea
                  rows={3}
                  value={careNoteInput}
                  onChange={(e) => setCareNoteInput(e.target.value)}
                  placeholder="Write session progress notes, clinical observations, or care directives..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-[#0284c7] focus:bg-white text-slate-900"
                />
              </div>

              {/* 5. Prescribe Medication */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Prescribe Medication</label>
                <input
                  type="text"
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  placeholder="Enter prescribed medications or lifestyle recommendations (optional)..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-[#0284c7] focus:bg-white text-slate-900"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex gap-2 justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleExportProgressReport(selectedPatient)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Report
                </button>
                <button
                  type="button"
                  disabled={treatmentSubmitting}
                  onClick={handleSaveTreatmentPlan}
                  className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> {treatmentSubmitting ? 'Saving...' : 'Save Treatment Plan'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Wellness Analysis Modal */}
      {analysisModalOpen && analyzingPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left"
          >
            <button
              onClick={() => setAnalysisModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-outfit text-slate-900">
                  AI Condition Analysis — {analyzingPatient.full_name}
                </h3>
                <p className="text-xs text-slate-500">{analyzingPatient.email}</p>
              </div>
            </div>

            {analysisLoading && (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-600 font-semibold">Generating AI psychological telemetry & risk evaluation...</p>
              </div>
            )}

            {analysisError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {analysisError}
              </div>
            )}

            {analysisData && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-center">
                    <span className="text-[10px] text-purple-700 font-bold uppercase">Condition</span>
                    <div className="text-sm font-extrabold text-purple-900 mt-0.5">{analysisData.overall_condition}</div>
                  </div>
                  <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-center">
                    <span className="text-[10px] text-sky-700 font-bold uppercase">Risk Level</span>
                    <div className="text-sm font-extrabold text-sky-900 mt-0.5">{analysisData.risk_level}</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">Engagement</span>
                    <div className="text-sm font-extrabold text-emerald-900 mt-0.5">{analysisData.engagement_score || 'High'}</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-slate-800">Comprehensive Clinical Summary</h5>
                  <p className="text-slate-700 leading-relaxed">{analysisData.detailed_summary}</p>
                </div>

                {analysisData.key_concerns && (
                  <div className="p-4 bg-red-50/60 rounded-2xl border border-red-100 space-y-1.5">
                    <h5 className="font-bold text-red-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Key Clinical Concerns
                    </h5>
                    <ul className="space-y-1 text-slate-700">
                      {analysisData.key_concerns.map((c: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-red-500 font-bold">•</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisData.recommended_actions && (
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1.5">
                    <h5 className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Recommended Action Steps
                    </h5>
                    <ul className="space-y-1 text-slate-700">
                      {analysisData.recommended_actions.map((a: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">{i + 1}.</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setAnalysisModalOpen(false);
                      handleOpenPatientDrawer(analyzingPatient);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5" /> Apply to Treatment Plan
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
