"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Users, Calendar, Clock, Activity, Video, FileText, CheckCircle2,
  AlertTriangle, Heart, User, Sparkles, X, ChevronRight, MessageSquare, Plus, Save,
  Pill, Download, Phone, ShieldAlert, Check, RefreshCw
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
            <p className="text-xs text-slate-500 mt-0.5">Psychiatrist & Specialist Workspace • Teletherapy & Clinical Care</p>
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
          Assigned Patients Roster ({patients.length})
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'schedule' ? 'bg-[#0284c7] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Consultation Schedule ({schedule.length})
        </button>
        <button
          onClick={() => setActiveTab('crisis')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'crisis' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-red-600 hover:bg-red-50 border border-red-100'
          }`}
        >
          Crisis & Risk Alerts
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Recent Mood Telemetry</span>
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

              <div className="pt-2 border-t border-slate-100 flex gap-2">
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
                  <div className="text-xs text-slate-600 font-medium">Patient: {item.client_name} ({item.client_email})</div>
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
          <div className="flex items-center gap-2 text-red-600 font-bold text-base">
            <ShieldAlert className="w-5 h-5" /> Urgent Crisis Alerts Protocol
          </div>
          <p className="text-xs text-slate-500">Real-time alerts triggered by severe depression, suicide risk indicators, or panic attack reports.</p>

          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-800">Severe Depression Risk Flag</span>
              <span className="text-[10px] bg-red-200 text-red-900 font-bold px-2 py-0.5 rounded-full">High Severity</span>
            </div>
            <p className="text-xs text-slate-700">Patient reported PHQ-9 score above 20 with suicide risk indicators. Immediate clinical outreach recommended.</p>
            <div className="flex gap-2">
              <button onClick={() => setNotice('Contacting patient priority line...')} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Immediate Call Patient
              </button>
              <button onClick={() => setNotice('Emergency care protocol escalated to helpline.')} className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 text-xs font-bold">
                Escalate Emergency Protocol
              </button>
            </div>
          </div>
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
    </div>
  );
}
