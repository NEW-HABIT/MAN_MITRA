"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageSquare, Heart, ShieldAlert, Plus, Send, AlertCircle,
  CheckCircle2, Sparkles, Filter, Lock, Trash2, Eye, Flag
} from 'lucide-react';
import { API_URL } from '@/config';

interface CommunityBoardProps {
  accessToken?: string;
  userRole?: string;
}

export default function CommunityBoard({ accessToken, userRole }: CommunityBoardProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostModal, setNewPostModal] = useState(false);

  // New Post Form
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('General Support');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  // Comment input state per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPosts();
  }, [accessToken]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      if (accessToken) {
        const res = await fetch(`${API_URL}/api/auth/community/posts/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPosts(data);
            setLoading(false);
            return;
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch community posts:', e);
    }
    setLoading(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    setSubmitting(true);
    try {
      if (accessToken) {
        const res = await fetch(`${API_URL}/api/auth/community/posts/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: postTitle,
            content: postContent,
            category: postCategory,
            is_anonymous: isAnonymous,
          }),
        });
        if (res.ok) {
          setNotice('✔ Discussion post published successfully!');
          fetchPosts();
          setNewPostModal(false);
          setPostTitle('');
          setPostContent('');
          setTimeout(() => setNotice(''), 3000);
          setSubmitting(false);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to create post:', e);
    }

    setSubmitting(false);
  };

  const handleLikePost = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
    try {
      if (accessToken) {
        await fetch(`${API_URL}/api/auth/community/posts/${postId}/like/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
    } catch (e) {
      console.error('Error liking post:', e);
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      if (accessToken) {
        const res = await fetch(`${API_URL}/api/auth/community/comments/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ post_id: postId, content: content }),
        });
        if (res.ok) {
          const newComment = await res.json();
          setPosts(prev => prev.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                comments: [...(p.comments || []), newComment]
              };
            }
            return p;
          }));
          setCommentInputs(prev => ({ ...prev, [postId]: '' }));
          return;
        }
      }
    } catch (e) {
      console.error('Error commenting:', e);
    }
  };


  return (
    <div className="space-y-6 text-left pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4 text-sky-400" /> Anonymous Peer Support Forum
          </div>
          <h2 className="text-2xl font-extrabold font-outfit text-white">Community Discussions</h2>
          <p className="text-sm text-slate-300 font-normal max-w-xl leading-relaxed">
            A safe, moderated space to share experiences, ask questions, and support peers on your mental health journey.
          </p>
        </div>
        <button
          onClick={() => setNewPostModal(true)}
          className="px-5 py-3 rounded-2xl bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-bold shadow-lg shadow-sky-500/30 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Start Discussion
        </button>
      </div>

      {notice && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold">
          {notice}
        </motion.div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-[#0284c7] text-[10px] font-bold">{post.category}</span>
                <span className="font-semibold text-slate-700">{post.author_alias}</span>
              </div>
              <span>{post.created_at}</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-outfit">{post.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{post.content}</p>
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <button onClick={() => handleLikePost(post.id)} className="flex items-center gap-1.5 hover:text-red-500 font-semibold transition-colors">
                <Heart className="w-4 h-4 text-red-500 fill-red-500/20" /> {post.likes_count} Support
              </button>
              <span className="flex items-center gap-1.5 font-medium">
                <MessageSquare className="w-4 h-4 text-sky-500" /> {post.comments?.length || 0} Replies
              </span>
            </div>

            {/* Comments Thread */}
            {post.comments && post.comments.length > 0 && (
              <div className="space-y-2 pt-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                {post.comments.map((c: any) => (
                  <div key={c.id} className="text-xs space-y-0.5 border-b border-slate-200/60 last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{c.author_alias}</span>
                      <span className="text-slate-400">{c.created_at}</span>
                    </div>
                    <p className="text-slate-600">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Write a supportive reply..."
                value={commentInputs[post.id] || ''}
                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                className="flex-1 px-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-400"
              />
              <button onClick={() => handleAddComment(post.id)} className="p-2 rounded-xl bg-[#0284c7] text-white hover:bg-sky-600">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Post Modal */}
      {newPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 font-outfit">Start a Discussion</h3>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Summarize your question or topic..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border text-xs focus:ring-2 focus:ring-sky-400/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border text-xs bg-white"
                >
                  <option>General Support</option>
                  <option>Work & Stress</option>
                  <option>Anxiety & Panic</option>
                  <option>Recovery Wins</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your thoughts..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full p-3 rounded-xl border text-xs focus:ring-2 focus:ring-sky-400/20"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border">
                <span className="text-xs font-semibold text-slate-700">Post Anonymously</span>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-[#0284c7]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setNewPostModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 text-xs font-bold text-white bg-[#0284c7] hover:bg-sky-600 rounded-xl">
                  {submitting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
