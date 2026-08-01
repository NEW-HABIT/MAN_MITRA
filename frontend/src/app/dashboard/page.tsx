"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Heart, LayoutDashboard, MessageSquare, BookOpen, User, LogOut, ShieldCheck,
  TrendingUp, Award, BarChart3, Users, Zap, ShieldAlert, Sparkles, Check, Menu, X,
  Stethoscope, Clock, Activity, Star, UserCheck, CheckCircle2, Trash2, UserPlus,
  Bot, Download, Lock, Brain
} from 'lucide-react';

import WellnessChecklist from '@/components/wellness-checklist';
import MoodTracker from '@/components/mood-tracker';
import ChatPanel from '@/components/chat-panel';
import JournalPanel from '@/components/journal-panel';
import ProfilePanel from '@/components/profile-panel';
import AdminAnalyticsSuite from '@/components/admin-analytics-suite';
import DoctorWorkspace from '@/components/doctor-workspace';
import ManMitraLogo from '@/components/manmitra-logo';
import { API_URL } from '@/config';

export default function DashboardPage() {
  const router = useRouter();
  const { user, accessToken, logout, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'chat' | 'journal' | 'admin' | 'doctors' | 'members' | 'profile' |
    'ai_analytics' | 'crisis_monitoring' | 'clinical_insights' | 'content_mgmt' | 'platform_audit' | 'reports_export'
  >('dashboard');
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mood Tracker modal triggers
  const [moodOpen, setMoodOpen] = useState(false);
  const [moodTrend, setMoodTrend] = useState<any[]>([]);
  const [streakStats, setStreakStats] = useState({ current: 0, longest: 0 });

  // Admin stats state & Doctor registration state
  const [adminStats, setAdminStats] = useState<any | null>(null);
  const [addDoctorModalOpen, setAddDoctorModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocEmail, setNewDocEmail] = useState('');
  const [newDocPassword, setNewDocPassword] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('');
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [docError, setDocError] = useState('');

  // Directory sub-tab selection & Member registration state
  const [directorySubTab, setDirectorySubTab] = useState<'clients' | 'doctors'>('clients');
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [newMemberRole, setNewMemberRole] = useState<'user' | 'therapist'>('user');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberOccupation, setNewMemberOccupation] = useState('');
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [memberError, setMemberError] = useState('');

  // Assign Patient to Doctor Modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedClientForAssign, setSelectedClientForAssign] = useState('');
  const [selectedDoctorForAssign, setSelectedDoctorForAssign] = useState('');
  const [assignTimeSlot, setAssignTimeSlot] = useState('10:00 AM - 10:45 AM');
  const [assignSessionType, setAssignSessionType] = useState('Cognitive Behavioral Therapy (CBT)');
  const [assignMeetingType, setAssignMeetingType] = useState('Online Video Call');
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const handleAssignPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError('');
    setAssignSuccess('');
    setAssignSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/admin/assign-patient/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          client_id: selectedClientForAssign,
          doctor_id: selectedDoctorForAssign,
          time_slot: assignTimeSlot,
          session_type: assignSessionType,
          meeting_type: assignMeetingType,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAssignSuccess(data.message || 'Patient successfully assigned to Doctor.');
        fetchAdminStats();
        setTimeout(() => {
          setAssignModalOpen(false);
          setAssignSuccess('');
        }, 2000);
      } else {
        setAssignError(data.error || 'Failed to assign patient to doctor.');
      }
    } catch (err: any) {
      setAssignError(err.message || 'Failed to connect to server.');
    } finally {
      setAssignSubmitting(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      if (user?.role === 'admin' && activeTab === 'dashboard') {
        setActiveTab('admin');
      }
      fetchMoodData();
    }
  }, [isAuthenticated, router, user]);

  const fetchMoodData = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/api/mood/logs/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.results || []);
          const formatted = list.map((item: any) => ({
            date: new Date(item.date || item.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            score: item.mood_score,
          })).reverse();
          setMoodTrend(formatted);
          
          setStreakStats({
            current: list.length > 0 ? Math.min(list.length, 7) : 0,
            longest: Math.max(list.length, 12),
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch mood data:', e);
    }
  };

  // Fetch admin stats if the active tab is an admin view
  const fetchAdminStats = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/admin/dashboard/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setAdminStats(data);
        }
      } else if (res.status === 401) {
        logout();
        router.push('/auth/login');
      }
    } catch (e) {
      // Quietly handle transient network drops
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminStats();
      const interval = setInterval(() => {
        fetchAdminStats();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user, accessToken]);

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocError('');
    setDocSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/admin/doctors/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          full_name: newDocName,
          email: newDocEmail,
          password: newDocPassword,
          specialty: newDocSpecialty,
        }),
      });
      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register specialist account.');
      }
      setAddDoctorModalOpen(false);
      setNewDocName('');
      setNewDocEmail('');
      setNewDocPassword('');
      setNewDocSpecialty('');
      await fetchAdminStats();
    } catch (err: any) {
      setDocError(err.message || 'An error occurred.');
    } finally {
      setDocSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentActiveStatus: boolean) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/admin/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ is_active: !currentActiveStatus }),
      });
      if (res.ok) {
        await fetchAdminStats();
      } else if (res.status === 401) {
        logout();
        router.push('/auth/login');
      }
    } catch (e) {
      console.error('Failed to toggle user status:', e);
    }
  };

  const handlePromoteToSpecialist = async (userId: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/admin/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ role: 'therapist' }),
      });
      if (res.ok) {
        await fetchAdminStats();
      } else if (res.status === 401) {
        logout();
        router.push('/auth/login');
      }
    } catch (e) {
      console.error('Failed to promote user:', e);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError('');
    setMemberSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/admin/members/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          full_name: newMemberName,
          email: newMemberEmail,
          password: newMemberPassword,
          role: newMemberRole,
          occupation: newMemberOccupation,
        }),
      });
      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register new member.');
      }
      setAddMemberModalOpen(false);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPassword('');
      setNewMemberOccupation('');
      await fetchAdminStats();
    } catch (err: any) {
      setMemberError(err.message || 'An error occurred.');
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete account for "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/admin/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        await fetchAdminStats();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user.');
      }
    } catch (e) {
      console.error(e);
    }
  };

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
          <nav className="space-y-1">
            {user.role === 'admin' ? (
              <>
                <button
                  onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Executive Overview
                </button>

                <button
                  onClick={() => { setActiveTab('members'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'members'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Directory & Accounts
                </button>

                <button
                  onClick={() => { setActiveTab('doctors'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'doctors'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  Doctor Workloads
                </button>

                <button
                  onClick={() => { setActiveTab('ai_analytics'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'ai_analytics'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  AI & Clinical Engine
                </button>

                <button
                  onClick={() => { setActiveTab('crisis_monitoring'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'crisis_monitoring'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Emergency Risk Feed
                </button>

                <button
                  onClick={() => { setActiveTab('clinical_insights'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'clinical_insights'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Clinical Scores (PHQ/GAD)
                </button>

                <button
                  onClick={() => { setActiveTab('content_mgmt'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'content_mgmt'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  CBT Content Hub
                </button>

                <button
                  onClick={() => { setActiveTab('platform_audit'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'platform_audit'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Security & Audit Trail
                </button>

                <button
                  onClick={() => { setActiveTab('reports_export'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'reports_export'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  BI Reports & Export
                </button>

                <button
                  onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <User className="w-4 h-4" />
                  My Sanctuary Profile
                </button>
              </>
            ) : user.role === 'therapist' ? (
              <>
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  Specialist Workspace
                </button>

                <button
                  onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Professional Profile
                </button>
              </>
            ) : (
              <>
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
                  Wellness Companion
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
                  Personal Journal
                </button>

                <button
                  onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <User className="w-4 h-4" />
                  My Profile & Settings
                </button>
              </>
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
                <ShieldCheck className="w-3.5 h-3.5 text-[#0284c7]" /> {user.role === 'admin' ? 'Admin Operations' : user.role === 'therapist' ? 'Specialist Roster' : 'Personal Sanctuary'}
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
            <h2 className="text-lg sm:text-xl font-bold font-outfit capitalize text-slate-900">
              {activeTab === 'admin' 
                ? 'Executive BI Overview' 
                : activeTab === 'doctors' 
                ? 'Doctor Roster & Workloads' 
                : activeTab === 'members' 
                ? 'Directory & Accounts' 
                : activeTab === 'ai_analytics'
                ? 'AI & Clinical Engine'
                : activeTab === 'crisis_monitoring'
                ? 'Emergency Risk Feed'
                : activeTab === 'clinical_insights'
                ? 'Clinical Scores (PHQ/GAD)'
                : activeTab === 'content_mgmt'
                ? 'CBT Content Hub'
                : activeTab === 'platform_audit'
                ? 'Security & Audit Trail'
                : activeTab === 'reports_export'
                ? 'BI Reports & Export'
                : activeTab === 'profile'
                ? 'Profile & Security Settings'
                : activeTab === 'dashboard' 
                ? (user.role === 'therapist' ? 'Specialist Workspace' : 'Sanctuary Home')
                : activeTab === 'chat' 
                ? (user.role === 'therapist' ? 'Consultation Companion' : 'Wellness Companion') 
                : (user.role === 'therapist' ? 'Care Notes & Observations' : 'Personal Journal')
              }
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'dashboard' && user.role === 'user' && (
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
            
            {/* ── TAB: SANCTUARY DASHBOARD / DOCTOR WORKSPACE ───────────────── */}
            {activeTab === 'dashboard' && (
              user.role === 'therapist' ? (
                <DoctorWorkspace accessToken={accessToken!} doctorName={user.full_name} />
              ) : (
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
                          <TrendingUp className="w-4 h-4 text-[#0284c7]" /> Mood Trend (Last 7 Check-ins)
                        </div>
                        <div className="w-full h-[180px]">
                          {moodTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={moodTrend}>
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
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
                              No check-ins yet. Tap "Log Today's Mood" above to start tracking.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )
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

            {/* ── TAB: ADMIN ANALYTICS & BI SUITE ─────────────────────────────── */}
            {user.role === 'admin' && ['admin', 'ai_analytics', 'crisis_monitoring', 'clinical_insights', 'content_mgmt', 'platform_audit', 'reports_export'].includes(activeTab) && (
              <AdminAnalyticsSuite
                accessToken={accessToken!}
                adminStats={adminStats}
                activeSubTab={activeTab}
                onNavigateTab={setActiveTab}
                onOpenAddMember={() => setAddMemberModalOpen(true)}
              />
            )}

            {/* ── TAB: DOCTORS WORKLOAD & ROSTER ────────────────────────────── */}
            {activeTab === 'doctors' && user.role === 'admin' && (
              <motion.div
                key="doctors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold font-outfit text-slate-900 flex items-center gap-2">
                      <Stethoscope className="text-[#0284c7] w-6 h-6" /> Doctor & Specialist Roster Operations
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Real-time consultation capacity, active assignments, and rating metrics.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAssignModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-50 text-[#0284c7] border border-sky-200 hover:bg-sky-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> Assign Patient to Doctor
                    </button>
                    <button
                      onClick={() => setAddDoctorModalOpen(true)}
                      className="glow-btn px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      + Add New Specialist
                    </button>
                  </div>
                </div>

                {adminStats?.doctors_workload && adminStats.doctors_workload.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adminStats.doctors_workload.map((doc: any) => {
                      const statusColor = doc.status === 'Available' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : doc.status === 'In Session' 
                        ? 'bg-sky-50 text-[#0284c7] border-sky-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200';

                      const capColor = doc.utilization_percent >= 100 
                        ? 'bg-amber-500' 
                        : doc.utilization_percent >= 70 
                        ? 'bg-[#0284c7]' 
                        : 'bg-emerald-500';

                      return (
                        <div key={doc.id} className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#0284c7]/10 border border-sky-200 flex items-center justify-center font-bold text-[#0284c7] text-base">
                                  {doc.name.replace('Dr. ', '').charAt(0)}
                                </div>
                                <div>
                                  <h5 className="text-base font-bold text-slate-900">{doc.name}</h5>
                                  <span className="text-xs text-slate-500">{doc.specialty}</span>
                                </div>
                              </div>
                              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${statusColor}`}>
                                {doc.status}
                              </span>
                            </div>

                            <div className="mt-5">
                              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                                <span>Active Workload ({doc.active_sessions}/{doc.max_capacity} Consultations)</span>
                                <span className="font-bold text-slate-800">{doc.utilization_percent}% Capacity</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                <div className={`h-full ${capColor}`} style={{ width: `${doc.utilization_percent}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-sky-100 flex items-center justify-between text-xs text-slate-600">
                            <span className="flex items-center gap-1 font-semibold text-amber-600">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {doc.rating} / 5.0 Rating
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleUserStatus(doc.id, doc.is_active ?? true)}
                                className="px-3.5 py-1.5 rounded-xl border border-sky-200 text-xs font-semibold text-[#0284c7] hover:bg-sky-50 transition-colors cursor-pointer"
                              >
                                Toggle Duty Status
                              </button>
                              <button
                                onClick={() => handleDeleteUser(doc.id, doc.name)}
                                className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Specialist Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center glass-panel rounded-3xl bg-white border border-sky-100 space-y-3">
                    <Stethoscope className="w-10 h-10 text-[#0284c7] mx-auto opacity-40" />
                    <h4 className="text-sm font-bold text-slate-800">No Specialist Accounts Registered</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">There are no doctor accounts registered in your database. Click "+ Add New Specialist" to create one.</p>
                    <button
                      onClick={() => setAddDoctorModalOpen(true)}
                      className="glow-btn px-5 py-2.5 rounded-xl text-xs font-semibold mt-2 cursor-pointer"
                    >
                      + Add New Specialist
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── TAB: MEMBER DIRECTORY ───────────────────────────────────────── */}
            {activeTab === 'members' && user.role === 'admin' && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                {/* Header & Main Add Member Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold font-outfit text-slate-900 flex items-center gap-2">
                      <Users className="text-[#0284c7] w-6 h-6" /> Directory & Account Management
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Manage platform clients, doctors, and user accounts from one workspace.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAssignModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-50 text-[#0284c7] border border-sky-200 hover:bg-sky-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> Assign Patient to Doctor
                    </button>
                    <button
                      onClick={() => setAddMemberModalOpen(true)}
                      className="glow-btn px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> + Add New Member
                    </button>
                  </div>
                </div>

                {/* Sub-tab Navigation Bar (Clients vs Doctors) */}
                <div className="flex items-center gap-2 p-1.5 bg-sky-50/80 rounded-2xl border border-sky-100 max-w-md">
                  <button
                    onClick={() => setDirectorySubTab('clients')}
                    className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      directorySubTab === 'clients'
                        ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                        : 'text-slate-600 hover:text-[#0284c7]'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Clients / Members ({adminStats?.members_list?.length || 0})
                  </button>
                  <button
                    onClick={() => setDirectorySubTab('doctors')}
                    className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      directorySubTab === 'doctors'
                        ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                        : 'text-slate-600 hover:text-[#0284c7]'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    Doctors & Specialists ({adminStats?.doctors_workload?.length || 0})
                  </button>
                </div>

                {/* Sub-tab Content 1: Clients Directory */}
                {directorySubTab === 'clients' && (
                  <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm overflow-hidden space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#0284c7]" /> Active Clients Roster
                    </h4>
                    {adminStats?.members_list && adminStats.members_list.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-sky-100 text-slate-400 uppercase tracking-wider text-[10px]">
                              <th className="pb-3 font-semibold">Client Name</th>
                              <th className="pb-3 font-semibold">Email</th>
                              <th className="pb-3 font-semibold">Occupation / Details</th>
                              <th className="pb-3 font-semibold">Status</th>
                              <th className="pb-3 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-sky-50 text-slate-700">
                            {adminStats.members_list.map((m: any) => (
                              <tr key={m.id} className="hover:bg-sky-50/50 transition-colors">
                                <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-sky-100 text-[#0284c7] font-bold flex items-center justify-center text-xs">
                                    {m.name.charAt(0)}
                                  </div>
                                  {m.name}
                                </td>
                                <td className="py-3.5 text-slate-600">{m.email}</td>
                                <td className="py-3.5 text-slate-600">{m.occupation}</td>
                                <td className="py-3.5">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                    m.status === 'Active' 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                      : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}>
                                    {m.status}
                                  </span>
                                </td>
                                <td className="py-3.5 text-right space-x-3">
                                  <button
                                    onClick={() => handlePromoteToSpecialist(m.id)}
                                    className="text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer"
                                  >
                                    + Promote to Doctor
                                  </button>
                                  <button
                                    onClick={() => handleToggleUserStatus(m.id, m.status === 'Active')}
                                    className="text-[11px] font-semibold text-[#0284c7] hover:underline cursor-pointer"
                                  >
                                    {m.status === 'Active' ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(m.id, m.name)}
                                    className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                                  >
                                    Delete Account
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-500">
                        No client accounts registered in database yet. Click "+ Add New Member" above.
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-tab Content 2: Doctors Directory */}
                {directorySubTab === 'doctors' && (
                  <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-[#0284c7]" /> Registered Doctors & Specialists Roster
                    </h4>
                    {adminStats?.doctors_workload && adminStats.doctors_workload.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {adminStats.doctors_workload.map((doc: any) => {
                          const statusColor = doc.status === 'Available' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : doc.status === 'In Session' 
                            ? 'bg-sky-50 text-[#0284c7] border-sky-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200';

                          return (
                            <div key={doc.id} className="p-5 rounded-2xl border border-sky-100 bg-sky-50/30 flex flex-col justify-between space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-[#0284c7]/10 text-[#0284c7] font-bold flex items-center justify-center text-sm">
                                    {doc.name.replace('Dr. ', '').charAt(0)}
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-bold text-slate-900">{doc.name}</h5>
                                    <span className="text-xs text-slate-500">{doc.specialty}</span>
                                  </div>
                                </div>
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${statusColor}`}>
                                  {doc.status}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-sky-100">
                                <span>Email: {doc.email}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleToggleUserStatus(doc.id, doc.status === 'Available')}
                                    className="px-3 py-1 rounded-lg border border-sky-200 text-[11px] font-semibold text-[#0284c7] hover:bg-sky-50"
                                  >
                                    Toggle Status
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(doc.id, doc.name)}
                                    className="p-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                                    title="Delete Doctor"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-500">
                        No doctor accounts registered in database yet. Click "+ Add New Member" above to create a doctor account.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── TAB: PROFILE & SECURITY SETTINGS ─────────────────────────── */}
            {activeTab === 'profile' && (
              <ProfilePanel />
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── ADD NEW SPECIALIST MODAL OVERLAY ──────────────────────────── */}
      <AnimatePresence>
        {addDoctorModalOpen && (
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
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-sky-100 shadow-xl space-y-6 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-[#0284c7] flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add New Doctor / Specialist</h3>
                    <p className="text-xs text-slate-500">Register a specialist account in database.</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddDoctorModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {docError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
                  {docError}
                </div>
              )}

              <form onSubmit={handleCreateDoctor} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ananya Sen"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="ananya.sen@manmitra.org"
                    value={newDocEmail}
                    onChange={(e) => setNewDocEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newDocPassword}
                    onChange={(e) => setNewDocPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Specialty / Qualification</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cognitive Behavioral Specialist"
                    value={newDocSpecialty}
                    onChange={(e) => setNewDocSpecialty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAddDoctorModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={docSubmitting}
                    className="glow-btn px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {docSubmitting ? 'Registering...' : 'Register Specialist'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* ── UNIFIED ADD MEMBER MODAL OVERLAY (DOCTOR OR CLIENT) ─────────── */}
      <AnimatePresence>
        {addMemberModalOpen && (
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
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-sky-100 shadow-xl space-y-6 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-[#0284c7] flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add New Directory Member</h3>
                    <p className="text-xs text-slate-500">Register a new client or doctor account in database.</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddMemberModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {memberError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
                  {memberError}
                </div>
              )}

              <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
                {/* Account Type Selection (Client vs Doctor) */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Select Account Role</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-sky-50 rounded-2xl border border-sky-100">
                    <button
                      type="button"
                      onClick={() => setNewMemberRole('user')}
                      className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                        newMemberRole === 'user'
                          ? 'bg-[#0284c7] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" /> Client / Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMemberRole('therapist')}
                      className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                        newMemberRole === 'therapist'
                          ? 'bg-[#0284c7] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Stethoscope className="w-3.5 h-3.5" /> Doctor / Specialist
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder={newMemberRole === 'therapist' ? 'e.g. Dr. Ananya Sen' : 'e.g. Rahul Sharma'}
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder={newMemberRole === 'therapist' ? 'dr.ananya@manmitra.org' : 'rahul.sharma@example.com'}
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newMemberPassword}
                    onChange={(e) => setNewMemberPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {newMemberRole === 'therapist' ? 'Specialty / Qualification' : 'Occupation / Role'}
                  </label>
                  <input
                    type="text"
                    placeholder={newMemberRole === 'therapist' ? 'e.g. Cognitive Behavioral Specialist' : 'e.g. Software Engineer'}
                    value={newMemberOccupation}
                    onChange={(e) => setNewMemberOccupation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAddMemberModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={memberSubmitting}
                    className="glow-btn px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {memberSubmitting ? 'Creating...' : `Register ${newMemberRole === 'therapist' ? 'Doctor' : 'Client'}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ASSIGN PATIENT TO DOCTOR MODAL OVERLAY ───────────────────────── */}
      <AnimatePresence>
        {assignModalOpen && (
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
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-sky-100 shadow-2xl space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[#0284c7]" /> Assign Patient to Doctor
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Schedule consultation session & link care roster.</p>
                </div>
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {assignError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                  {assignError}
                </div>
              )}

              {assignSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {assignSuccess}
                </div>
              )}

              <form onSubmit={handleAssignPatient} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Client / Patient</label>
                  <select
                    required
                    value={selectedClientForAssign}
                    onChange={(e) => setSelectedClientForAssign(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7] bg-white text-slate-900"
                  >
                    <option value="">-- Choose Patient Account --</option>
                    {(adminStats?.members_list || []).map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Doctor / Specialist</label>
                  <select
                    required
                    value={selectedDoctorForAssign}
                    onChange={(e) => setSelectedDoctorForAssign(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7] bg-white text-slate-900"
                  >
                    <option value="">-- Choose Doctor Specialist --</option>
                    {(adminStats?.doctors_workload || []).map((doc: any) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Consultation Time Slot</label>
                  <select
                    value={assignTimeSlot}
                    onChange={(e) => setAssignTimeSlot(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7] bg-white text-slate-900"
                  >
                    <option value="09:00 AM - 09:45 AM">09:00 AM - 09:45 AM</option>
                    <option value="11:30 AM - 12:15 PM">11:30 AM - 12:15 PM</option>
                    <option value="02:00 PM - 02:45 PM">02:00 PM - 02:45 PM</option>
                    <option value="04:30 PM - 05:15 PM">04:30 PM - 05:15 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Session Protocol & Category</label>
                  <input
                    type="text"
                    required
                    value={assignSessionType}
                    onChange={(e) => setAssignSessionType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assignSubmitting}
                    className="glow-btn px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {assignSubmitting ? 'Assigning...' : 'Assign Patient'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
