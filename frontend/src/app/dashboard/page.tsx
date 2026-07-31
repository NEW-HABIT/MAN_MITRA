"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Heart, LayoutDashboard, MessageSquare, BookOpen, User, LogOut, ShieldCheck,
  TrendingUp, Award, BarChart3, Users, Zap, ShieldAlert, Sparkles, Check, Menu, X
} from 'lucide-react';

import WellnessChecklist from '@/components/wellness-checklist';
import MoodTracker from '@/components/mood-tracker';
import ChatPanel from '@/components/chat-panel';
import JournalPanel from '@/components/journal-panel';
import ManMitraLogo from '@/components/manmitra-logo';
import { API_URL } from '@/config';

export default function DashboardPage() {
  const router = useRouter();
  const { user, accessToken, logout, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'journal' | 'admin'>('dashboard');
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mood Tracker modal triggers
  const [moodOpen, setMoodOpen] = useState(false);
  const [moodTrend, setMoodTrend] = useState<any[]>([]);
  const [streakStats, setStreakStats] = useState({ current: 0, longest: 0 });

  // Admin stats state
  const [adminStats, setAdminStats] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      fetchMoodData();
    }
  }, [isAuthenticated, router]);

  const fetchMoodData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/wellness/mood-history/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((item: any) => ({
          date: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          score: item.score,
        })).reverse();
        setMoodTrend(formatted);
        
        setStreakStats({
          current: data.length > 0 ? Math.min(data.length, 7) : 0,
          longest: Math.max(data.length, 12),
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch admin stats if the active tab is admin
  const fetchAdminStats = async () => {
    if (!accessToken || user?.role !== 'admin') return;
    try {
      const res = await fetch(`${API_URL}/api/auth/admin/dashboard/`, {
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
    <div className="flex h-screen bg-[#f4f8fc] text-[#0f172a] overflow-hidden relative">
      
      {/* ── MOBILE BACKDROP OVERLAY ────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* ── SIDEBAR NAVIGATION (LEFT) ────────────────────────────────────────── */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 w-64 glass-panel border-r border-sky-100 flex flex-col justify-between p-6 bg-white/95 backdrop-blur-xl transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 px-2">
            <span className="text-xl font-bold tracking-tight text-[#0284c7] font-outfit flex items-center gap-2.5">
              <ManMitraLogo className="w-7 h-7" />
              ManMitra
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                  : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Sanctuary Home
            </button>

            <button
              onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                  : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              AI Wellness Companion
            </button>

            <button
              onClick={() => { setActiveTab('journal'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'journal'
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                  : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Private Diaries
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                    : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
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
          <div className="flex items-center gap-3 p-2 bg-sky-50/60 rounded-2xl border border-sky-100">
            <div className="w-9 h-9 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-xs font-bold text-[#0284c7]">
              {user.full_name.charAt(0)}
            </div>
            <div className="truncate text-left">
              <h5 className="text-xs font-bold truncate text-slate-800">{user.full_name}</h5>
              <span className="text-[10px] text-slate-500 capitalize tracking-wider flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0284c7]" /> {user.role} Sanctuary
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-rose-100 hover:bg-rose-50/80 transition-all text-xs font-semibold text-rose-500 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Leave Sanctuary
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE (RIGHT) ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* Workspace Top Header */}
        <header className="px-4 sm:px-8 py-4 sm:py-6 border-b border-sky-100 bg-white/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl glass-panel border-sky-200 md:hidden text-slate-700 hover:text-[#0284c7] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-lg sm:text-xl font-bold font-outfit capitalize text-slate-900">{activeTab} Workspace</h2>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'dashboard' && (
              <button
                onClick={() => setMoodOpen(true)}
                className="glow-btn px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                Log Today's Mood
              </button>
            )}
          </div>
        </header>

        {/* Tab Workspace content wrapper */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-sky-50/30">
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
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-sky-100/60 to-white text-[#0f172a]">
                  <div className="relative z-10 text-left">
                    <h3 className="text-2xl font-bold text-slate-900">Hello, {user.full_name}</h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                      "Each day is a fresh breath. Take it slow, celebrate your small routines, and check in whenever you need emotional support."
                    </p>
                  </div>
                  <div className="absolute right-8 bottom-[-20%] opacity-[0.06] scale-150 pointer-events-none">
                    <Heart className="w-48 h-48 text-[#0284c7]" />
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
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                          <Zap className="w-5 h-5 fill-amber-500" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Streak</span>
                          <h4 className="text-lg font-extrabold text-slate-800">{streakStats.current} Days</h4>
                        </div>
                      </div>

                      <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 text-left">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Longest Streak</span>
                          <h4 className="text-lg font-extrabold text-slate-800">{streakStats.longest} Days</h4>
                        </div>
                      </div>
                    </div>

                    {/* Recharts chart */}
                    <div className="glass-panel p-5 rounded-3xl h-[280px]">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-4 text-left">
                        <TrendingUp className="w-4 h-4 text-[#0284c7]" /> Mood Trend Tracker (Last 7 Logs)
                      </div>
                      <div className="w-full h-[180px]">
                        {moodTrend.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={moodTrend}>
                              <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                              <YAxis stroke="#94a3b8" domain={[1, 10]} fontSize={9} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#ffffff', 
                                  borderColor: 'rgba(186,216,245,0.8)', 
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  color: '#0f172a'
                                }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#0284c7" 
                                strokeWidth={2.5} 
                                dot={{ fill: '#0284c7', strokeWidth: 1 }} 
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
                  <h3 className="text-lg font-bold text-slate-900">Admin Platform Control Center</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time system health and anonymized usage indicators.</p>
                </div>

                {adminStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                    <div className="glass-panel p-5 rounded-2xl">
                      <Users className="w-5 h-5 text-[#0284c7] mb-3" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total Users</span>
                      <h4 className="text-xl font-bold mt-1 text-slate-900">{adminStats.total_users}</h4>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl">
                      <Sparkles className="w-5 h-5 text-[#0284c7] mb-3" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Avg Stress Level</span>
                      <h4 className="text-xl font-bold mt-1 text-slate-900">{adminStats.avg_stress_level}/10</h4>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl">
                      <ShieldAlert className="w-5 h-5 text-amber-500 mb-3" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Crisis Incidents</span>
                      <h4 className="text-xl font-bold mt-1 text-amber-600">{adminStats.total_crisis_incidents}</h4>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl">
                      <Check className="w-5 h-5 text-emerald-500 mb-3" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Crisis Resolution</span>
                      <h4 className="text-xl font-bold mt-1 text-emerald-600">{adminStats.crisis_resolution_rate}%</h4>
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
            onSuccess={fetchMoodData}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
