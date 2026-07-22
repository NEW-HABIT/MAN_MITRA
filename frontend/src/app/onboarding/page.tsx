"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShieldCheck, Heart, Moon, Smile, Sparkles } from 'lucide-react';
import { API_URL } from '@/config';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, accessToken, updateUser, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Form State
  const [demographics, setDemographics] = useState({
    date_of_birth: '2000-01-01',
    gender: 'PNS',
    occupation: '',
  });

  const [sleep, setSleep] = useState({
    bedtime: '22:30',
    wake_time: '06:30',
  });
  const [stressLevel, setStressLevel] = useState(5);
  const [goals, setGoals] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<string[]>([]);

  const goalsList = [
    "Reduce daily anxiety",
    "Improve sleep quality",
    "Build emotional resilience",
    "Manage work stress",
    "Increase self-compassion",
    "Practice mindfulness",
  ];

  const prefsList = [
    "Mindful breathing exercises",
    "Private reflective journaling",
    "Daily routine check-ins",
    "Guided progressive relaxation",
  ];

  const handleGoalToggle = (goal: string) => {
    setGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  const handlePrefToggle = (pref: string) => {
    setPrefs(prev => prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // 1. Update Profile (demographics)
      const profileRes = await fetch(`${API_URL}/api/auth/me/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(demographics),
      });

      if (!profileRes.ok) throw new Error('Failed to save demographic data.');

      // 2. Update Wellness Profile (sleep, stress, goals, preferences)
      const wellnessRes = await fetch(`${API_URL}/api/auth/me/wellness/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          sleep_schedule: sleep,
          stress_level: stressLevel,
          primary_goals: goals,
          wellness_preferences: prefs,
          onboarding_done: true,
        }),
      });

      if (!wellnessRes.ok) throw new Error('Failed to save wellness configuration.');

      // 3. Trigger wellness plan generation
      const genRes = await fetch(`${API_URL}/api/wellness/plans/generate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!genRes.ok) throw new Error('Failed to generate initial wellness plan.');

      const wellnessData = await wellnessRes.json();
      
      // Update local state store
      updateUser({
        ...demographics,
        wellness_profile: wellnessData,
      });

      router.push('/dashboard');
    } catch (e) {
      alert(e || 'An error occurred during onboarding setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#090e0c] px-4 py-12">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#12b886] opacity-[0.05] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#12b886] opacity-[0.03] blur-[130px] pointer-events-none" />

      <div className="w-full max-w-xl glass-panel p-8 rounded-3xl relative z-10">
        
        {/* Onboarding Progress Header */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Step {step} of 3
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-[#12b886]' : 'bg-[#0e1714]'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: DEMOGRAPHICS */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><Smile className="text-[#12b886] w-6 h-6" /> Tell us about yourself</h2>
                <p className="text-xs text-slate-400 mt-1">This helps us tailor suggestions based on your daily routine context.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    required
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                    value={demographics.date_of_birth}
                    onChange={(e) => setDemographics({ ...demographics, date_of_birth: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Gender Identification</label>
                  <select
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                    value={demographics.gender}
                    onChange={(e) => setDemographics({ ...demographics, gender: e.target.value })}
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="NB">Non-Binary</option>
                    <option value="PNS">Prefer Not to Say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Occupation</label>
                  <input
                    type="text"
                    required
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                    placeholder="e.g. Student, Software Engineer, Designer"
                    value={demographics.occupation}
                    onChange={(e) => setDemographics({ ...demographics, occupation: e.target.value })}
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!demographics.date_of_birth || !demographics.occupation}
                className="w-full glow-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 mt-6 cursor-pointer disabled:opacity-50"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: STRESS & SLEEP */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><Moon className="text-[#12b886] w-6 h-6" /> Stress & Sleep</h2>
                <p className="text-xs text-slate-400 mt-1">Mental resilience is heavily linked to sleep and active stressors.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-slate-400">Current Stress Level</label>
                    <span className="text-sm font-bold text-[#12b886]">{stressLevel}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    className="w-full accent-[#12b886] bg-[rgba(18,184,134,0.1)] rounded-lg appearance-none h-2 cursor-pointer"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                    <span>Calm / Relaxed</span>
                    <span>Highly Stressed</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Bedtime</label>
                    <input
                      type="time"
                      className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                      value={sleep.bedtime}
                      onChange={(e) => setSleep({ ...sleep, bedtime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Wake Time</label>
                    <input
                      type="time"
                      className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                      value={sleep.wake_time}
                      onChange={(e) => setSleep({ ...sleep, wake_time: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 glass-panel py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 glow-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: GOALS & PREFERENCES */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="text-[#12b886] w-6 h-6" /> Sanctuary Preferences</h2>
                <p className="text-xs text-slate-400 mt-1">Select the tools and goals you want to prioritize in your sanctuary.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Primary Goals (Select any)</h3>
                  <div className="flex flex-wrap gap-2">
                    {goalsList.map((g) => {
                      const selected = goals.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleGoalToggle(g)}
                          className={`px-3 py-2 rounded-xl text-xs transition-all border cursor-pointer ${
                            selected 
                              ? 'bg-[#12b886] bg-opacity-20 border-[#12b886] text-[#e6f0ed]' 
                              : 'glass-panel border-transparent hover:border-[#12b886] border-opacity-30'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Preferred Exercises (Select any)</h3>
                  <div className="flex flex-wrap gap-2">
                    {prefsList.map((p) => {
                      const selected = prefs.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handlePrefToggle(p)}
                          className={`px-3 py-2 rounded-xl text-xs transition-all border cursor-pointer ${
                            selected 
                              ? 'bg-[#12b886] bg-opacity-20 border-[#12b886] text-[#e6f0ed]' 
                              : 'glass-panel border-transparent hover:border-[#12b886] border-opacity-30'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  disabled={loading}
                  onClick={() => setStep(2)}
                  className="flex-1 glass-panel py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  disabled={loading || goals.length === 0 || prefs.length === 0}
                  onClick={handleComplete}
                  className="flex-1 glow-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Creating sanctuary...' : 'Create Sanctuary'}
                  {!loading && <ShieldCheck className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
