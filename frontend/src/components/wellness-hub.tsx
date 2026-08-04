"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Play, Pause, RotateCcw, Volume2, Moon, Sun, Heart,
  BookOpen, Music, Activity, Check, Wind, Flame, Compass, ChevronRight
} from 'lucide-react';

export default function WellnessHub() {
  const [activeTab, setActiveTab] = useState<'meditation' | 'breathing' | 'yoga' | 'sounds' | 'affirmations' | 'articles'>('meditation');

  // Meditation State
  const [isPlayingMeditation, setIsPlayingMeditation] = useState(false);
  const [meditationTime, setMeditationTime] = useState(600); // 10 mins
  const [activeTrack, setActiveTrack] = useState('Anxiety Release & Deep Breath');

  // Breathing State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingTimer, setBreathingTimer] = useState(4);

  // Affirmations State
  const [affirmationIdx, setAffirmationIdx] = useState(0);

  const AFFIRMATIONS = [
    "I am grounded, calm, and in control of my mind.",
    "My peace is my power, and I release all anxiety.",
    "I honor my emotions without letting them overwhelm me.",
    "Every breath I take brings clarity, healing, and strength.",
    "I am worthy of rest, healing, and happiness."
  ];

  const ARTICLES = [
    { title: "Understanding Cognitive Reframing", category: "CBT Techniques", readTime: "5 min read", snippet: "Learn how to catch automatic negative thoughts (ANTs) and replace them with realistic, balanced perspectives." },
    { title: "The Science of Sleep Hygiene", category: "Sleep Science", readTime: "7 min read", snippet: "Restructuring your evening routine to regulate circadian rhythms and reduce midnight insomnia." },
    { title: "Managing Panic Attacks in Real-Time", category: "Crisis Protocol", readTime: "4 min read", snippet: "The 5-4-3-2-1 sensory grounding rule to de-escalate acute anxiety peaks immediately." },
  ];

  // Meditation countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isPlayingMeditation && meditationTime > 0) {
      interval = setInterval(() => {
        setMeditationTime(t => t - 1);
      }, 1000);
    } else if (meditationTime === 0) {
      setIsPlayingMeditation(false);
    }
    return () => clearInterval(interval);
  }, [isPlayingMeditation, meditationTime]);

  // Breathing animation cycle effect
  useEffect(() => {
    let timer: any = null;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathingPhase(prev => {
          if (prev === 'Inhale') return 'Hold';
          if (prev === 'Hold') return 'Exhale';
          if (prev === 'Exhale') return 'Rest';
          return 'Inhale';
        });
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-sky-400" /> Comprehensive Self-Care Hub
          </div>
          <h2 className="text-2xl font-extrabold font-outfit text-white">Wellness & Relaxation Hub</h2>
          <p className="text-sm text-slate-300 font-normal max-w-xl leading-relaxed">
            Guided meditation, 4-7-8 breathing visualizer, ambient sleep sounds, yoga guides, daily affirmations, and mental health articles.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'meditation', label: 'Guided Meditation', icon: Wind },
          { id: 'breathing', label: 'Breathing Visualizer', icon: Activity },
          { id: 'yoga', label: 'Yoga & Somatics', icon: Flame },
          { id: 'sounds', label: 'Sleep & Ambient Sounds', icon: Music },
          { id: 'affirmations', label: 'Daily Affirmations', icon: Heart },
          { id: 'articles', label: 'Wellness Library', icon: BookOpen },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20'
                  : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Guided Meditation */}
      {activeTab === 'meditation' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-gradient-to-br from-sky-50 via-indigo-50/50 to-white border border-sky-100">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Active Session</span>
              <h3 className="text-xl font-bold text-slate-900 font-outfit">{activeTrack}</h3>
              <p className="text-xs text-slate-500 max-w-sm">Deep somatic relaxation exercise designed to slow heart rate and clear mental clutter.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl font-extrabold text-[#0284c7] font-outfit tracking-wider">
                {formatTime(meditationTime)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPlayingMeditation(!isPlayingMeditation)}
                  className="px-6 py-3 rounded-2xl bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-bold shadow-lg shadow-sky-500/30 flex items-center gap-2"
                >
                  {isPlayingMeditation ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlayingMeditation ? 'Pause Session' : 'Start Session'}
                </button>
                <button
                  onClick={() => { setIsPlayingMeditation(false); setMeditationTime(600); }}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Guided Track</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: 'Anxiety Release & Deep Breath', duration: '10 Mins', category: 'Stress Relief' },
                { title: 'Sleep Preparation & Body Scan', duration: '15 Mins', category: 'Bedtime Rest' },
                { title: 'Morning Clarity & Focus', duration: '8 Mins', category: 'Mindfulness' },
              ].map((track, i) => (
                <div
                  key={i}
                  onClick={() => { setActiveTrack(track.title); setMeditationTime(i === 1 ? 900 : i === 2 ? 480 : 600); setIsPlayingMeditation(false); }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    activeTrack === track.title
                      ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-400/20'
                      : 'bg-slate-50/60 border-slate-100 hover:border-sky-200'
                  }`}
                >
                  <span className="text-[10px] font-semibold text-sky-600 uppercase">{track.category}</span>
                  <h5 className="text-xs font-bold text-slate-900 pt-1">{track.title}</h5>
                  <span className="text-[11px] text-slate-400 font-medium block pt-1">{track.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Breathing Visualizer */}
      {activeTab === 'breathing' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl bg-white border border-sky-100 shadow-sm text-center space-y-6">
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900 font-outfit">Box & 4-7-8 Breathing Visualizer</h3>
            <p className="text-xs text-slate-500">Sync your breath with the expanding circle to reset your nervous system.</p>
          </div>

          <div className="py-8 flex flex-col items-center justify-center">
            <motion.div
              animate={{
                scale: breathingPhase === 'Inhale' ? 1.4 : breathingPhase === 'Hold' ? 1.4 : 0.9,
              }}
              transition={{ duration: 3.8, ease: "easeInOut" }}
              className="w-44 h-44 rounded-full bg-gradient-to-tr from-[#0284c7] via-sky-400 to-indigo-500 shadow-xl shadow-sky-500/30 flex items-center justify-center text-white p-4"
            >
              <div className="text-center space-y-1">
                <span className="text-xl font-extrabold font-outfit uppercase tracking-wider">{isBreathingActive ? breathingPhase : 'Ready'}</span>
                <span className="text-xs text-sky-100 block">{isBreathingActive ? 'Breathe Smoothly' : 'Click Start'}</span>
              </div>
            </motion.div>
          </div>

          <button
            onClick={() => setIsBreathingActive(!isBreathingActive)}
            className="px-8 py-3 rounded-2xl bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-bold shadow-lg shadow-sky-500/30"
          >
            {isBreathingActive ? 'Stop Exercise' : 'Start Breathing Exercise'}
          </button>
        </motion.div>
      )}

      {/* Tab 3: Yoga & Somatics */}
      {activeTab === 'yoga' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Gentle Neck & Shoulder Release', duration: '8 mins', level: 'Beginner', steps: ['Sit upright', 'Roll shoulders back slowly 5x', 'Tilt head right for 20s', 'Repeat left'] },
            { title: 'Child’s Pose for Nervous System Calm', duration: '10 mins', level: 'Restorative', steps: ['Kneel on mat', 'Lower hips to heels', 'Extend arms forward', 'Deep belly breathing for 3 mins'] },
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-[#0284c7] text-[10px] font-bold">{item.level}</span>
                <span className="text-[11px] text-slate-400 font-medium">{item.duration}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {item.steps.map((st, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> {st}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      )}

      {/* Tab 4: Sleep Sounds */}
      {activeTab === 'sounds' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 font-outfit">Ambient Soundscape Mixer</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Gentle Rain', icon: Moon },
              { name: 'Ocean Waves', icon: Activity },
              { name: 'Night Forest', icon: Wind },
              { name: 'Soft Piano', icon: Music },
            ].map((snd, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-sky-300 text-center space-y-2 cursor-pointer">
                <snd.icon className="w-6 h-6 text-[#0284c7] mx-auto" />
                <span className="text-xs font-bold text-slate-800 block">{snd.name}</span>
                <button className="px-3 py-1 bg-sky-50 text-[#0284c7] text-[10px] font-bold rounded-lg hover:bg-sky-100">Play Track</button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab 5: Affirmations */}
      {activeTab === 'affirmations' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl bg-gradient-to-br from-sky-900 to-indigo-950 text-white text-center space-y-6 shadow-xl">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Daily Affirmation Card</span>
            <h3 className="text-2xl font-bold font-outfit max-w-lg mx-auto italic">"{AFFIRMATIONS[affirmationIdx]}"</h3>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setAffirmationIdx((affirmationIdx + 1) % AFFIRMATIONS.length)}
              className="px-6 py-2.5 rounded-2xl bg-white text-slate-900 text-xs font-bold hover:bg-sky-50 flex items-center gap-2"
            >
              Next Affirmation <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab 6: Wellness Articles */}
      {activeTab === 'articles' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ARTICLES.map((art, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-[#0284c7] text-[10px] font-bold">{art.category}</span>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{art.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-3">{art.snippet}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>{art.readTime}</span>
                <button className="text-[#0284c7] font-bold hover:underline">Read Article</button>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
