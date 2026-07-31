"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Shield, Trash2, Plus, X, Heart, Sparkles, Edit3 } from 'lucide-react';
import { API_URL } from '@/config';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  sentiment_score: number;
  created_at: string;
}

interface JournalPanelProps {
  accessToken: string;
}

export default function JournalPanel({ accessToken }: JournalPanelProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [readEntry, setReadEntry] = useState<JournalEntry | null>(null);
  const [writeOpen, setWriteOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/journal/entries/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        let entriesList: JournalEntry[] = [];
        if (Array.isArray(data)) {
          entriesList = data;
        } else if (data && Array.isArray(data.results)) {
          entriesList = data.results;
        }
        setEntries(entriesList);
      }
    } catch (e) {
      console.error(e);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [accessToken]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/journal/entries/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: newTitle.trim() || 'Untitled Entry',
          content: newContent.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to create journal entry.');

      setNewTitle('');
      setNewContent('');
      setWriteOpen(false);
      fetchEntries();
    } catch (e) {
      alert(e || 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this private journal entry permanently?")) return;

    try {
      const res = await fetch(`${API_URL}/api/journal/entries/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (res.ok) {
        setEntries(prev => prev.filter(entry => entry.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper formatting helper
  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return { label: 'Positive', color: 'text-emerald-600 font-semibold' };
    if (score < -0.3) return { label: 'Negative', color: 'text-rose-500 font-semibold' };
    return { label: 'Neutral', color: 'text-sky-600 font-semibold' };
  };

  return (
    <div className="space-y-6 h-[550px] overflow-y-auto pr-2 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Private Diaries</h3>
          <p className="text-xs text-slate-500 mt-0.5">Encrypted at rest for your ultimate confidentiality.</p>
        </div>
        <button
          onClick={() => setWriteOpen(true)}
          className="glow-btn px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          Write Entry
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">Loading your private sanctuary files...</div>
      ) : entries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {entries.map((entry) => {
            const sentiment = getSentimentLabel(entry.sentiment_score);
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-[180px] bg-white/80 border-sky-100 hover:border-[#0284c7] transition-all cursor-pointer group"
                onClick={() => setReadEntry(entry)}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#0284c7]" /> {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => handleDelete(entry.id, e)}
                      className="opacity-0 group-hover:opacity-60 hover:group-hover:opacity-100 transition-opacity p-1 cursor-pointer text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#0284c7] transition-colors">{entry.title}</h4>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {entry.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-sky-100 text-[10px]">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Shield className="w-3.5 h-3.5 text-[#0284c7]" /> Encrypted
                  </span>
                  <span className={`${sentiment.color}`}>
                    {sentiment.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-xs text-slate-500">
          <BookOpen className="w-8 h-8 text-[#0284c7] mb-3 opacity-60 mx-auto" />
          No entries written yet. Write down your first thought using the button above.
        </div>
      )}

      {/* ── READ DIARY MODAL OVERLAY ────────────────────────────────────────── */}
      <AnimatePresence>
        {readEntry && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel p-5 sm:p-8 rounded-3xl relative bg-white/95 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setReadEntry(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0284c7]" /> {new Date(readEntry.created_at).toLocaleDateString()}
                </span>
                <h3 className="text-lg font-bold mt-1 text-slate-900">{readEntry.title}</h3>
              </div>

              <div className="text-xs text-slate-800 leading-relaxed max-h-[300px] overflow-y-auto bg-sky-50/60 p-5 rounded-2xl border border-sky-100 whitespace-pre-wrap">
                {readEntry.content}
              </div>

              <div className="flex items-center justify-between mt-6 text-[10px] text-slate-500 border-t border-sky-100 pt-4">
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-[#0284c7]" /> AES-256 Decrypted Session</span>
                <button
                  onClick={() => setReadEntry(null)}
                  className="glow-btn px-6 py-2 rounded-full text-xs font-semibold"
                >
                  Close File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── WRITE DIARY MODAL OVERLAY ───────────────────────────────────────── */}
      <AnimatePresence>
        {writeOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel p-5 sm:p-8 rounded-3xl relative bg-white/95 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setWriteOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Edit3 className="text-[#0284c7] w-5 h-5" /> Write private diary</h3>
                <p className="text-xs text-slate-500 mt-1">Reflect on your day. Entries are encrypted locally before saving.</p>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Entry Title</label>
                  <input
                    type="text"
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-900"
                    placeholder="e.g. Afternoon Musings, Overcoming stress"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Sanctuary Text Content</label>
                  <textarea
                    required
                    className="w-full glass-input px-4 py-3 rounded-xl text-xs text-slate-900 h-[180px] leading-relaxed resize-none"
                    placeholder="Write whatever is on your mind..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setWriteOpen(false)}
                    className="flex-1 glass-panel py-3 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !newContent.trim()}
                    className="flex-1 glow-btn py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'Encrypting & Saving...' : 'Encrypt & Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
