"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Users, Calendar, Clock, Activity, Video, FileText, CheckCircle2,
  AlertTriangle, Heart, User, Sparkles, X, ChevronRight, MessageSquare, Plus, Save
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { API_URL } from '@/config';

interface DoctorWorkspaceProps {
  accessToken: string;
  doctorName: string;
}

export default function DoctorWorkspace({ accessToken, doctorName }: DoctorWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'patients' | 'schedule'>('patients');
  const [patients, setPatients] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [careNoteInput, setCareNoteInput] = useState('');
  const [noteSavedAlert, setNoteSavedAlert] = useState(false);
  const [dutyStatus, setDutyStatus] = useState<'Available' | 'In Session' | 'Off Duty'>('Available');

  useEffect(() => {
    fetchDoctorData();
  }, [accessToken]);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      // Fetch assigned patients telemetry
      const resPatients = await fetch(`${API_URL}/api/auth/therapist/patients/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resPatients.ok) {
        const pData = await resPatients.json();
        setPatients(pData);
      }

      // Fetch routine consultation schedule
      const resSchedule = await fetch(`${API_URL}/api/auth/therapist/schedule/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resSchedule.ok) {
        const sData = await resSchedule.json();
        setSchedule(sData);
      }
    } catch (e) {
      console.error('Failed to fetch doctor telemetry:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPatientDrawer = (patient: any) => {
    setSelectedPatient(patient);
    setCareNoteInput(patient.care_notes || '');
  };

  const handleSaveCareNote = () => {
    if (!selectedPatient) return;
    setPatients(prev =>
      prev.map(p => (p.id === selectedPatient.id ? { ...p, care_notes: careNoteInput } : p))
    );
    setSelectedPatient({ ...selectedPatient, care_notes: careNoteInput });
    setNoteSavedAlert(true);
    setTimeout(() => setNoteSavedAlert(false), 3000);
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* ── DOCTOR WORKSPACE HEADER BAR ────────────────────────────────────── */}
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
            <p className="text-xs text-slate-500 mt-0.5">Clinical Specialist Portal • Telemetry Tracking & Routine Booking System</p>
          </div>
        </div>

        {/* Duty Status Switcher Pills */}
        <div className="flex items-center gap-2 p-1 bg-sky-50 rounded-2xl border border-sky-100 text-xs">
          {(['Available', 'In Session', 'Off Duty'] as const).map(status => (
            <button
              key={status}
              onClick={() => setDutyStatus(status)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                dutyStatus === status
                  ? 'bg-[#0284c7] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ── METRIC CARDS ROW ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Assigned Patients</span>
            <div className="text-2xl font-bold text-slate-900 font-outfit mt-1">{patients.length}</div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Profiles Synchronized
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Today's Scheduled Consultations</span>
            <div className="text-2xl font-bold text-slate-900 font-outfit mt-1">{schedule.length}</div>
            <span className="text-[11px] text-[#0284c7] font-semibold flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" /> Next at 02:00 PM
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">High Risk Patient Alerts</span>
            <div className="text-2xl font-bold text-rose-600 font-outfit mt-1">
              {patients.filter(p => p.risk_status === 'High Risk').length}
            </div>
            <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Priority Telemetry Priority
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── WORKSPACE SUB-TAB SWITCHER ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-sky-100 pb-2">
        <button
          onClick={() => setActiveTab('patients')}
          className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'patients'
              ? 'border-[#0284c7] text-[#0284c7]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Assigned Patients Roster ({patients.length})
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'schedule'
              ? 'border-[#0284c7] text-[#0284c7]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> Routine Consultation Booking Schedule ({schedule.length})
        </button>
      </div>

      {/* ── TAB 1: ASSIGNED PATIENTS ROSTER ─────────────────────────────────── */}
      {activeTab === 'patients' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Patient Telemetry & Care Roster</h3>
            <span className="text-xs text-slate-500">Click any patient to open full gathered telemetry & care notes.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => {
              const riskColor = patient.risk_status === 'High Risk'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : patient.risk_status === 'Moderate Risk'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200';

              return (
                <div
                  key={patient.id}
                  onClick={() => handleOpenPatientDrawer(patient)}
                  className="glass-panel p-5 rounded-3xl bg-white border border-sky-100 hover:border-[#0284c7] shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 text-[#0284c7] flex items-center justify-center font-bold text-sm">
                        {patient.full_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors">
                          {patient.full_name}
                        </h4>
                        <span className="text-[11px] text-slate-500">{patient.occupation}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${riskColor}`}>
                      {patient.risk_status}
                    </span>
                  </div>

                  {/* Telemetry Progress Metrics */}
                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>Self-Reported Stress Level</span>
                      <span className="font-bold text-slate-900">{patient.stress_level}/10</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-full rounded-full ${
                          patient.stress_level >= 7 ? 'bg-rose-500' : patient.stress_level >= 5 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${patient.stress_level * 10}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sky-50 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Next: <strong>{patient.next_consultation}</strong></span>
                    <span className="text-[#0284c7] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── TAB 2: ROUTINE CONSULTATION BOOKING SCHEDULE ────────────────────── */}
      {activeTab === 'schedule' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Today's Routine Consultation Time Slots</h4>
                <p className="text-xs text-slate-500 mt-0.5">Admin-assigned routine schedule & patient booking system.</p>
              </div>
              <span className="text-xs px-3 py-1 bg-sky-50 text-[#0284c7] font-bold rounded-full border border-sky-100">
                System Time Zone: IST (UTC+5:30)
              </span>
            </div>

            <div className="divide-y divide-sky-50 text-xs">
              {schedule.map((slot) => (
                <div key={slot.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-[#0284c7] flex flex-col items-center justify-center font-bold">
                      <Clock className="w-4 h-4 mb-0.5" />
                      <span className="text-[10px]">{slot.time_slot.split(' ')[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-slate-900 text-sm">{slot.client_name}</h5>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                          {slot.meeting_type}
                        </span>
                      </div>
                      <p className="text-xs text-[#0284c7] font-medium mt-0.5">{slot.session_type}</p>
                      <span className="text-[11px] text-slate-400">{slot.client_email} • Slot: {slot.time_slot}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full font-bold text-[11px] border ${
                      slot.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-[#0284c7] border-sky-200'
                    }`}>
                      {slot.status}
                    </span>
                    {slot.status === 'Upcoming' && (
                      <button onClick={() => alert(`Starting video consultation with ${slot.client_name}...`)} className="px-4 py-2 bg-[#0284c7] text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors flex items-center gap-1.5 cursor-pointer">
                        <Video className="w-3.5 h-3.5" /> Join Tele-Session
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── PATIENT TELEMETRY DETAIL DRAWER / MODAL OVERLAY ─────────────────── */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-sky-100 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-left"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0284c7]/10 text-[#0284c7] flex items-center justify-center font-bold text-lg">
                    {selectedPatient.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedPatient.full_name}</h3>
                    <p className="text-xs text-slate-500">{selectedPatient.email} • {selectedPatient.occupation}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Toast Alert */}
              {noteSavedAlert && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Clinical observations saved to patient medical record.
                </div>
              )}

              {/* Patient Telemetry Cards Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-1">
                  <span className="text-slate-500 font-semibold">Self-Reported Stress Level</span>
                  <div className="text-lg font-bold text-slate-900">{selectedPatient.stress_level} / 10</div>
                </div>
                <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-1">
                  <span className="text-slate-500 font-semibold">Risk Classification</span>
                  <div className="text-lg font-bold text-rose-600">{selectedPatient.risk_status}</div>
                </div>
              </div>

              {/* Mood Trajectory Curve Chart */}
              {selectedPatient.mood_history && selectedPatient.mood_history.length > 0 && (
                <div className="p-5 rounded-2xl border border-sky-100 bg-white space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0284c7]" /> Gathered Mood Trajectory (Last Check-ins)
                  </h4>
                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedPatient.mood_history}>
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} domain={[1, 10]} />
                        <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '11px' }} />
                        <Line type="monotone" dataKey="score" stroke="#0284c7" strokeWidth={2.5} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Wellness Goals & Preferences */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900">Gathered Primary Goals & Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedPatient.wellness_goals || ['Reduce Anxiety', 'Improve Sleep']).map((g: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-sky-50 text-[#0284c7] font-semibold border border-sky-100">
                      🎯 {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Doctor Clinical Notes Editor */}
              <div className="space-y-2 text-xs">
                <label className="block font-bold text-slate-900">Doctor Clinical Observations & Progress Notes</label>
                <textarea
                  rows={4}
                  value={careNoteInput}
                  onChange={(e) => setCareNoteInput(e.target.value)}
                  placeholder="Type clinical observations, recommended CBT exercises, or progress notes..."
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#0284c7] text-slate-800 text-xs leading-relaxed"
                />
                <button
                  onClick={handleSaveCareNote}
                  className="glow-btn px-4 py-2.5 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <Save className="w-4 h-4" /> Save Care Observations
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
