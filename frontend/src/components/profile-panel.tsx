"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Phone, Key, ShieldCheck, CheckCircle2, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '@/config';
import { useAuthStore } from '@/store/auth-store';

export default function ProfilePanel() {
  const { user, accessToken, setAuth } = useAuthStore();

  // Profile form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passSaving, setPassSaving] = useState(false);

  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/me/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          occupation: occupation,
          phone_number: phoneNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }
      setAuth(data, accessToken!, localStorage.getItem('refresh_token') || '');
      setProfileSuccess('Profile details updated successfully!');
    } catch (err: any) {
      setProfileError(err.message || 'An error occurred while updating profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPassError('Password must be at least 8 characters long.');
      return;
    }

    setPassSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/password/change/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password.');
      }
      setPassSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'An error occurred while changing password.');
    } finally {
      setPassSaving(false);
    }
  };

  if (!user) return null;

  const roleTitle = user.role === 'admin' 
    ? 'Executive Administrator' 
    : user.role === 'therapist' 
    ? 'Wellness Specialist / Psychologist' 
    : 'Community Member';

  const roleBadgeColor = user.role === 'admin' 
    ? 'bg-purple-50 text-purple-700 border-purple-200' 
    : user.role === 'therapist' 
    ? 'bg-sky-50 text-[#0284c7] border-sky-200' 
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 text-left max-w-4xl mx-auto pb-10"
    >
      {/* Header Banner Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-[#0284c7] text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-sky-200">
            {user.full_name?.charAt(0) || 'M'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">{user.full_name}</h3>
              <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${roleBadgeColor}`}>
                {roleTitle}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
            </p>
          </div>
        </div>

        <div className="p-3 px-4 bg-sky-50/80 rounded-2xl border border-sky-100 text-xs text-slate-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
          <span>Account Security Status: <strong>Verified</strong></span>
        </div>
      </div>

      {/* Main Grid: Profile Details Form + Security Password Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Personal Profile Settings */}
        <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-sky-100">
            <User className="w-5 h-5 text-[#0284c7]" />
            <h4 className="text-sm font-bold text-slate-900">Personal Profile Information</h4>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {profileError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address (Read-only)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {user.role === 'therapist' ? 'Specialty / Qualification' : 'Occupation / Role'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={user.role === 'therapist' ? 'e.g. Cognitive Behavioral Specialist' : 'e.g. Software Engineer'}
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                />
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contact Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                />
                <Phone className="w-4 h-4 text-slate-[#0284c7] absolute left-3 top-3" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="glow-btn w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Security & Password Update */}
        <div className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-sky-100">
            <Key className="w-5 h-5 text-[#0284c7]" />
            <h4 className="text-sm font-bold text-slate-900">Security & Password</h4>
          </div>

          {passSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {passSuccess}
            </div>
          )}

          {passError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {passError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3.5 top-[11px] text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title={showOldPassword ? "Hide password" : "Show password"}
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-[11px] text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-[11px] text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>


            <div className="pt-2">
              <button
                type="submit"
                disabled={passSaving}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                {passSaving ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </motion.div>
  );
}
