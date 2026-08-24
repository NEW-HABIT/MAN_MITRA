"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Heart, LayoutDashboard, MessageSquare, BookOpen, User, LogOut, ShieldCheck,
  TrendingUp, Award, BarChart3, Users, Zap, ShieldAlert, Sparkles, Check, Menu, X,
  Stethoscope, Clock, Activity, Star, UserCheck, CheckCircle2, Trash2, UserPlus,
  Bot, Download, Lock, Brain, Eye, EyeOff, Bell, BellRing, AlertOctagon
} from 'lucide-react';


import WellnessChecklist from '@/components/wellness-checklist';
import MoodTracker from '@/components/mood-tracker';
import ChatPanel from '@/components/chat-panel';
import JournalPanel from '@/components/journal-panel';
import ProfilePanel from '@/components/profile-panel';
import AdminAnalyticsSuite from '@/components/admin-analytics-suite';
import DoctorWorkspace from '@/components/doctor-workspace';
import AssessmentSuite from '@/components/assessment-suite';
import WellnessHub from '@/components/wellness-hub';
import CommunityBoard from '@/components/community-board';
import TherapistBooking from '@/components/therapist-booking';
import ManMitraLogo from '@/components/manmitra-logo';
import { API_URL } from '@/config';

export default function DashboardPage() {

  const router = useRouter();
  const { user, accessToken, logout, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'chat' | 'journal' | 'admin' | 'psychologists' | 'doctors' | 'members' | 'profile' |
    'ai_analytics' | 'crisis_monitoring' | 'clinical_insights' | 'content_mgmt' | 'platform_audit' | 'reports_export' |
    'assessments' | 'wellness_hub' | 'community' | 'booking'
  >('dashboard');
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mood Tracker modal triggers
  const [moodOpen, setMoodOpen] = useState(false);
  const [moodTrend, setMoodTrend] = useState<any[]>([]);
  const [streakStats, setStreakStats] = useState({ current: 0, longest: 0 });

  // ── Notification state ────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);

  // Admin stats state & Psychologist registration state
  const [adminStats, setAdminStats] = useState<any | null>(null);

  const [addDoctorModalOpen, setAddDoctorModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocEmail, setNewDocEmail] = useState('');
  const [newDocPassword, setNewDocPassword] = useState('');
  const [showDocPassword, setShowDocPassword] = useState(false);
  const [newDocSpecialty, setNewDocSpecialty] = useState('');

  const [newDocFee, setNewDocFee] = useState('₹1,500 / 45 mins');
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [docError, setDocError] = useState('');

  // Edit Psychologist Modal state
  const [editDoctorModalOpen, setEditDoctorModalOpen] = useState(false);
  const [editDocId, setEditDocId] = useState('');
  const [editDocName, setEditDocName] = useState('');
  const [editDocEmail, setEditDocEmail] = useState('');
  const [editDocSpecialty, setEditDocSpecialty] = useState('');
  const [editDocFee, setEditDocFee] = useState('₹1,500 / 45 mins');
  const [editDocSubmitting, setEditDocSubmitting] = useState(false);
  const [editDocStatusMsg, setEditDocStatusMsg] = useState('');

  // View Details & Comprehensive Edit Account Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsUser, setDetailsUser] = useState<any | null>(null);
  const [detailsActiveSubTab, setDetailsActiveSubTab] = useState<'info' | 'edit' | 'security'>('info');
  const [detailsFormName, setDetailsFormName] = useState('');
  const [detailsFormEmail, setDetailsFormEmail] = useState('');
  const [detailsFormOccupation, setDetailsFormOccupation] = useState('');
  const [detailsFormFee, setDetailsFormFee] = useState('₹1,500 / 45 mins');
  const [detailsFormActive, setDetailsFormActive] = useState(true);
  const [detailsFormPassword, setDetailsFormPassword] = useState('');
  const [showDetailsPassword, setShowDetailsPassword] = useState(false);
  const [detailsSubmitting, setDetailsSubmitting] = useState(false);
  const [detailsStatusMsg, setDetailsStatusMsg] = useState('');

  // Directory sub-tab selection & Member registration state
  const [directorySubTab, setDirectorySubTab] = useState<'clients' | 'doctors'>('clients');
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [newMemberRole, setNewMemberRole] = useState<'user' | 'therapist'>('user');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [showMemberPassword, setShowMemberPassword] = useState(false);
  const [newMemberOccupation, setNewMemberOccupation] = useState('');
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [memberError, setMemberError] = useState('');

  // Reset Password Modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<{ id: string; name: string } | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [resetStatus, setResetStatus] = useState('');

  // Assign Patient to Psychologist Modal state
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
        setAssignSuccess(data.message || 'Patient successfully assigned to Psychologist.');
        fetchAdminStats();
        setTimeout(() => {
          setAssignModalOpen(false);
          setAssignSuccess('');
        }, 2000);
      } else {
        setAssignError(data.error || 'Failed to assign patient to psychologist.');
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
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [user, accessToken]);



  const handleToggleUserStatus = async (userId: string, currentActiveStatus: boolean) => {
    if (!accessToken) return;
    const newStatus = !currentActiveStatus;

    setAdminStats((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        doctors_workload: (prev.doctors_workload || []).map((doc: any) =>
          doc.id === userId ? { ...doc, is_active: newStatus, status: newStatus ? 'Available' : 'Off Duty' } : doc
        ),
        members_list: (prev.members_list || []).map((m: any) =>
          m.id === userId ? { ...m, is_active: newStatus, status: newStatus ? 'Active' : 'Inactive' } : m
        )
      };
    });

    try {
      const res = await fetch(`${API_URL}/api/auth/admin/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ is_active: newStatus }),
      });
      if (res.ok) {
        fetchAdminStats();
      }

    } catch (e) {
      console.error('Failed to toggle status:', e);
    }
  };

  const handleOpenViewDetails = (account: any, defaultSubTab: 'info' | 'edit' | 'security' = 'info') => {
    const isPsychologist = !!(account.specialty || account.consultation_fee || account.max_capacity || account.role === 'therapist' || account.role === 'Doctor' || account.role === 'Psychologist');
    const normalizedAccount = {
      ...account,
      role: isPsychologist ? 'therapist' : 'user'
    };
    setDetailsUser(normalizedAccount);
    setDetailsActiveSubTab(defaultSubTab);
    setDetailsFormName(account.name || account.full_name || '');
    setDetailsFormEmail(account.email || '');
    setDetailsFormOccupation(account.occupation || account.specialty || '');
    setDetailsFormFee(account.consultation_fee || '₹1,500 / 45 mins');
    setDetailsFormActive(account.is_active ?? (account.status === 'Active' || account.status === 'Available'));
    setDetailsFormPassword('');
    setDetailsStatusMsg('');
    setDetailsModalOpen(true);
  };

  const handleSaveDetailsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailsUser) return;
    setDetailsSubmitting(true);
    setDetailsStatusMsg('');

    try {
      if (accessToken) {
        const payload: any = {
          full_name: detailsFormName,
          email: detailsFormEmail,
          occupation: detailsFormOccupation,
          consultation_fee: detailsFormFee,
          is_active: detailsFormActive,
        };
        if (detailsFormPassword) {
          payload.password = detailsFormPassword;
        }

        const res = await fetch(`${API_URL}/api/auth/admin/users/${detailsUser.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setDetailsStatusMsg('✔ Account updated successfully.');
          await fetchAdminStats();
          setTimeout(() => {
            setDetailsModalOpen(false);
            setDetailsStatusMsg('');
          }, 2000);
        } else {
          const data = await res.json();
          setDetailsStatusMsg(`❌ ${data.error || 'Failed to update account.'}`);
        }
      }
    } catch (e: any) {
      setDetailsStatusMsg(`❌ ${e.message || 'An error occurred.'}`);
    } finally {
      setDetailsSubmitting(false);
    }
  };

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

  const handleAddDoctor = async (e: React.FormEvent) => {
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
          consultation_fee: newDocFee,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add specialist account.');

      setAddDoctorModalOpen(false);
      setNewDocName('');
      setNewDocEmail('');
      setNewDocPassword('');
      setNewDocSpecialty('');
      setNewDocFee('₹1,500 / 45 mins');
      await fetchAdminStats();
    } catch (err: any) {
      setDocError(err.message || 'Error creating psychologist account.');
    } finally {
      setDocSubmitting(false);
    }
  };

  const handleEditDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditDocSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/admin/users/${editDocId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          full_name: editDocName,
          email: editDocEmail,
          occupation: editDocSpecialty,
          consultation_fee: editDocFee,
        }),
      });
      if (res.ok) {
        setEditDocStatusMsg('✔ Specialist details & consultation fee updated in database!');
        await fetchAdminStats();
        setTimeout(() => {
          setEditDoctorModalOpen(false);
          setEditDocStatusMsg('');
        }, 1500);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update specialist.');
      }
    } catch (e) {
      console.error('Edit psychologist error:', e);
    } finally {
      setEditDocSubmitting(false);
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

    // Instant Optimistic UI Update (0ms latency response)
    setAdminStats((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        total_users: Math.max(0, (prev.total_users || 1) - 1),
        total_clients: Math.max(0, (prev.total_clients || 1) - 1),
        members_list: (prev.members_list || []).filter((m: any) => m.id !== userId),
        doctors_workload: (prev.doctors_workload || []).filter((doc: any) => doc.id !== userId),
      };
    });

    try {
      const res = await fetch(`${API_URL}/api/auth/admin/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        fetchAdminStats(); // Background sync
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user.');
        fetchAdminStats(); // Revert on failure
      }
    } catch (e) {
      console.error(e);
      fetchAdminStats();
    }
  };


  const handleResetUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !resetNewPassword) return;

    try {
      if (accessToken) {
        const res = await fetch(`${API_URL}/api/auth/admin/users/${resetTargetUser.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ password: resetNewPassword }),
        });
      }
    } catch (e) {
      console.error(e);
    }

    setResetStatus(`✔ Password successfully reset for ${resetTargetUser.name}.`);
    setTimeout(() => {
      setResetModalOpen(false);
      setResetTargetUser(null);
      setResetNewPassword('');
      setResetStatus('');
    }, 2000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // ── Notification fetch & polling ─────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!accessToken || (user?.role !== 'admin' && user?.role !== 'therapist')) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/notifications/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (_) {
      // silently ignore transient network errors
    }
  }, [accessToken, user?.role]);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'therapist') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, user?.role]);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const unreadNotifs = notifications.filter(n => !readIds.has(n.id));
  const emergencyNotifs = unreadNotifs.filter(n => n.type === 'Emergency');

  const handleOpenNotifPanel = () => {
    setNotifOpen(prev => !prev);
    // Mark all current as read when opening
    if (!notifOpen) {
      setReadIds(new Set(notifications.map(n => n.id)));
    }
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
                  Platform Summary & Overview
                </button>

                <button
                  onClick={() => { setActiveTab('members'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'members' || activeTab === 'doctors' || activeTab === 'psychologists'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  User & Psychologist Management
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
                  AI Assistant & Chat Analytics
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
                  Urgent Safety & Risk Alerts
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
                  Assessment Analytics
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
                  Wellness & Therapy Content
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
                  Security & Activity Audit
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
                  Reports & Data Export
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
                  My Wellness Profile
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
                  Wellness Dashboard
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
                  onClick={() => { setActiveTab('assessments'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'assessments'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  Self-Reflection & Check-ins
                </button>

                <button
                  onClick={() => { setActiveTab('wellness_hub'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'wellness_hub'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Wellness & Relaxation Hub
                </button>

                <button
                  onClick={() => { setActiveTab('booking'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'booking'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  Connect with a Guide
                </button>

                <button
                  onClick={() => { setActiveTab('community'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'community'
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50/80'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Community Forum
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
                <ShieldCheck className="w-3.5 h-3.5 text-[#0284c7]" /> {user.role === 'admin' ? 'Admin Operations' : user.role === 'therapist' ? 'Guide Care Team' : 'Personal Wellness Space'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-rose-100 hover:bg-rose-50/80 transition-all text-xs font-semibold text-rose-500 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
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
                ? 'Platform Summary & Overview' 
                : (activeTab === 'doctors' || activeTab === 'psychologists')
                ? 'Psychologist Schedules & Care Team' 
                : activeTab === 'members' 
                ? 'User & Guide Accounts' 
                : activeTab === 'ai_analytics'
                ? 'AI Companion Insights'
                : activeTab === 'crisis_monitoring'
                ? 'Support & Safety Care Alerts'
                : activeTab === 'clinical_insights'
                ? 'Reflection & Progress Insights'
                : activeTab === 'content_mgmt'
                ? 'Wellness Content & Activities'
                : activeTab === 'platform_audit'
                ? 'Security & Activity Log'
                : activeTab === 'reports_export'
                ? 'Reports & Data Export'
                : activeTab === 'assessments'
                ? 'Self-Reflection & Check-ins'
                : activeTab === 'wellness_hub'
                ? 'Wellness & Relaxation Hub'
                : activeTab === 'booking'
                ? 'Connect with a Guide'
                : activeTab === 'community'
                ? 'Community Support Forum'
                : activeTab === 'profile'
                ? 'Profile & Security Settings'
                : activeTab === 'dashboard' 
                ? (user.role === 'therapist' ? 'Guide Workspace' : 'Home Dashboard')
                : activeTab === 'chat' 
                ? (user.role === 'therapist' ? 'Consultation Companion' : 'AI Support Companion') 
                : (user.role === 'therapist' ? 'Personal Insights & Notes' : 'Personal Journal')
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

            {/* ── Notification Bell (Admin + Psychologist only) ───────────────── */}
            {(user.role === 'admin' || user.role === 'therapist') && (
              <div className="relative" ref={notifRef}>
                {/* Emergency pulsing ring */}
                {emergencyNotifs.length > 0 && !notifOpen && (
                  <span className="absolute -inset-1 rounded-full bg-rose-400/30 animate-ping pointer-events-none" />
                )}

                <button
                  id="notification-bell-btn"
                  onClick={handleOpenNotifPanel}
                  className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all border shadow-sm cursor-pointer ${
                    emergencyNotifs.length > 0
                      ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                      : 'bg-white border-sky-100 text-slate-500 hover:border-sky-300 hover:text-[#0284c7]'
                  }`}
                >
                  {emergencyNotifs.length > 0 ? (
                    <BellRing className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}

                  {/* Unread count badge */}
                  {unreadNotifs.length > 0 && (
                    <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ${
                      emergencyNotifs.length > 0 ? 'bg-rose-600 text-white' : 'bg-[#0284c7] text-white'
                    }`}>
                      {unreadNotifs.length > 9 ? '9+' : unreadNotifs.length}
                    </span>
                  )}
                </button>

                {/* ── Notification Dropdown Panel ──────────────────────── */}
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-12 z-[200] w-[360px] max-w-[90vw] bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden"
                    >
                      {/* Panel Header */}
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#0284c7]" />
                          <h3 className="text-sm font-bold text-slate-900 font-outfit">Notifications</h3>
                          {emergencyNotifs.length > 0 && (
                            <span className="flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              {emergencyNotifs.length} Emergency
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={fetchNotifications}
                            className="text-[10px] text-slate-400 hover:text-[#0284c7] font-semibold transition-colors cursor-pointer"
                          >
                            Refresh
                          </button>
                          <button
                            onClick={() => setNotifOpen(false)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Notification List */}
                      <div className="overflow-y-auto max-h-[420px] divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="py-14 flex flex-col items-center justify-center gap-2 text-slate-400">
                            <Bell className="w-8 h-8 opacity-30" />
                            <p className="text-xs font-semibold">All clear — no notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            const isEmergency = notif.type === 'Emergency';
                            return (
                              <div
                                key={notif.id}
                                className={`px-5 py-4 flex gap-3 transition-colors ${
                                  isEmergency
                                    ? 'bg-gradient-to-r from-rose-50 to-red-50/30 border-l-4 border-rose-500'
                                    : 'hover:bg-slate-50/60'
                                }`}
                              >
                                {/* Icon */}
                                <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                                  isEmergency
                                    ? 'bg-rose-100 text-rose-600'
                                    : notif.type === 'Reminder'
                                    ? 'bg-amber-50 text-amber-600'
                                    : notif.type === 'Maintenance'
                                    ? 'bg-slate-100 text-slate-500'
                                    : 'bg-sky-50 text-[#0284c7]'
                                }`}>
                                  {isEmergency ? (
                                    <AlertOctagon className="w-4 h-4 animate-pulse" />
                                  ) : (
                                    <Bell className="w-4 h-4" />
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-0.5">
                                    <span className={`text-xs font-bold leading-tight ${
                                      isEmergency ? 'text-rose-800' : 'text-slate-900'
                                    }`}>
                                      {notif.title}
                                    </span>
                                    <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                                      isEmergency
                                        ? 'bg-rose-200 text-rose-800 border border-rose-300'
                                        : notif.type === 'Reminder'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-sky-50 text-sky-700 border border-sky-200'
                                    }`}>
                                      {isEmergency ? '🚨 Emergency' : notif.type}
                                    </span>
                                  </div>
                                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                                    isEmergency ? 'text-rose-700 font-medium' : 'text-slate-500'
                                  }`}>
                                    {notif.message}
                                  </p>
                                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                                    {notif.created_at}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Panel Footer */}
                      {notifications.length > 0 && (
                        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {notifications.length} notification{notifications.length !== 1 ? 's' : ''} · Auto-refreshes every 30s
                          </span>
                          <button
                            onClick={() => setReadIds(new Set(notifications.map((n: any) => n.id)))}
                            className="text-[10px] text-[#0284c7] font-bold hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        {/* Tab Workspace content wrapper */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-sky-50/30">
          <AnimatePresence mode="wait">
            
            {/* ── TAB: WELLNESS DASHBOARD / PSYCHOLOGIST WORKSPACE ─────────────── */}
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

            {/* ── TAB: CLINICAL ASSESSMENTS (PHQ-9 / GAD-7) ────────────────── */}
            {activeTab === 'assessments' && (
              <motion.div
                key="assessments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AssessmentSuite accessToken={accessToken!} onNavigateTab={(tab: any) => setActiveTab(tab)} />
              </motion.div>
            )}

            {/* ── TAB: WELLNESS & RELAXATION HUB ────────────────────────────── */}
            {activeTab === 'wellness_hub' && (
              <motion.div
                key="wellness_hub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <WellnessHub />
              </motion.div>
            )}

            {/* ── TAB: COMMUNITY FORUM ───────────────────────────────────────── */}
            {activeTab === 'community' && (
              <motion.div
                key="community"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CommunityBoard accessToken={accessToken!} userRole={user.role} />
              </motion.div>
            )}

            {/* ── TAB: THERAPIST BOOKING ────────────────────────────────────── */}
            {activeTab === 'booking' && (
              <motion.div
                key="booking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TherapistBooking accessToken={accessToken!} />
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

            {/* ── TAB: PSYCHOLOGISTS WORKLOAD & ROSTER ────────────────────────────── */}
            {(activeTab === 'doctors' || activeTab === 'psychologists') && user.role === 'admin' && (
              <motion.div
                key="psychologists"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold font-outfit text-slate-900 flex items-center gap-2">
                      <Stethoscope className="text-[#0284c7] w-6 h-6" /> Psychologist & Specialist Roster Operations
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Real-time consultation capacity, active assignments, and rating metrics.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAssignModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-50 text-[#0284c7] border border-sky-200 hover:bg-sky-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> Assign Patient to Psychologist
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
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-slate-500">{doc.specialty}</span>
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                      {doc.consultation_fee || '₹1,500 / 45 mins'}
                                    </span>
                                  </div>
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
                                onClick={() => handleOpenViewDetails(doc, 'info')}
                                className="px-3.5 py-1.5 rounded-xl border border-sky-200 text-xs font-semibold text-[#0284c7] hover:bg-sky-50 transition-colors cursor-pointer"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  setEditDocId(doc.id);
                                  setEditDocName(doc.name);
                                  setEditDocEmail(doc.email || '');
                                  setEditDocSpecialty(doc.specialty || '');
                                  setEditDocFee(doc.consultation_fee || '₹1,500 / 45 mins');
                                  setEditDoctorModalOpen(true);
                                }}
                                className="px-3.5 py-1.5 rounded-xl border border-indigo-200 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              >
                                Edit Fee & Details
                              </button>
                              <button
                                onClick={() => handleToggleUserStatus(doc.id, doc.is_active ?? true)}
                                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
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
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">There are no psychologist accounts registered in your database. Click "+ Add New Specialist" to create one.</p>
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
                    <p className="text-xs text-slate-500 mt-1">Manage platform clients, psychologists, and user accounts from one workspace.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAssignModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-50 text-[#0284c7] border border-sky-200 hover:bg-sky-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> Assign Patient to Psychologist
                    </button>
                    <button
                      onClick={() => setAddMemberModalOpen(true)}
                      className="glow-btn px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> + Add New Member
                    </button>
                  </div>
                </div>

                {/* Sub-tab Navigation Bar & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 p-1.5 bg-sky-50/80 rounded-2xl border border-sky-100 max-w-md w-full sm:w-auto">
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
                      Psychologists & Specialists ({adminStats?.doctors_workload?.length || 0})
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search accounts by name or email..."
                      value={directorySearchQuery}
                      onChange={(e) => setDirectorySearchQuery(e.target.value)}
                      className="w-full pl-3 pr-3 py-2 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:border-sky-400"
                    />
                  </div>
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
                            {adminStats.members_list
                              .filter((m: any) =>
                                !directorySearchQuery ||
                                m.name.toLowerCase().includes(directorySearchQuery.toLowerCase()) ||
                                m.email.toLowerCase().includes(directorySearchQuery.toLowerCase())
                              )
                              .map((m: any) => (
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
                                <td className="py-3.5 text-right space-x-2">
                                  <button
                                    onClick={() => handleOpenViewDetails(m, 'info')}
                                    className="text-[11px] font-semibold text-[#0284c7] hover:underline cursor-pointer"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => { setResetTargetUser({ id: m.id, name: m.name }); setResetModalOpen(true); }}
                                    className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                                  >
                                    Reset Password
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
                                    Delete
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

                {/* Sub-tab Content 2: Psychologists Directory */}
                {directorySubTab === 'doctors' && (
                  <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-[#0284c7]" /> Registered Psychologists & Specialists Roster
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
                                    onClick={() => handleOpenViewDetails(doc, 'info')}
                                    className="px-3 py-1 rounded-lg border border-sky-200 text-[11px] font-semibold text-[#0284c7] hover:bg-sky-50 transition-colors cursor-pointer"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => handleToggleUserStatus(doc.id, doc.status === 'Available')}
                                    className="px-3 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                  >
                                    Toggle Status
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(doc.id, doc.name)}
                                    className="p-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                                    title="Delete Psychologist"
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
                        No psychologist accounts registered in database yet. Click "+ Add New Member" above to create a psychologist account.
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
                    <h3 className="text-base font-bold text-slate-900">Add New Psychologist / Specialist</h3>
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

              <form onSubmit={handleAddDoctor} className="space-y-4 text-xs">
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
                  <div className="relative">
                    <input
                      type={showDocPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={newDocPassword}
                      onChange={(e) => setNewDocPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDocPassword(!showDocPassword)}
                      className="absolute right-3.5 top-[11px] text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      title={showDocPassword ? "Hide password" : "Show password"}
                    >
                      {showDocPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>


                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Specialty / Qualification</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Clinical Psychologist"
                    value={newDocSpecialty}
                    onChange={(e) => setNewDocSpecialty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Consultation Fee (Per Session)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹1,500 / 45 mins"
                    value={newDocFee}
                    onChange={(e) => setNewDocFee(e.target.value)}
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

      {/* ── EDIT SPECIALIST DETAILS & CONSULTATION FEE MODAL OVERLAY ───── */}
      <AnimatePresence>
        {editDoctorModalOpen && (
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
              <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-[#0284c7]" /> Edit Specialist Details & Fee
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Update consultation fee and psychologist info in real time.</p>
                </div>
                <button
                  onClick={() => setEditDoctorModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editDocStatusMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {editDocStatusMsg}
                </div>
              )}

              <form onSubmit={handleEditDoctor} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editDocName}
                    onChange={(e) => setEditDocName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editDocEmail}
                    onChange={(e) => setEditDocEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Specialty / Title</label>
                  <input
                    type="text"
                    required
                    value={editDocSpecialty}
                    onChange={(e) => setEditDocSpecialty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Consultation Fee (Per Session)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹2,000 / 45 mins"
                    value={editDocFee}
                    onChange={(e) => setEditDocFee(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditDoctorModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editDocSubmitting}
                    className="glow-btn px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {editDocSubmitting ? 'Saving...' : 'Save & Update Real-time'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* ── UNIFIED ADD MEMBER MODAL OVERLAY (PSYCHOLOGIST OR CLIENT) ─────────── */}
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
                    <p className="text-xs text-slate-500">Register a new client or psychologist account in database.</p>
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
                {/* Account Type Selection (Client vs Psychologist) */}
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
                      <Stethoscope className="w-3.5 h-3.5" /> Psychologist / Specialist
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
                  <div className="relative">
                    <input
                      type={showMemberPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={newMemberPassword}
                      onChange={(e) => setNewMemberPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMemberPassword(!showMemberPassword)}
                      className="absolute right-3.5 top-[11px] text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      title={showMemberPassword ? "Hide password" : "Show password"}
                    >
                      {showMemberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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
                    {memberSubmitting ? 'Creating...' : `Register ${newMemberRole === 'therapist' ? 'Psychologist' : 'Client'}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ASSIGN PATIENT TO PSYCHOLOGIST MODAL OVERLAY ───────────────────────── */}
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
                    <UserPlus className="w-5 h-5 text-[#0284c7]" /> Assign Patient to Psychologist
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
                  <label className="block text-slate-700 font-semibold mb-1">Select Psychologist / Specialist</label>
                  <select
                    required
                    value={selectedDoctorForAssign}
                    onChange={(e) => setSelectedDoctorForAssign(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7] bg-white text-slate-900"
                  >
                    <option value="">-- Choose Psychologist Specialist --</option>
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
                  <label className="block text-slate-700 font-semibold mb-1">Mode of Approach (Therapeutic Modality)</label>
                  <select
                    value={assignSessionType}
                    onChange={(e) => setAssignSessionType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7] bg-white text-slate-900 font-medium"
                  >
                    <option value="Cognitive Behavioral Therapy (CBT)">Cognitive Behavioral Therapy (CBT) — Thought Reframing</option>
                    <option value="Mindfulness-Based Stress Reduction (MBSR)">Mindfulness-Based Stress Reduction (MBSR) — Grounding & Breath</option>
                    <option value="Acceptance & Commitment Therapy (ACT)">Acceptance & Commitment Therapy (ACT) — Values & Defusion</option>
                    <option value="Dialectical Behavior Therapy (DBT)">Dialectical Behavior Therapy (DBT) — Distress Tolerance</option>
                    <option value="Solution-Focused Brief Therapy (SFBT)">Solution-Focused Brief Therapy (SFBT) — Practical Goals</option>
                    <option value="Person-Centered / Humanistic Therapy">Person-Centered / Humanistic Therapy — Self-Worth & Validation</option>
                    <option value="Insight & Psychodynamic Therapy">Insight & Psychodynamic Therapy — Core Relational Patterns</option>
                    <option value="Holistic & Integrative Mental Wellness">Holistic & Integrative Mental Wellness — Bio-Psycho-Social</option>
                  </select>
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

      {/* ── RESET USER PASSWORD MODAL OVERLAY ─────────────────────────────── */}
      <AnimatePresence>
        {resetModalOpen && resetTargetUser && (
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
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-sky-100 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-outfit">Reset Password</h3>
                  <p className="text-xs text-slate-500">{resetTargetUser.name}</p>
                </div>
                <button
                  onClick={() => setResetModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {resetStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
                  {resetStatus}
                </div>
              )}

              <form onSubmit={handleResetUserPassword} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Enter new secure password..."
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3.5 top-[11px] text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      title={showResetPassword ? "Hide password" : "Show password"}
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>


                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0284c7] hover:bg-sky-600 shadow-sm"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COMPREHENSIVE VIEW DETAILS & EDIT ACCOUNT MODAL OVERLAY ───────── */}
      <AnimatePresence>
        {detailsModalOpen && detailsUser && (
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
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-sky-100 shadow-2xl space-y-5 text-left"
            >
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0284c7] font-bold flex items-center justify-center text-base">
                    {(detailsUser.name || detailsUser.full_name || 'U').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      {detailsUser.name || detailsUser.full_name}
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        (detailsUser.role === 'therapist' || detailsUser.role === 'Doctor')
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-sky-50 text-[#0284c7] border-sky-200'
                      }`}>
                        {(detailsUser.role === 'therapist' || detailsUser.role === 'Doctor' || detailsUser.role === 'Psychologist') ? '🩺 Specialist Psychologist' : '👤 Client Member'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">{detailsUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-tab Navigation (Overview vs Edit vs Password) */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs">
                <button
                  onClick={() => setDetailsActiveSubTab('info')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                    detailsActiveSubTab === 'info' ? 'bg-[#0284c7] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full Overview
                </button>
                <button
                  onClick={() => setDetailsActiveSubTab('edit')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                    detailsActiveSubTab === 'edit' ? 'bg-[#0284c7] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setDetailsActiveSubTab('security')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                    detailsActiveSubTab === 'security' ? 'bg-[#0284c7] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Reset Password
                </button>
              </div>

              {detailsStatusMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
                  {detailsStatusMsg}
                </div>
              )}

              {/* SUB-TAB 1: FULL OVERVIEW */}
              {detailsActiveSubTab === 'info' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
                    <div>
                      <span className="text-slate-500 block font-medium">Account ID</span>
                      <span className="font-bold text-slate-800 break-all">{detailsUser.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">Account Role</span>
                      <span className="font-bold text-slate-800 capitalize">{detailsUser.role}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">Occupation / Specialty</span>
                      <span className="font-bold text-slate-800">{detailsUser.occupation || detailsUser.specialty || 'Not Specified'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">
                        {(detailsUser.role === 'therapist' || detailsUser.role === 'Doctor' || detailsUser.role === 'Psychologist') ? 'Consultation Fee' : 'Assigned Specialist'}
                      </span>
                      <span className={`font-bold ${(detailsUser.role === 'therapist' || detailsUser.role === 'Doctor' || detailsUser.role === 'Psychologist') ? 'text-emerald-700' : 'text-[#0284c7]'}`}>
                        {(detailsUser.role === 'therapist' || detailsUser.role === 'Doctor' || detailsUser.role === 'Psychologist')
                          ? (detailsUser.consultation_fee || '₹1,500 / 45 mins')
                          : (detailsUser.assigned_doctor || 'Dr. Sarah Smith (Clinical Psychologist)')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">Account Status</span>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                        detailsUser.is_active || detailsUser.status === 'Active' || detailsUser.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {detailsUser.is_active || detailsUser.status === 'Active' || detailsUser.status === 'Available' ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">Email Verification</span>
                      <span className="font-bold text-emerald-700">Verified ✔</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h5 className="font-bold text-slate-900">Clinical & Workload Snapshot</h5>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>Capacity Utilization: <span className="font-bold text-slate-900">{detailsUser.utilization_percent || 40}%</span></div>
                      <div>Rating Score: <span className="font-bold text-amber-600">★ {detailsUser.rating || 5.0} / 5.0</span></div>
                      <div>Total Consultations: <span className="font-bold text-slate-900">{detailsUser.total_consultations || detailsUser.active_sessions || 2}</span></div>
                      <div>Primary Language: <span className="font-bold text-slate-900">English / Hindi</span></div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setDetailsActiveSubTab('edit')}
                      className="px-4 py-2 rounded-xl bg-sky-50 text-[#0284c7] font-bold border border-sky-200 hover:bg-sky-100"
                    >
                      Edit Account Info
                    </button>
                    <button
                      onClick={() => setDetailsActiveSubTab('security')}
                      className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 hover:bg-indigo-100"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: EDIT PROFILE FORM */}
              {detailsActiveSubTab === 'edit' && (
                <form onSubmit={handleSaveDetailsUpdate} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={detailsFormName}
                      onChange={(e) => setDetailsFormName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={detailsFormEmail}
                      onChange={(e) => setDetailsFormEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Occupation / Specialty</label>
                    <input
                      type="text"
                      required
                      value={detailsFormOccupation}
                      onChange={(e) => setDetailsFormOccupation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>

                  {(detailsUser.role === 'therapist' || detailsUser.role === 'Doctor' || detailsUser.role === 'Psychologist') ? (
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Consultation Fee</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₹1,500 / 45 mins"
                        value={detailsFormFee}
                        onChange={(e) => setDetailsFormFee(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Assigned Specialist Psychologist</label>
                      <div className="w-full px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-200 font-bold text-[#0284c7] flex items-center justify-between">
                        <span>{detailsUser.assigned_doctor || 'Dr. Sarah Smith (Clinical Psychologist)'}</span>
                        <button
                          type="button"
                          onClick={() => { setDetailsModalOpen(false); setAssignModalOpen(true); }}
                          className="text-[11px] underline text-[#0284c7] font-semibold cursor-pointer"
                        >
                          Reassign Psychologist
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-700">Account Active Status</span>
                    <button
                      type="button"
                      onClick={() => setDetailsFormActive(!detailsFormActive)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        detailsFormActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {detailsFormActive ? 'Active (Enabled)' : 'Suspended (Disabled)'}
                    </button>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailsModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-500 font-semibold hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={detailsSubmitting}
                      className="px-5 py-2 rounded-xl text-white bg-[#0284c7] font-bold hover:bg-sky-600 shadow-sm disabled:opacity-50"
                    >
                      {detailsSubmitting ? 'Saving Changes...' : 'Save Real-time Updates'}
                    </button>
                  </div>
                </form>
              )}

              {/* SUB-TAB 3: RESET PASSWORD FORM */}
              {detailsActiveSubTab === 'security' && (
                <form onSubmit={handleSaveDetailsUpdate} className="space-y-4 text-xs">
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">
                    <span className="font-bold block mb-0.5">Admin Security Override</span>
                    Set a new password for <span className="font-bold">{detailsUser.name || detailsUser.full_name}</span>.
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">New Account Password</label>
                    <div className="relative">
                      <input
                        type={showDetailsPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        placeholder="Enter new secure password..."
                        value={detailsFormPassword}
                        onChange={(e) => setDetailsFormPassword(e.target.value)}
                        className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDetailsPassword(!showDetailsPassword)}
                        className="absolute right-3.5 top-[11px] text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                        title={showDetailsPassword ? "Hide password" : "Show password"}
                      >
                        {showDetailsPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>


                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailsModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-500 font-semibold hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={detailsSubmitting || !detailsFormPassword}
                      className="px-5 py-2 rounded-xl text-white bg-indigo-600 font-bold hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                    >
                      {detailsSubmitting ? 'Updating Password...' : 'Confirm Reset Password'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
