"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Heart, LayoutDashboard, MessageSquare, BookOpen, User, LogOut, ShieldCheck,
  TrendingUp, Award, BarChart3, Users, Zap, ShieldAlert, Sparkles, Check
} from 'lucide-react';

import WellnessChecklist from '@/components/wellness-checklist';
import MoodTracker from '@/components/mood-tracker';
import ChatPanel from '@/components/chat-panel';
import JournalPanel from '@/components/journal-panel';

export default function DashboardPage() {
  const router = useRouter();
  const { user, accessToken, logout, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'journal' | 'admin'>('dashboard');
  const [mounted, setMounted] = useState(false);
  
  // Mood Tracker modal triggers
  const [moodOpen, setMoodOpen] = useState(false);
  const [moodTrend, setMoodTrend] = useState<any[]>([]);
  const [streakStats, setStreakStats] = useState({ current: 0, longest: 0 });

  // Admin stats state
  const [adminStats, setAdminStats] = useState<any | null>(null);

  // Set mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if unauthenticated
  useEffect(() => {
    if (mounted && (!isAuthenticated || !user)) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router, mounted]);

  // Fetch user mood statistics
  const fetchMoodStats = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/mood/analytics/', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStreakStats({ current: data.current_streak || 0, longest: data.longest_streak || 0 });
        // Format trend_7d for Recharts
        if (data.trend_7d && Array.isArray(data.trend_7d)) {
          const chartData = data.trend_7d.map((pt: any) => ({
            name: new Date(pt.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
            score: pt.avg_score,
          }));
          setMoodTrend(chartData);
        } else {
          setMoodTrend([]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch admin stats if the active tab is admin
  const fetchAdminStats = async () => {
    if (!accessToken || user?.role !== 'admin') return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/admin/dashboard/', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAdminStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMoodStats();
  }, [accessToken]);

  useEffect(() => {
    if (activeTab === 'admin') {
      fetchAdminStats();
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!mounted || !user) return null;

  return (
    <div className="flex h-screen bg-[#090e0c] text-[#e6f0ed] overflow-hidden">
      
      {/* ── SIDEBAR NAVIGATION (LEFT) ────────────────────────────────────────── */}
      <aside className="w-64 glass-panel border-r border-[rgba(18,184,134,0.05)] flex flex-col justify-between p-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 px-2">
            <span className="text-xl font-bold tracking-tight text-[#12b886] font-outfit">
              💚 ManMitra
            </span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#12b886] text-black shadow-lg shadow-emerald-950/20'
                  : 'text-slate-400 hover:text-white hover:bg-[rgba(18,184,134,0.02)]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Sanctuary Home
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-[#12b886] text-black shadow-lg shadow-emerald-950/20'
                  : 'text-slate-400 hover:text-white hover:bg-[rgba(18,184,134,0.02)]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              AI Wellness Companion
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'journal'
                  ? 'bg-[#12b886] text-black shadow-lg shadow-emerald-950/20'
                  : 'text-slate-400 hover:text-white hover:bg-[rgba(18,184,134,0.02)]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Private Diaries
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#12b886] text-black shadow-lg shadow-emerald-950/20'
                    : 'text-slate-400 hover:text-white hover:bg-[rgba(18,184,134,0.02)]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Admin Dashboard
              </button>
            )}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-2 bg-[rgba(9,14,12,0.3)] rounded-2xl border border-[rgba(18,184,134,0.02)]">
            <div className="w-9 h-9 rounded-full bg-[#12b886] bg-opacity-10 border border-[#12b886] border-opacity-20 flex items-center justify-center text-xs font-bold text-[#12b886]">
              {user.full_name.charAt(0)}
            </div>
            <div className="truncate text-left">
              <h5 className="text-xs font-bold truncate">{user.full_name}</h5>
              <span className="text-[10px] text-slate-500 capitalize tracking-wider flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#12b886]" /> {user.role} Sanctuary
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[rgba(239,68,68,0.1)] hover:bg-red-950/10 hover:border-red-500/20 transition-all text-xs font-semibold text-red-400 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Leave Sanctuary
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE (RIGHT) ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Workspace Top Header */}
        <header className="px-8 py-6 border-b border-[rgba(18,184,134,0.05)] bg-[rgba(9,14,12,0.1)] flex items-center justify-between">
          <h2 className="text-xl font-bold font-outfit capitalize">{activeTab} Workspace</h2>
          <div className="flex items-center gap-4">
            {activeTab === 'dashboard' && (
              <button
                onClick={() => setMoodOpen(true)}
                className="glow-btn px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                Log Today's Mood
              </button>
            )}
          </div>
        </header>

        {/* Tab Workspace content wrapper */}
        <div className="flex-1 p-8 overflow-y-auto bg-[rgba(9,14,12,0.05)]">
          <AnimatePresence mode="wait">
            
            {/* ── TAB: SANCTUARY DASHBOARD ──────────────────────────────────── */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Welcome Card banner */}
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden bg-[linear-gradient(135deg,rgba(18,184,134,0.05)_0%,rgba(9,14,12,0.5)_100%)]">
                  <div className="relative z-10 text-left">
                    <h3 className="text-2xl font-bold">Hello, {user.full_name}</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                      "Each day is a fresh breath. Take it slow, celebrate your small routines, and check in whenever you need emotional support."
                    </p>
                  </div>
                  <div className="absolute right-8 bottom-[-20%] opacity-[0.03] scale-150 pointer-events-none">
                    <Heart className="w-48 h-48 text-[#12b886]" />
                  </div>
                </div>

                {/* Dashboard layout grid split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left checklist Column */}
                  <div className="h-[400px]">
                    <WellnessChecklist accessToken={accessToken!} />
                  </div>

                  {/* Right Analytics Column */}
                  <div className="space-y-6">
                    {/* Streaks stats banner */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 text-left">
                        <div className="w-10 h-10 rounded-xl bg-orange-950/20 border border-orange-500/20 flex items-center justify-center text-orange-400">
                          <Zap className="w-5 h-5 fill-orange-500" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Streak</span>
                          <h4 className="text-lg font-extrabold">{streakStats.current} Days</h4>
                        </div>
                      </div>

                      <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 text-left">
                        <div className="w-10 h-10 rounded-xl bg-[#12b886]/10 border border-[#12b886]/20 flex items-center justify-center text-[#12b886]">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Longest Streak</span>
                          <h4 className="text-lg font-extrabold">{streakStats.longest} Days</h4>
                        </div>
                      </div>
                    </div>

                    {/* Recharts chart */}
                    <div className="glass-panel p-5 rounded-3xl h-[280px]">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-4 text-left">
                        <TrendingUp className="w-4 h-4 text-[#12b886]" /> Mood Trend Tracker (Last 7 Logs)
                      </div>
                      <div className="w-full h-[180px]">
                        {moodTrend.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={moodTrend}>
                              <XAxis dataKey="name" stroke="#527065" fontSize={9} />
                              <YAxis stroke="#527065" domain={[1, 10]} fontSize={9} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#0e1714', 
                                  borderColor: 'rgba(18,184,134,0.1)', 
                                  borderRadius: '12px',
                                  fontSize: '10px'
                                }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#12b886" 
                                strokeWidth={2.5} 
                                dot={{ fill: '#12b886', strokeWidth: 1 }} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                            No logs submitted yet. Tap "Log Today's Mood" above to start tracking.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* ── TAB: AI WEB COMPANION ──────────────────────────────────────── */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ChatPanel accessToken={accessToken!} />
              </motion.div>
            )}

            {/* ── TAB: PRIVATE ENCRYPTED DIARIES ────────────────────────────── */}
            {activeTab === 'journal' && (
              <motion.div
                key="journal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <JournalPanel accessToken={accessToken!} />
              </motion.div>
            )}

            {/* ── TAB: ADMIN GLOBAL ANALYTICS ────────────────────────────────── */}
            {activeTab === 'admin' && user.role === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="mb-6 text-left">
                  <h3 className="text-lg font-bold">Admin Platform Control Center</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time system health and anonymized usage indicators.</p>
                </div>

                {adminStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                    <div className="glass-panel p-5 rounded-2xl">
                      <Users className="w-5 h-5 text-[#12b886] mb-3" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total Users</span>
                      <h4 className="text-xl font-bold mt-1">{adminStats.total_users}</h4>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl">
                      <Sparkles className="w-5 h-5 text-[#12b886] mb-3" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Avg Stress Level</span>
                      <h4 className="text-xl font-bold mt-1">{adminStats.avg_stress_level}/10</h4>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl">
                      <ShieldAlert className="w-5 h-5 text-orange-500 mb-3" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Crisis Incidents</span>
                      <h4 className="text-xl font-bold mt-1 text-orange-400">{adminStats.total_crisis_incidents}</h4>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl">
                      <Check className="w-5 h-5 text-emerald-400 mb-3" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Crisis Resolution</span>
                      <h4 className="text-xl font-bold mt-1 text-emerald-400">{adminStats.crisis_resolution_rate}%</h4>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-xs text-slate-500">Loading system metrics...</div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── MOOD TRACKER MODAL OVERLAY ──────────────────────────────────────── */}
      <AnimatePresence>
        {moodOpen && (
          <MoodTracker
            accessToken={accessToken!}
            onClose={() => setMoodOpen(false)}
            onSuccess={fetchMoodStats}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
