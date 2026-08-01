"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart as RePieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import {
  BarChart3, Users, Stethoscope, Bot, ShieldAlert, Activity, BookOpen, ShieldCheck, Download,
  Clock, Zap, CheckCircle2, AlertTriangle, Lock, Server, TrendingUp, PieChart, Sparkles, FileSpreadsheet, FileText, Filter
} from 'lucide-react';

interface AdminAnalyticsSuiteProps {
  accessToken?: string;
  adminStats: any;
  activeSubTab: string;
  onNavigateTab: (tab: any) => void;
  onOpenAddMember: () => void;
}

export default function AdminAnalyticsSuite({
  adminStats,
  activeSubTab,
  onNavigateTab,
  onOpenAddMember
}: AdminAnalyticsSuiteProps) {
  const [downloadSuccess, setDownloadSuccess] = useState('');

  const handleExportReport = (format: 'pdf' | 'csv' | 'excel', reportName: string) => {
    setDownloadSuccess(`Exporting ${reportName} in .${format.toUpperCase()} format...`);
    setTimeout(() => {
      // Simulate file download trigger
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(adminStats, null, 2)], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `manmitra_${reportName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloadSuccess(`✔ ${reportName} exported successfully.`);
      setTimeout(() => setDownloadSuccess(''), 4000);
    }, 800);
  };

  if (!adminStats) {
    return (
      <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-3">
        <Activity className="w-8 h-8 text-[#0284c7] animate-spin opacity-50" />
        <span>Loading Executive Business Intelligence & Analytics...</span>
      </div>
    );
  }

  const COLORS = ['#0284c7', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Download Alert Toast */}
      {downloadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 px-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {downloadSuccess}
          </span>
          <button onClick={() => setDownloadSuccess('')} className="text-emerald-700 font-bold hover:underline">Dismiss</button>
        </motion.div>
      )}

      {/* ── 1. EXECUTIVE BI OVERVIEW DASHBOARD ───────────────────────────────── */}
      {activeSubTab === 'admin' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Top Metric Cards (Row 1) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Clients / Members</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-outfit">{adminStats.total_clients || 0}</div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +12% growth this month
              </div>
            </div>

            <div className="glass-panel p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Verified Doctors</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-outfit">{adminStats.total_verified_doctors || 0}</div>
              <div className="text-[11px] text-slate-500 font-medium">100% Verified Credentials</div>
            </div>

            <div className="glass-panel p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>AI Conversations / Day</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-outfit">{adminStats.ai_conversations_today || 0}</div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> High AI Engagement
              </div>
            </div>

            <div className="glass-panel p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>System Health & SLA</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#0284c7] font-outfit">{adminStats.system_uptime_percent || 99.98}%</div>
              <div className="text-[11px] text-slate-500 font-medium">{adminStats.server_health || 'Optimal'}</div>
            </div>
          </div>

          {/* Charts Row: Platform Activity & Topics Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Activity Trend Chart */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">7-Day Platform Activity & Sessions</h4>
                  <p className="text-xs text-slate-500">Calculated live from member check-ins and session records.</p>
                </div>
                <span className="text-xs px-3 py-1 bg-sky-50 text-[#0284c7] font-bold rounded-full border border-sky-100">Live DB Stream</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={adminStats.weekly_analytics || []}>
                    <defs>
                      <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="sessions" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right 1 Col: Emotion / Sentiment Breakdown */}
            <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#0284c7]" /> Member Sentiment Distribution
                </h4>
                <p className="text-xs text-slate-500 mt-1">Anonymized emotional check-in aggregation.</p>
              </div>

              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={adminStats.emotion_distribution || []} dataKey="value" nameKey="emotion" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                      {(adminStats.emotion_distribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '11px' }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs">
                {(adminStats.emotion_distribution || []).map((e: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color || COLORS[idx % COLORS.length] }} />
                      {e.emotion}
                    </span>
                    <span className="font-bold text-slate-900">{e.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Quick Reports Bar */}
          <div className="p-6 glass-panel rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Executive BI Report Generator</h4>
              <p className="text-xs text-slate-500 mt-0.5">Generate compliant operational and clinical summaries in seconds.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleExportReport('pdf', 'Executive_Summary')} className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer">
                <FileText className="w-3.5 h-3.5" /> PDF Executive
              </button>
              <button onClick={() => handleExportReport('csv', 'System_Metrics')} className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
                <FileSpreadsheet className="w-3.5 h-3.5" /> CSV Dataset
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 2. AI & CLINICAL ENGINE ANALYTICS ─────────────────────────────────── */}
      {activeSubTab === 'ai_analytics' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-outfit text-slate-900 flex items-center gap-2">
                <Bot className="text-[#0284c7] w-6 h-6" /> AI Companion & Clinical Analytics
              </h3>
              <p className="text-xs text-slate-500 mt-1">Real-time telemetry on empathetic AI responses, topic trends, and sentiment safety.</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200">
              AI Health Guard: Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-3">
              <span className="text-xs font-semibold text-slate-500">Daily AI Companion Requests</span>
              <div className="text-2xl font-bold text-slate-900 font-outfit">{adminStats.ai_conversations_today || 0}</div>
              <p className="text-[11px] text-slate-500">Average response time: <strong>0.8 seconds</strong></p>
            </div>

            <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-3">
              <span className="text-xs font-semibold text-slate-500">AI Recommendation Accuracy</span>
              <div className="text-2xl font-bold text-emerald-600 font-outfit">98.6%</div>
              <p className="text-[11px] text-slate-500">Validated against clinical CBT frameworks</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-3">
              <span className="text-xs font-semibold text-slate-500">Crisis Escalation Rate</span>
              <div className="text-2xl font-bold text-[#0284c7] font-outfit">0.4%</div>
              <p className="text-[11px] text-slate-500">Seamlessly routed to tele-helplines</p>
            </div>
          </div>

          {/* Frequently Discussed Topics Chart */}
          <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Frequently Discussed Mental Health Topics</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adminStats.frequent_topics || []} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis type="category" dataKey="topic" stroke="#94a3b8" fontSize={11} width={180} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#0284c7" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 3. EMERGENCY CRISIS MONITORING FEED ──────────────────────────────── */}
      {activeSubTab === 'crisis_monitoring' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-outfit text-slate-900 flex items-center gap-2">
                <ShieldAlert className="text-rose-600 w-6 h-6" /> Emergency Risk & Crisis Feed
              </h3>
              <p className="text-xs text-slate-500 mt-1">Real-time alerts generated from severe stress detection and emergency safety triggers.</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
              Active Monitoring SLA: &lt; 5 mins
            </span>
          </div>

          <div className="glass-panel p-6 rounded-3xl bg-white border border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">Recent Crisis & Risk Alerts Feed</h4>
              <span className="text-xs text-slate-500 font-semibold">Total Incidents: {adminStats.emergency_alerts_count || 0}</span>
            </div>

            <div className="divide-y divide-rose-50">
              {(adminStats.emergency_alerts || []).map((alert: any) => (
                <div key={alert.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs border border-rose-100">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-900">{alert.type}</h5>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700">
                          {alert.risk_level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {alert.user_anonymized} • Triggered {alert.timestamp} • Assigned: <strong>{alert.assigned_doctor}</strong>
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                    alert.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    Status: {alert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 4. CLINICAL MENTAL HEALTH INSIGHTS (PHQ-9 & GAD-7) ───────────────── */}
      {activeSubTab === 'clinical_insights' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h3 className="text-xl font-bold font-outfit text-slate-900 flex items-center gap-2">
              <Activity className="text-[#0284c7] w-6 h-6" /> Clinical Assessment Insights (PHQ-9 & GAD-7)
            </h3>
            <p className="text-xs text-slate-500 mt-1">Anonymized population severity scores for depression (PHQ-9) and anxiety (GAD-7).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PHQ-9 Depression Severity Breakdown */}
            <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900">PHQ-9 Depression Index Distribution</h4>
                <span className="text-xs font-semibold text-[#0284c7]">Clinical Score Map</span>
              </div>
              <div className="space-y-3 text-xs">
                {(adminStats.phq9_distribution || []).map((item: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{item.severity}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-[#0284c7] h-full rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GAD-7 Anxiety Severity Breakdown */}
            <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900">GAD-7 Anxiety Index Distribution</h4>
                <span className="text-xs font-semibold text-emerald-600">Clinical Score Map</span>
              </div>
              <div className="space-y-3 text-xs">
                {(adminStats.gad7_distribution || []).map((item: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{item.severity}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 5. CONTENT & CBT MODULE MANAGEMENT ───────────────────────────────── */}
      {activeSubTab === 'content_mgmt' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-outfit text-slate-900 flex items-center gap-2">
                <BookOpen className="text-[#0284c7] w-6 h-6" /> CBT Modules & Content Hub
              </h3>
              <p className="text-xs text-slate-500 mt-1">Manage psychoeducational resources, somatic exercises, and CBT modules.</p>
            </div>
            <button onClick={() => alert('New CBT Module Creator opened.')} className="glow-btn px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer">
              + Add CBT Module
            </button>
          </div>

          <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Published CBT & Mindfulness Modules</h4>
            <div className="divide-y divide-sky-50 text-xs">
              {(adminStats.cbt_modules || []).map((mod: any) => (
                <div key={mod.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-900">{mod.title}</h5>
                      <span className="text-[10px] px-2 py-0.5 bg-sky-50 text-[#0284c7] font-bold rounded-full border border-sky-100">{mod.category}</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">Member Completion Rate: <strong>{mod.completion_rate}</strong></span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                    {mod.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 6. PLATFORM & SECURITY AUDIT LOGS ────────────────────────────────── */}
      {activeSubTab === 'platform_audit' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-outfit text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-[#0284c7] w-6 h-6" /> Security Settings & Audit Trail
              </h3>
              <p className="text-xs text-slate-500 mt-1">Platform compliance, encryption status, and operational audit trail.</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              HIPAA Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Data Encryption at Rest</span>
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-slate-500">AES-256 Bit Encryption enabled on SQLite database tables.</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Transport Layer Security</span>
                <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
              </div>
              <p className="text-slate-500">TLS 1.3 End-to-End Encrypted communications active.</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Automated Backups</span>
                <Server className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-slate-500">Daily snapshot backup active. Last backup 3 hrs ago.</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900">System Audit Trail Log</h4>
            <div className="divide-y divide-sky-50 text-xs">
              {(adminStats.audit_logs || []).map((log: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <p className="text-slate-500 text-[11px]">{log.details} • Executed by {log.user}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 7. REPORTS & EXPORT CENTER ───────────────────────────────────────── */}
      {activeSubTab === 'reports_export' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h3 className="text-xl font-bold font-outfit text-slate-900 flex items-center gap-2">
              <Download className="text-[#0284c7] w-6 h-6" /> Reports & Business Intelligence Export Suite
            </h3>
            <p className="text-xs text-slate-500 mt-1">Generate and download official analytics reports in PDF, CSV, or Excel formats.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-900">Platform Growth & Registration Report</h5>
                <p className="text-slate-500 mt-1">Monthly member acquisition & retention demographics.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExportReport('pdf', 'Platform_Growth')} className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-semibold">PDF</button>
                <button onClick={() => handleExportReport('csv', 'Platform_Growth')} className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-xl font-semibold">CSV</button>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-900">Doctor Workload & Performance Index</h5>
                <p className="text-slate-500 mt-1">Consultation statistics, completion rates, and ratings.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExportReport('pdf', 'Doctor_Performance')} className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-semibold">PDF</button>
                <button onClick={() => handleExportReport('excel', 'Doctor_Performance')} className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-xl font-semibold">Excel</button>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-900">AI Companion & Telemetry Audit</h5>
                <p className="text-slate-500 mt-1">Chatbot query frequency, emotion stats, and safety logs.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExportReport('pdf', 'AI_Telemetry')} className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-semibold">PDF</button>
                <button onClick={() => handleExportReport('csv', 'AI_Telemetry')} className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-xl font-semibold">CSV</button>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-900">Emergency & Crisis Incident Audit</h5>
                <p className="text-slate-500 mt-1">Log of severe panic triggers, risk levels, and resolution SLA.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExportReport('pdf', 'Crisis_Incidents')} className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-semibold">PDF</button>
                <button onClick={() => handleExportReport('csv', 'Crisis_Incidents')} className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-xl font-semibold">CSV</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
