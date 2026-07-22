"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Smile, X } from 'lucide-react';
import { API_URL } from '@/config';

interface MoodTrackerProps {
  accessToken: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MoodTracker({ accessToken, onClose, onSuccess }: MoodTrackerProps) {
  const [score, setScore] = useState(5);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const moodChoices = [
    { label: 'calm', emoji: '🌿', name: 'Calm' },
    { label: 'anxious', emoji: '😰', name: 'Anxious' },
    { label: 'sad', emoji: '🌧️', name: 'Sad' },
    { label: 'happy', emoji: '✨', name: 'Happy' },
    { label: 'neutral', emoji: '😐', name: 'Neutral' },
    { label: 'hopeful', emoji: '🌟', name: 'Hopeful' },
    { label: 'frustrated', emoji: '😤', name: 'Frustrated' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabel) {
      alert("Please select an emotion label.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/mood/logs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          mood_score: score,
          mood_label: selectedLabel,
          note,
        }),
      });

      if (!res.ok) throw new Error('Failed to log mood check-in.');

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to submit mood log.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg glass-panel p-8 rounded-3xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Smile className="text-[#12b886]" /> Mood Check-in</h2>
          <p className="text-xs text-slate-400 mt-1">Reflect on your current emotional state to compile trends.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Score Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400">Intensity Score</label>
              <span className="text-sm font-bold text-[#12b886]">{score}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              className="w-full accent-[#12b886] bg-[rgba(18,184,134,0.1)] rounded-lg appearance-none h-2 cursor-pointer"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            />
          </div>

          {/* Emotion Label Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-3">Dominant Emotion</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {moodChoices.map((item) => {
                const selected = selectedLabel === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSelectedLabel(item.label)}
                    className={`py-2 px-3 rounded-xl border text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selected 
                        ? 'bg-[#12b886] bg-opacity-20 border-[#12b886] text-[#e6f0ed]' 
                        : 'glass-panel border-transparent hover:border-[#12b886] border-opacity-30'
                    }`}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-[10px] font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Note (Optional)</label>
            <textarea
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm h-20 resize-none"
              placeholder="What is influencing your mood today? Write down any reflections..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass-panel py-3 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedLabel}
              className="flex-1 glow-btn py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Check-in'}
              {!loading && <Check className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
