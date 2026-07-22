"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageSquare, Plus, Trash2, Heart, ShieldAlert, X } from 'lucide-react';
import { API_URL, WS_URL } from '@/config';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

interface ChatSession {
  id: string;
  title: string;
  is_crisis: boolean;
}

interface ChatPanelProps {
  accessToken: string;
}

export default function ChatPanel({ accessToken }: ChatPanelProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [typing, setTyping] = useState(false);
  
  // Crisis Alert Modal state
  const [crisisAlert, setCrisisAlert] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── 1. Fetch Sessions List ────────────────────────────────────────────────
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        let sessionsList: ChatSession[] = [];
        if (Array.isArray(data)) {
          sessionsList = data;
        } else if (data && Array.isArray(data.results)) {
          sessionsList = data.results;
        }
        setSessions(sessionsList);
        if (sessionsList.length > 0 && !activeSessionId) {
          setActiveSessionId(sessionsList[0].id);
        }
      }
    } catch (e) {
      console.error(e);
      setSessions([]);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [accessToken]);

  // ── 2. Handle Session Click (Load History + Start Socket) ──────────────────
  const handleSessionChange = (id: string) => {
    if (ws) {
      ws.close();
    }
    setActiveSessionId(id);
  };

  const createSession = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setSessions(prev => [data, ...prev]);
        setActiveSessionId(data.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeSessionId === id) {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── 3. WebSocket Connection logic ──────────────────────────────────────────
  useEffect(() => {
    if (!activeSessionId) return;

    // Load REST message history
    const loadHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/api/chat/sessions/${activeSessionId}/messages/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (res.ok) {
          let messagesList: ChatMessage[] = [];
          if (Array.isArray(data)) {
            messagesList = data;
          } else if (data && Array.isArray(data.results)) {
            messagesList = data.results;
          }
          setMessages(messagesList);
          setTimeout(scrollToBottom, 100);
        }
      } catch (e) {
        console.error(e);
        setMessages([]);
      }
    };

    loadHistory();

    // Start WebSocket
    setStatus('connecting');
    const wsUrl = `${WS_URL}/ws/chat/${activeSessionId}/?token=${accessToken}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setStatus('connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'crisis_alert') {
        setTyping(false);
        setCrisisAlert(data);
        // Refresh session is_crisis tags
        fetchSessions();
      } else if (data.type === 'status' && data.status === 'typing') {
        setTyping(true);
      } else if (data.type === 'chat_message') {
        setTyping(false);
        setMessages(prev => [...prev, {
          role: data.role,
          content: data.message,
        }]);
        setTimeout(scrollToBottom, 100);
      }
    };

    socket.onclose = () => {
      setStatus('disconnected');
      setTyping(false);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [activeSessionId, accessToken]);

  // ── 4. Send Message ────────────────────────────────────────────────────────
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !ws || status !== 'connected') return;

    // Optimistic user update
    const userMsg: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
    };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(scrollToBottom, 50);

    // Send payload over WebSocket
    ws.send(JSON.stringify({ message: inputMessage.trim() }));
    setInputMessage('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[550px] relative">
      
      {/* Sessions History List Panel (Left) */}
      <div className="md:col-span-1 glass-panel p-4 rounded-3xl flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversations</span>
            <button
              onClick={createSession}
              className="p-1.5 rounded-lg glass-panel hover:border-[#12b886] transition-all cursor-pointer"
              title="Start New Chat"
            >
              <Plus className="w-4 h-4 text-[#12b886]" />
            </button>
          </div>
          
          <div className="space-y-2 overflow-y-auto max-h-[420px] pr-1">
            {sessions.map((s) => {
              const active = s.id === activeSessionId;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSessionChange(s.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                    active 
                      ? 'bg-[rgba(18,184,134,0.06)] border-[rgba(18,184,134,0.2)] text-[#e6f0ed]' 
                      : 'glass-panel border-transparent hover:border-[#12b886] hover:border-opacity-30'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className={`w-3.5 h-3.5 ${s.is_crisis ? 'text-amber-500' : 'text-[#12b886]'}`} />
                    <span className="truncate">{s.title}</span>
                  </div>
                  <button
                    onClick={(e) => deleteSession(s.id, e)}
                    className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer p-0.5 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Chat Conversation Panel (Right) */}
      <div className="md:col-span-3 glass-panel rounded-3xl flex flex-col justify-between overflow-hidden h-full">
        
        {/* Chat Session Header */}
        <div className="px-6 py-4 border-b border-[rgba(18,184,134,0.05)] flex items-center justify-between bg-[rgba(9,14,12,0.3)]">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              status === 'connected' ? 'bg-[#12b886] animate-pulse' : 'bg-red-500'
            }`} />
            <div>
              <h4 className="text-xs font-bold font-outfit">
                {sessions.find(s => s.id === activeSessionId)?.title || "ManMitra AI Companion"}
              </h4>
              <span className="text-[9px] text-slate-500">
                {status === 'connected' ? 'Secure session active' : 'Connecting to sanctuary...'}
              </span>
            </div>
          </div>
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeSessionId ? (
            <>
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser 
                        ? 'bg-[rgba(18,184,134,0.15)] border border-[rgba(18,184,134,0.2)] text-[#e6f0ed] rounded-tr-none' 
                        : 'glass-panel text-slate-200 rounded-tl-none border-l-2 border-l-[#12b886]'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              
              {typing && (
                <div className="flex justify-start">
                  <div className="glass-panel p-3.5 rounded-2xl text-xs text-slate-400 rounded-tl-none flex items-center gap-1.5 border-l-2 border-l-[#12b886]">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-500">
              <Sparkles className="w-8 h-8 text-[#12b886] mb-3 opacity-50" />
              <span>Select or start a conversation from the sidebar history list.</span>
            </div>
          )}
        </div>

        {/* Message Input Submit Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-[rgba(18,184,134,0.05)] bg-[rgba(9,14,12,0.3)] flex gap-2">
          <input
            type="text"
            disabled={!activeSessionId || status !== 'connected'}
            className="flex-1 glass-input px-4 py-2.5 rounded-xl text-xs disabled:opacity-50"
            placeholder="Type your message to ManMitra..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || status !== 'connected'}
            className="glow-btn p-3 rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* ── CRISIS GUARDRAIL MODAL OVERLAY ────────────────────────────────────── */}
      <AnimatePresence>
        {crisisAlert && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel p-8 rounded-3xl relative border border-red-500 border-opacity-30"
            >
              <button
                onClick={() => setCrisisAlert(null)}
                className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-red-950 bg-opacity-40 flex items-center justify-center mx-auto mb-4 border border-red-500 border-opacity-30 animate-pulse">
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-red-400">Emergency Support Lifeline</h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {crisisAlert.message}
                </p>
              </div>

              {/* Resources list */}
              <div className="space-y-3 bg-[#0a0f0d] p-4 rounded-2xl border border-[rgba(18,184,134,0.05)]">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Available Hotlines (24/7)</h4>
                {crisisAlert.resources.hotlines.map((hl: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[rgba(18,184,134,0.02)] last:border-b-0">
                    <span className="font-semibold text-slate-300">{hl.name}</span>
                    <a 
                      href={`tel:${hl.number}`} 
                      className="text-[#12b886] font-bold hover:underline"
                    >
                      {hl.number} ({hl.text})
                    </a>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-slate-500 mt-4 leading-relaxed bg-red-950 bg-opacity-10 border border-red-900 border-opacity-10 p-3 rounded-xl italic">
                {crisisAlert.resources.instructions}
              </div>

              <button
                onClick={() => setCrisisAlert(null)}
                className="w-full glow-btn py-3 rounded-xl text-xs font-semibold mt-6 cursor-pointer"
              >
                I Understand
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
