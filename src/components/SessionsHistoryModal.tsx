import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  RotateCcw,
  Trash2,
  Download,
  Search,
  MessageSquare,
  Clock,
  Sparkles,
  Loader2,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { User, SavedSession, ChatMessage } from '../types';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc, orderBy } from 'firebase/firestore';

interface SessionsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  currentSessionId: string;
  onLoadSession: (session: SavedSession) => void;
  onStartNewSession: () => void;
}

export const SessionsHistoryModal: React.FC<SessionsHistoryModalProps> = ({
  isOpen,
  onClose,
  user,
  currentSessionId,
  onLoadSession,
  onStartNewSession,
}) => {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen, user]);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (user) {
        // Query Firestore collection 'sessions' for user
        const q = query(
          collection(db, 'sessions'),
          where('userId', '==', user.id)
        );
        const querySnapshot = await getDocs(q);
        const loaded: SavedSession[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            sessionId: docSnap.id,
            userId: data.userId,
            title: data.title || 'Untitled Spar',
            personaId: data.personaId || 'sparring',
            personaName: data.personaName,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
            messageCount: data.messageCount || (Array.isArray(data.messages) ? data.messages.length : 0),
            frictionScoreAvg: data.frictionScoreAvg,
            messages: data.messages || [],
          });
        });

        // Sort by updatedAt descending
        loaded.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setSessions(loaded);
      } else {
        // Fallback: check localStorage for guest sessions
        try {
          const guestSaved = localStorage.getItem('mind_sync_guest_sessions');
          if (guestSaved) {
            setSessions(JSON.parse(guestSaved));
          } else {
            setSessions([]);
          }
        } catch (e) {
          setSessions([]);
        }
      }
    } catch (err: any) {
      console.warn('Error fetching sessions from Firestore:', err);
      setError(err?.message || 'Could not load sessions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this sparring session?')) return;

    try {
      if (user) {
        await deleteDoc(doc(db, 'sessions', sessionId));
      }
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));

      // Also clean up local storage if present
      try {
        const guestSaved = localStorage.getItem('mind_sync_guest_sessions');
        if (guestSaved) {
          const list: SavedSession[] = JSON.parse(guestSaved);
          localStorage.setItem(
            'mind_sync_guest_sessions',
            JSON.stringify(list.filter((s) => s.sessionId !== sessionId))
          );
        }
      } catch (e) {}
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleExportSessionMarkdown = (session: SavedSession, e: React.MouseEvent) => {
    e.stopPropagation();
    let md = `# Sparring Session: ${session.title}\n\n`;
    md += `*Session ID:* ${session.sessionId}\n`;
    md += `*Updated:* ${new Date(session.updatedAt).toLocaleString()}\n`;
    md += `*Persona:* ${session.personaId}\n\n---\n\n`;

    if (session.messages && session.messages.length > 0) {
      session.messages.forEach((m) => {
        md += `### ${m.role === 'user' ? 'YOU' : 'SPARRING MIRROR'} (${m.timestamp})\n\n${m.text}\n\n`;
      });
    } else {
      md += `*No stored transcript.*`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.sessionId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSelectToResume = (session: SavedSession) => {
    onLoadSession(session);
    onClose();
  };

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const queryLower = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(queryLower) ||
      s.personaId.toLowerCase().includes(queryLower)
    );
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>PREVIOUS SESSIONS</span>
                <span className="px-2 py-0.2 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Firestore
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {user ? `Synced with ${user.email}` : 'Guest Mode (Local Cache)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Start Fresh Session Button & Search */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              onStartNewSession();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Start Fresh Sparring Session</span>
          </button>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search previous sparring sessions..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="m-3 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Querying Firestore sessions...</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
              <MessageSquare className="w-8 h-8 text-slate-600" />
              <span>No past sessions found.</span>
              <span className="text-[11px] text-slate-600">
                Engage in a sparring round to automatically store your dialectic history in Firestore.
              </span>
            </div>
          ) : (
            filteredSessions.map((s) => {
              const isCurrent = s.sessionId === currentSessionId;
              const dateStr = new Date(s.updatedAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={s.sessionId}
                  onClick={() => handleSelectToResume(s)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                    isCurrent
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Line: Title & Current Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 font-bold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {s.title}
                    </div>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-700 shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] uppercase">
                        {s.personaId}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-500" />
                        <span>{s.messageCount} msgs</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 mt-1">
                    <span className="text-[10px] text-cyan-400 group-hover:underline flex items-center gap-1">
                      <span>Click to resume</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleExportSessionMarkdown(s, e)}
                        title="Download session as Markdown"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(s.sessionId, e)}
                        title="Delete session"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Firestore End-to-End Secure</span>
          </div>
          <button
            type="button"
            onClick={fetchSessions}
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Refresh List
          </button>
        </div>
      </div>
    </div>
  );
};
