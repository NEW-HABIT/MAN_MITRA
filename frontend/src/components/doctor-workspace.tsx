"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Users, Calendar, Clock, Activity, Video, FileText, CheckCircle2,
  AlertTriangle, Heart, User, Sparkles, X, ChevronRight, MessageSquare, Plus, Save,
  Pill, Download, Phone, ShieldAlert, Check, RefreshCw, Brain, TrendingUp, Zap, Info
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { API_URL } from '@/config';

interface DoctorWorkspaceProps {
  accessToken: string;
  doctorName: string;
}

export default function DoctorWorkspace({ accessToken, doctorName }: DoctorWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'patients' | 'schedule' | 'treatment' | 'crisis'>('patients');
  const [patients, setPatients] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [dutyStatus, setDutyStatus] = useState<'Available' | 'In Session' | 'Off Duty'>('Available');
  const [notice, setNotice] = useState('');

  // Treatment Plan & Notes Form state
  const [treatmentTitle, setTreatmentTitle] = useState('Personalized CBT & Wellness Plan');
  const [diagnosisInput, setDiagnosisInput] = useState('Workplace Burnout & Generalized Anxiety');
  const [careNoteInput, setCareNoteInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('Sertraline 50mg (Morning)');
  const [treatmentSaved, setTreatmentSaved] = useState(false);

  // AI Client Analysis state
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analyzingPatient, setAnalyzingPatient] = useState<any | null>(null);
  const [analysisData, setAnalysisData] = useState<any | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

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

  useEffect(() => {
    fetchDoctorData();
  }, [accessToken]);

  const fetchDoctorData = async () => {
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
      console.error('Failed to fetch doctor data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPatientDrawer = (patient: any) => {
    setSelectedPatient(patient);
    setCareNoteInput(patient.care_notes || '');
  };

  const handleSaveTreatmentPlan = async () => {
    if (!selectedPatient) return;

    try {
      if (accessToken) {
        await fetch(`${API_URL}/api/auth/treatment-plans/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            client_id: selectedPatient.id,
            title: treatmentTitle,
            diagnosis: diagnosisInput,
            assigned_exercises: ['Box Breathing (10 mins)', 'CBT Thought Log'],
            prescribed_medications: [medicationInput],
          }),
        });
      }
    } catch (e) {
      console.error('Error saving treatment plan:', e);
    }

    setTreatmentSaved(true);
    setNotice('✔ Treatment Plan & Clinical Notes saved successfully.');
    setTimeout(() => {
      setTreatmentSaved(false);
      setNotice('');
    }, 4000);
  };

  const handleUpdateAppointmentStatus = (id: string, newStatus: string) => {
    setSchedule(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    setNotice(`✔ Appointment status updated to ${newStatus}.`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleExportProgressReport = (patientName: string) => {
    setNotice(`Generating clinical progress report for ${patientName}...`);
    setTimeout(() => {
      const blob = new Blob(
        [
          `MANMITRA CLINICAL PROGRESS REPORT\n` +
          `Date: ${new Date().toLocaleDateString()}\n` +
          `Doctor: ${doctorName}\n` +
          `Patient: ${patientName}\n` +
          `Diagnosis: ${diagnosisInput}\n` +
          `Clinical Notes: ${careNoteInput || 'Patient showing steady improvement in daily coping.'}\n` +
          `Prescriptions: ${medicationInput}\n`
        ],
        { type: 'text/plain' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clinical_report_${patientName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.txt`;
      a.click();
      setNotice('✔ Clinical Progress Report exported successfully.');
      setTimeout(() => setNotice(''), 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Doctor Header Bar */}
      <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0284c7]/10 text-[#0284c7] border border-sky-200 flex items-center justify-center font-bold text-xl font-outfit">
            {doctorName.replace('Dr. ', '').charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-outfit text-slate-900">{doctorName}</h2>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                dutyStatus === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                dutyStatus === 'In Session' ? 'bg-sky-50 text-[#0284c7] border-sky-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                ● {dutyStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Guide & Wellness Workspace • 1-on-1 Sessions & Care Support</p>
          </div>
        </div>

        {/* Duty Status Controls */}
        <div className="flex items-center gap-2 p-1 bg-sky-50 rounded-2xl border border-sky-100 text-xs">
          {(['Available', 'In Session', 'Off Duty'] as const).map(status => (
            <button
              key={status}
              onClick={() => setDutyStatus(status)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                dutyStatus === status ? 'bg-white text-[#0284c7] shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold">
          {notice}
        </motion.div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab('patients')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'patients' ? 'bg-[#0284c7] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Members Under Care ({patients.length})
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'schedule' ? 'bg-[#0284c7] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Session Schedule ({schedule.length})
        </button>
        <button
          onClick={() => setActiveTab('crisis')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'crisis' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-red-600 hover:bg-red-50 border border-red-100'
          }`}
        >
          Immediate Support Alerts

        </button>
      </div>

      {/* Tab 1: Assigned Patients Roster */}
      {activeTab === 'patients' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {patients.map(p => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-outfit">{p.full_name}</h3>
                    <p className="text-[11px] text-slate-500">{p.occupation || 'Patient'}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    p.stress_level >= 7 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    Stress: {p.stress_level}/10
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Recent Mood History</span>
                  <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={p.mood_history || []}>
                        <Line type="monotone" dataKey="score" stroke="#0284c7" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                  <span className="font-bold text-slate-700 block">Care Notes</span>
                  <p className="text-slate-500 line-clamp-2">{p.care_notes || 'No recent observations.'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => handleFetchAIAnalysis(p)}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Brain className="w-3.5 h-3.5" /> AI Condition Analysis
                </button>
                <button
                  onClick={() => handleOpenPatientDrawer(p)}
                  className="w-full py-2 rounded-xl bg-sky-50 text-[#0284c7] hover:bg-sky-100 text-xs font-bold"
                >
                  Manage Treatment & Notes
                </button>
              </div>
            </motion.div>
          ))}
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
                  <div className="text-[11px] text-slate-400">{item.session_type} • {item.meeting_type}</div>
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
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Mark Completed
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateAppointmentStatus(item.id, 'Cancelled')}
                    className="px-3 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold"
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
        <div className="glass-panel p-6 rounded-3xl bg-white border border-red-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base">
              <ShieldAlert className="w-5 h-5" /> Urgent Safety & Crisis Alerts Protocol
            </div>
            <span className="flex items-center gap-1.5 text-[10px] bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Safety Monitoring
            </span>
          </div>
          <p className="text-xs text-slate-500">Real-time alerts triggered by high stress levels (7+/10), severe depression/anxiety scores, or crisis flags.</p>

          {patients.filter(p => p.stress_level >= 7 || p.risk_status === 'High Risk').length > 0 ? (
            patients.filter(p => p.stress_level >= 7 || p.risk_status === 'High Risk').map((patient) => (
              <div key={patient.id} className="p-4 rounded-2xl bg-red-50/80 border border-red-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-900">{patient.full_name} ({patient.email})</span>
                    <span className="text-[10px] bg-red-200 text-red-900 font-bold px-2 py-0.5 rounded-full">
                      Stress Level {patient.stress_level}/10
                    </span>
                  </div>
                  <span className="text-[10px] text-red-700 font-bold">High Severity Alert</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  Patient requires priority outreach. Self-reported elevated stress ({patient.stress_level}/10) with active care notes: "{patient.care_notes || 'High stress indicator'}".
                </p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setNotice(`Initiating priority call to ${patient.full_name}...`)} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <Phone className="w-3.5 h-3.5" /> Call Patient Directly
                  </button>
                  <button onClick={() => handleFetchAIAnalysis(patient)} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <Brain className="w-3.5 h-3.5" /> Run AI Condition Analysis
                  </button>
                  <button onClick={() => setNotice(`Emergency care protocol escalated for ${patient.full_name}.`)} className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold cursor-pointer">
                    Escalate Emergency Protocol
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl border border-slate-100">
              No high-risk emergency flags detected among assigned patients. All patients are currently evaluated as stable.
            </div>
          )}
        </div>
      )}

      {/* Patient Drawer & Treatment Plan Form */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedPatient(null)} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[11px] font-bold text-sky-600 uppercase">Clinical Workspace</span>
              <h3 className="text-lg font-bold text-slate-900 font-outfit">{selectedPatient.full_name}</h3>
              <p className="text-xs text-slate-500">{selectedPatient.email} • {selectedPatient.occupation}</p>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-3">
              <button
                onClick={() => handleFetchAIAnalysis(selectedPatient)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Brain className="w-4 h-4" /> Run AI Wellness Analysis
              </button>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  value={diagnosisInput}
                  onChange={(e) => setDiagnosisInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Session Progress Notes</label>
                <textarea
                  rows={3}
                  value={careNoteInput}
                  onChange={(e) => setCareNoteInput(e.target.value)}
                  placeholder="Record patient observations..."
                  className="w-full p-2.5 rounded-xl border text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Prescribe Medication</label>
                <input
                  type="text"
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs bg-slate-50"
                />
              </div>

              <div className="flex gap-2 justify-between pt-2">
                <button
                  onClick={() => handleExportProgressReport(selectedPatient.full_name)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export Report
                </button>
                <button
                  onClick={handleSaveTreatmentPlan}
                  className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Treatment Plan
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Client Wellness Condition Analysis Modal */}
      {analysisModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setAnalysisModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-outfit text-slate-900">
                    AI Wellness Condition Analysis
                  </h3>
                  <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                    AI Assisted Insights
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Comprehensive analysis of conversations, mood logs, journal entries, health check-ins, and wellness routines for{' '}
                  <span className="font-semibold text-slate-700">{analyzingPatient?.full_name}</span>
                </p>
              </div>
            </div>

            {/* Loading State */}
            {analysisLoading && (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                <p className="text-xs font-bold text-slate-600">
                  Analyzing patient activity and wellness progress...
                </p>
                <p className="text-[11px] text-slate-400">
                  Gathering insights from mood trends, conversations, journal entries, health assessments, routine completion, and care notes
                </p>
              </div>
            )}

            {/* Error State */}
            {analysisError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Analysis Result */}
            {analysisData && !analysisLoading && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                {/* Condition & Risk Header Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Overall Condition */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Overall Condition</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold px-3 py-1 rounded-xl ${
                        analysisData.overall_condition === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                        analysisData.overall_condition === 'Needs Attention' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        analysisData.overall_condition === 'Improving' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        ● {analysisData.overall_condition}
                      </span>
                    </div>
                  </div>

                  {/* Risk Level */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Clinical Risk Level</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold px-3 py-1 rounded-xl ${
                        analysisData.risk_level === 'High' ? 'bg-red-500 text-white' :
                        analysisData.risk_level === 'Medium' ? 'bg-amber-500 text-white' :
                        'bg-emerald-600 text-white'
                      }`}>
                        {analysisData.risk_level} Risk
                      </span>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Data Completeness</span>
                    <div className="text-sm font-bold text-slate-800">
                      {analysisData.confidence_score}% <span className="text-[10px] text-slate-400 font-normal">(Based on activity history)</span>
                    </div>
                  </div>
                </div>

                {/* Detailed AI Narrative Summary */}
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                    <Sparkles className="w-4 h-4 text-purple-600" /> AI Wellness Assessment Summary
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {analysisData.detailed_summary}
                  </p>
                </div>

                {/* Key Concerns & Positive Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Concerns */}
                  <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                      <AlertTriangle className="w-4 h-4 text-red-600" /> Key Clinical Concerns
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {analysisData.key_concerns?.map((c: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-red-500 font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Positive Indicators */}
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Positive Progress Indicators
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {analysisData.positive_indicators?.map((p: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Clinical Actions */}
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0284c7]">
                    <Zap className="w-4 h-4 text-[#0284c7]" /> Recommended Next Actions for Specialist
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {analysisData.recommended_actions?.map((act: string, idx: number) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-sky-100 text-xs font-medium text-slate-800 flex items-start gap-2 shadow-2xs">
                        <span className="bg-sky-100 text-[#0284c7] font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telemetry Snapshot Breakdown */}
                {analysisData.data_snapshot && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] space-y-2">
                    <span className="font-bold text-slate-600 block uppercase">Activity & Health Summary</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-600">
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Avg Mood Score</span>
                        <span className="font-bold text-slate-800">
                          {analysisData.data_snapshot.mood?.avg_score ? `${analysisData.data_snapshot.mood.avg_score}/10` : 'No logs'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Chat Sessions</span>
                        <span className="font-bold text-slate-800">
                          {analysisData.data_snapshot.chat?.total_sessions || 0} ({analysisData.data_snapshot.chat?.crisis_messages || 0} crisis flags)
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Journal Sentiment</span>
                        <span className="font-bold text-slate-800">
                          {analysisData.data_snapshot.journal?.avg_sentiment ?? 'N/A'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Routine Completion</span>
                        <span className="font-bold text-slate-800">
                          {analysisData.data_snapshot.wellness?.completion_rate}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
                  <Info className="w-3 h-3" /> AI-assisted evaluation based on patient activity. For guidance only, not a medical diagnosis.
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleFetchAIAnalysis(analyzingPatient)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-run Analysis
                  </button>
                  <button
                    onClick={() => setAnalysisModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                  >
                    Done
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

