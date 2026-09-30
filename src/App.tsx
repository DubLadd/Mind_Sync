import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Send,
  Paperclip,
  X,
  FileCode,
  FileAudio,
  FileImage,
  AlertCircle,
  Command,
  Radio,
  Music,
  Video,
  Image as ImageIcon,
  Headphones,
  Cpu,
  Zap,
  Globe,
  History,
  Plus,
  Sparkles,
} from 'lucide-react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { MessageItem } from './components/MessageItem';
import { FileManagerDrawer } from './components/FileManagerDrawer';
import { FilePreviewModal } from './components/FilePreviewModal';
import { CodeAuditModal } from './components/CodeAuditModal';
import { DualDebateModal } from './components/DualDebateModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { SocialShareModal } from './components/SocialShareModal';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { AudioTranscribeModal } from './components/AudioTranscribeModal';
import { MusicStudioModal } from './components/MusicStudioModal';
import { ImageStudioModal } from './components/ImageStudioModal';
import { VeoVideoModal } from './components/VeoVideoModal';
import { DevStudioView } from './components/DevStudioView';
import { CustomPersonaModal } from './components/CustomPersonaModal';
import { SessionsHistoryModal } from './components/SessionsHistoryModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import {
  ChatMessage,
  FileItem,
  AuditResult,
  TelemetryData,
  User,
  SocialSharePayload,
  CustomPersona,
  SavedSession,
} from './types';
import { PERSONA_PRESETS } from './utils/personas';
import { audioEngine, formatFileSize, fallbackBrowserSpeech } from './utils/audio';
import { db, auth, testConnection, logOutFirebase } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where, deleteDoc } from 'firebase/firestore';

export default function App() {
  // Custom Personas State (Stored in Firestore & localStorage)
  const [customPersonas, setCustomPersonas] = useState<CustomPersona[]>(() => {
    try {
      const stored = localStorage.getItem('mind_sync_custom_personas');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCustomPersonaModalOpen, setIsCustomPersonaModalOpen] = useState<boolean>(false);

  // Persona & Agent Configuration
  const [activePersonaId, setActivePersonaId] = useState<string>('sparring');

  // Dynamic persona lookup (built-in presets + user custom personas)
  const allPersonas: Record<string, any> = {
    ...PERSONA_PRESETS,
    ...Object.fromEntries(customPersonas.map((cp) => [cp.id, cp])),
  };
  const activePersona = allPersonas[activePersonaId] || PERSONA_PRESETS.sparring;

  const [customPrompt, setCustomPrompt] = useState<string>(activePersona.systemPrompt);
  const [voiceName, setVoiceName] = useState<string>(activePersona.voice);
  const [sttLang, setSttLang] = useState<string>('en-US');

  // Engine Toggles & Task Model Selection
  const [taskMode, setTaskMode] = useState<'general' | 'complex' | 'fast'>('general');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(false);
  const [autoTelemetry, setAutoTelemetry] = useState<boolean>(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  // Audio & Visualizer State
  const [visualizerMode, setVisualizerMode] = useState<'idle' | 'recording' | 'speaking'>('idle');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [interimSpeech, setInterimSpeech] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('READY');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Session ID for Firestore sync & history
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `session_${Date.now()}`);
  const [isSessionsHistoryOpen, setIsSessionsHistoryOpen] = useState<boolean>(false);

  // Navigation View State: 'spar' (Sparring Mirror) or 'code' (Senior AI Dev Studio)
  const [activeView, setActiveView] = useState<'spar' | 'code'>('spar');

  // User Authentication State
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mind_sync_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('mind_sync_token');
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Social Sharing Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [sharePayload, setSharePayload] = useState<SocialSharePayload | null>(null);

  // Multimodal AI Studio Modals State
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState<boolean>(false);
  const [isTranscribeOpen, setIsTranscribeOpen] = useState<boolean>(false);
  const [isMusicStudioOpen, setIsMusicStudioOpen] = useState<boolean>(false);
  const [isImageStudioOpen, setIsImageStudioOpen] = useState<boolean>(false);
  const [isVeoVideoOpen, setIsVeoVideoOpen] = useState<boolean>(false);

  // Google Drive Modal State
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState<boolean>(false);
  const [driveExportContent, setDriveExportContent] = useState<
    { name: string; content: string; mimeType: string } | undefined
  >(undefined);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'model',
      text: `MIND SYNC initialized with Gemini 3.5 & Veo 3 Multimodal Suite.\n\nVoice input (STT), Firestore persistence, Live API (gemini-3.8-live), Music (Lyria 3), Image (gemini-3.1-flash-image), and Veo Video are fully integrated. Tap the microphone or press ⌘K to enter the spar.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Files Repository State
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Code Audit State
  const [auditModalFile, setAuditModalFile] = useState<FileItem | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Dual Debate Arena State
  const [isDualDebateOpen, setIsDualDebateOpen] = useState<boolean>(false);
  const [dualDebateTopic, setDualDebateTopic] = useState<string>('');

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // References
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Initial Firestore Boot Connection Test
  useEffect(() => {
    testConnection();
  }, []);

  // 2. Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const u: User = {
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Sparring Agent',
          createdAt: new Date().toISOString(),
        };
        setUser(u);
        localStorage.setItem('mind_sync_user', JSON.stringify(u));
        setStatusText(`SYNCED: ${u.name.toUpperCase()}`);
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Load user's Custom Personas from Firestore
  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'personas'), where('userId', '==', user.id));
      getDocs(q)
        .then((snapshot) => {
          const list: CustomPersona[] = [];
          snapshot.forEach((d) => list.push(d.data() as CustomPersona));
          if (list.length > 0) {
            setCustomPersonas((prev) => {
              const ids = new Set(list.map((x) => x.id));
              const merged = [...list, ...prev.filter((x) => !ids.has(x.id))];
              localStorage.setItem('mind_sync_custom_personas', JSON.stringify(merged));
              return merged;
            });
          }
        })
        .catch((e) => console.warn('Custom personas fetch note:', e?.message));
    }
  }, [user]);

  // 4. Persist active session and full messages to Firestore
  useEffect(() => {
    if (messages.length > 1) {
      const title = messages[1]?.text?.slice(0, 60) || 'Cognitive Spar';
      const sessionData = {
        sessionId: currentSessionId,
        userId: user ? user.id : 'guest',
        title,
        personaId: activePersonaId,
        personaName: activePersona.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: messages.length,
        frictionScoreAvg: 80,
        messages,
      };

      if (user) {
        const sessionDocRef = doc(db, 'sessions', currentSessionId);
        setDoc(sessionDocRef, sessionData, { merge: true }).catch((e) =>
          console.warn('Firestore session sync note:', e?.message)
        );
      }

      // Also persist to guest local storage
      try {
        const stored = localStorage.getItem('mind_sync_guest_sessions');
        const list: SavedSession[] = stored ? JSON.parse(stored) : [];
        const filtered = list.filter((s) => s.sessionId !== currentSessionId);
        filtered.unshift(sessionData as SavedSession);
        localStorage.setItem('mind_sync_guest_sessions', JSON.stringify(filtered.slice(0, 30)));
      } catch (e) {}
    }
  }, [messages, user, currentSessionId, activePersonaId, activePersona]);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        chatInputRef.current?.focus();
      } else if (isMod && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleRecording();
      } else if (isMod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExportSession();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, messages, activePersona, voiceName, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, interimSpeech]);

  // Update prompt and voice when persona changes
  const handleSelectPersona = (id: string) => {
    setActivePersonaId(id);
    const p = allPersonas[id];
    if (p) {
      setCustomPrompt(p.systemPrompt);
      setVoiceName(p.voice);
      setStatusText(`MODE: ${p.name.toUpperCase()}`);
    }
  };

  const handleCustomPersonaSaved = (newPersona: CustomPersona) => {
    setCustomPersonas((prev) => [...prev.filter((p) => p.id !== newPersona.id), newPersona]);
    setActivePersonaId(newPersona.id);
    setCustomPrompt(newPersona.systemPrompt);
    setVoiceName(newPersona.voice as any);
    setStatusText(`ACTIVE: ${newPersona.name.toUpperCase()}`);
  };

  const handleDeleteCustomPersona = async (id: string) => {
    setCustomPersonas((prev) => prev.filter((p) => p.id !== id));
    try {
      const stored = localStorage.getItem('mind_sync_custom_personas');
      if (stored) {
        const list: CustomPersona[] = JSON.parse(stored);
        localStorage.setItem(
          'mind_sync_custom_personas',
          JSON.stringify(list.filter((p) => p.id !== id))
        );
      }
    } catch (e) {}

    if (activePersonaId === id) {
      handleSelectPersona('sparring');
    }
  };

  const handleLoadSession = (savedSession: SavedSession) => {
    setCurrentSessionId(savedSession.sessionId);
    if (savedSession.messages && savedSession.messages.length > 0) {
      setMessages(savedSession.messages);
    }
    if (savedSession.personaId) {
      handleSelectPersona(savedSession.personaId);
    }
    setStatusText(`LOADED: ${savedSession.title.slice(0, 24).toUpperCase()}`);
  };

  const handleStartNewSession = () => {
    const newId = `session_${Date.now()}`;
    setCurrentSessionId(newId);
    setMessages([
      {
        id: 'msg-welcome',
        role: 'model',
        text: `New sparring session initialized with ${activePersona.name}.\n\nEnter your proposition, thesis, or question to begin.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setStatusText('NEW SESSION INITIALIZED');
  };

  const handleAuthSuccess = (newUser: User, token: string) => {
    setUser(newUser);
    setAuthToken(token);
    localStorage.setItem('mind_sync_user', JSON.stringify(newUser));
    localStorage.setItem('mind_sync_token', token);
    setStatusText(`AUTHENTICATED: ${newUser.name.toUpperCase()}`);
  };

  const handleLogout = async () => {
    try {
      await logOutFirebase();
    } catch (e) {}

    if (authToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch (e) {}
    }
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('mind_sync_user');
    localStorage.removeItem('mind_sync_token');
    setStatusText('LOGGED OUT');
  };

  const handleOpenShare = (text: string, title?: string) => {
    setSharePayload({
      title: title || 'AI Sparring Mirror Insight',
      text,
      milestone: activePersona.badge,
    });
    setIsShareModalOpen(true);
  };

  const handleOpenShareMilestone = () => {
    const lastModelMsg = [...messages].reverse().find((m) => m.role === 'model');
    const quoteText =
      lastModelMsg?.text || 'Conducted an unfiltered, high-friction cognitive sparring session on MIND SYNC.';
    setSharePayload({
      title: 'Sparring Milestone Completed',
      text: quoteText,
      milestone: `${activePersona.name} · ${messages.length} Rounds`,
    });
    setIsShareModalOpen(true);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = sttLang;

      recognition.onstart = async () => {
        setIsRecording(true);
        setVisualizerMode('recording');
        setStatusText('LISTENING');
        try {
          await audioEngine.startMicStream();
        } catch (e) {
          console.warn('Microphone stream access for analyser:', e);
        }
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim) {
          setInterimSpeech(interim);
        }
        if (final) {
          setInput((prev) => (prev ? `${prev} ${final}` : final).trim());
          setInterimSpeech('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        stopRecording();
        setStatusText(`STT: ${event.error}`);
      };

      recognition.onend = () => {
        stopRecording();
      };

      recognitionRef.current = recognition;
    }
  }, [sttLang]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setIsTranscribeOpen(true);
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      audioEngine.stopPlayback();
      setVisualizerMode('idle');
      setInterimSpeech('');
      try {
        recognitionRef.current.lang = sttLang;
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.stop();
      }
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setInterimSpeech('');
    audioEngine.stopMicStream();
    setVisualizerMode('idle');
    setStatusText('READY');
  };

  // Process Uploaded Files
  const handleUploadFiles = async (fileList: FileList | File[]) => {
    const newFiles: FileItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const codeExts = ['JSX', 'TSX', 'HTML', 'HTM', 'JS', 'TS', 'PY', 'JSON', 'CSS', 'MD', 'TXT', 'SQL', 'YAML'];
      const audioExts = ['MP3', 'WAV', 'OGG', 'M4A', 'AAC', 'FLAC'];
      const imageExts = ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'SVG'];

      const isCode = codeExts.includes(ext) || file.type.startsWith('text/') || file.type.includes('javascript');
      const isAudio = audioExts.includes(ext) || file.type.startsWith('audio/');
      const isImage = imageExts.includes(ext) || file.type.startsWith('image/');

      let category: FileItem['category'] = 'other';
      if (isCode) category = 'code';
      else if (isAudio) category = 'audio';
      else if (isImage) category = 'image';

      const fileItem: FileItem = {
        id: fileId,
        name: file.name,
        ext,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        mimeType: file.type || 'text/plain',
        category,
        isCode,
        isAudio,
        isImage,
        inContext: true,
      };

      if (isCode) {
        fileItem.content = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || '');
          reader.onerror = () => resolve('// Error reading file');
          reader.readAsText(file);
        });
      } else if (isImage || isAudio) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
        fileItem.dataUrl = dataUrl;
        const parts = dataUrl.split(',');
        fileItem.base64 = parts[1] || '';
      }

      newFiles.push(fileItem);
    }

    setFiles((prev) => {
      return [...prev.filter((f) => !newFiles.some((nf) => nf.name === f.name)), ...newFiles];
    });

    setStatusText(`${newFiles.length} file(s) ingested`);
  };

  const handleToggleFileContext = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, inContext: !f.inContext } : f))
    );
  };

  const handleToggleAllContext = (selectAll: boolean) => {
    setFiles((prev) => prev.map((f) => ({ ...f, inContext: selectAll })));
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDeleteAllFiles = () => {
    setFiles([]);
  };

  const handlePlayAudioInVisualizer = (file: FileItem) => {
    if (!file.dataUrl) return;
    audioEngine.stopPlayback();
    setVisualizerMode('speaking');
    audioEngine.playAudio(
      file.dataUrl,
      () => setVisualizerMode('idle'),
      () => setVisualizerMode('idle')
    );
  };

  const handleAuditCode = async (file: FileItem) => {
    if (!file || !file.content) return;
    setAuditModalFile(file);
    setAuditResult(null);
    setIsAuditing(true);

    try {
      const res = await fetch('/api/code-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          code: file.content,
          language: file.ext.toLowerCase(),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setAuditResult(data);
    } catch (err: any) {
      console.error('Audit failed:', err);
      alert(`Audit failed: ${err.message}`);
      setAuditModalFile(null);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApplyRefactor = (fileId: string, newCode: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === fileId) {
          return {
            ...f,
            content: newCode,
            size: new Blob([newCode]).size,
            sizeFormatted: formatFileSize(new Blob([newCode]).size),
          };
        }
        return f;
      })
    );
    setStatusText('Applied hardened refactor');
  };

  const handleSpeakText = async (text: string, msgId?: string) => {
    if (!text) return;
    audioEngine.stopPlayback();
    setVisualizerMode('speaking');
    if (msgId) setSpeakingMessageId(msgId);
    setStatusText(`VOICE: ${voiceName}`);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.audioBase64) {
        const audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        audioEngine.playAudio(
          audioUrl,
          () => {
            setVisualizerMode('idle');
            setSpeakingMessageId(null);
            setStatusText('READY');
          },
          () => {
            setVisualizerMode('idle');
            setSpeakingMessageId(null);
          }
        );
      } else {
        throw new Error('No audio data received');
      }
    } catch (e) {
      console.warn('Gemini TTS fallback to native speech:', e);
      fallbackBrowserSpeech(text, sttLang, () => {
        setVisualizerMode('idle');
        setSpeakingMessageId(null);
      });
    }
  };

  const handleDissectTelemetry = async (messageId: string, argumentText: string) => {
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ argumentText }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const telemetry: TelemetryData = await res.json();

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, telemetry } : m))
      );
    } catch (err: any) {
      console.error('Dissect error:', err);
      alert(`Could not dissect argument: ${err.message}`);
    }
  };

  const handleGenerateConceptDiagram = async (messageId: string, promptText: string) => {
    try {
      const res = await fetch('/api/images/generate-or-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.dataUrl) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, visualDiagramUrl: data.dataUrl } : m))
        );
      }
    } catch (err: any) {
      console.error('Diagram generation error:', err);
      alert(`Failed to generate concept diagram: ${err.message}`);
    }
  };

  // Send Chat Message with Real-Time Readable Stream Processing & Model Routing
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = input.trim();
    const activeFiles = files.filter((f) => f.inContext);

    if (!textToSend && activeFiles.length === 0) return;
    if (isSending) return;

    if (isRecording) {
      stopRecording();
    }

    const userMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFiles: activeFiles.map((f) => ({ name: f.name, ext: f.ext })),
    };

    const firstImg = activeFiles.find((f) => f.isImage);
    if (firstImg?.dataUrl) {
      userMsg.imageSrc = firstImg.dataUrl;
    }

    const aiMsgId = `ai_${Date.now()}`;
    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      role: 'model',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGenerating: true,
    };

    setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
    setInput('');
    setIsSending(true);
    setStatusText(useSearchGrounding ? 'SEARCHING' : 'STREAMING');

    const parts: any[] = [];
    let combinedFilesText = '';
    activeFiles
      .filter((f) => f.isCode && f.content)
      .forEach((f) => {
        combinedFilesText += `\n\n--- FILE: ${f.name} (${f.ext}) ---\n\`\`\`${f.ext.toLowerCase()}\n${f.content}\n\`\`\`\n`;
      });

    const fullPrompt = `${textToSend}${
      combinedFilesText
        ? `\n\n[USER PROVIDED ACTIVE REPOSITORY FILES TO INSPECT]:${combinedFilesText}`
        : ''
    }`;

    if (fullPrompt.trim()) {
      parts.push({ text: fullPrompt });
    }

    activeFiles
      .filter((f) => f.isImage && f.base64)
      .forEach((f) => {
        parts.push({
          inlineData: {
            mimeType: f.mimeType || 'image/png',
            data: f.base64,
          },
        });
      });

    activeFiles
      .filter((f) => f.isAudio && f.base64)
      .forEach((f) => {
        parts.push({
          inlineData: {
            mimeType: f.mimeType || 'audio/wav',
            data: f.base64,
          },
        });
      });

    const apiMessages = messages
      .filter((m) => m.id !== 'msg-welcome')
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

    apiMessages.push({
      role: 'user',
      parts,
    });

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          systemInstruction: customPrompt,
          useSearchGrounding,
          taskMode,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error('Readable stream not supported by browser response.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let streamBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split('\n');
        streamBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);

            if (parsed.text) {
              accumulatedText += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        text: accumulatedText,
                        isGenerating: false,
                      }
                    : m
                )
              );
            }

            if (parsed.done && parsed.sources && parsed.sources.length > 0) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        sources: parsed.sources,
                      }
                    : m
                )
              );
            }

            if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e: any) {}
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                isGenerating: false,
                text: accumulatedText || m.text,
              }
            : m
        )
      );

      if (autoPlay && accumulatedText) {
        handleSpeakText(accumulatedText, aiMsgId);
      }

      if (autoTelemetry && textToSend) {
        handleDissectTelemetry(aiMsgId, textToSend);
      }
    } catch (err: any) {
      console.error('Chat stream error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: `Streaming error: ${err.message}. Connection re-established.`,
                isGenerating: false,
              }
            : m
        )
      );
    } finally {
      setIsSending(false);
      setStatusText('READY');
    }
  };

  const handleExportSession = () => {
    let md = `# MIND_SYNC Sparring Dossier\n\n`;
    md += `*Generated:* ${new Date().toLocaleString()}\n`;
    md += `*Active Persona:* ${activePersona.name} (${activePersona.badge})\n`;
    md += `*Voice:* ${voiceName}\n`;
    if (user) {
      md += `*User:* ${user.name} (${user.email})\n`;
    }
    md += `\n---\n\n`;

    messages.forEach((m) => {
      const isUser = m.role === 'user';
      md += `### ${isUser ? (user ? user.name.toUpperCase() : 'USER') : 'MIND_SYNC AI'} (${m.timestamp})\n\n`;
      if (m.attachedFiles && m.attachedFiles.length > 0) {
        md += `*Attached Files:* ${m.attachedFiles.map((f) => `[${f.ext}] ${f.name}`).join(', ')}\n\n`;
      }
      md += `${m.text}\n\n`;

      if (m.telemetry) {
        md += `> **ARGUMENT TELEMETRY** (Friction: ${m.telemetry.frictionScore}%)\n`;
        md += `> - **Core Thesis:** ${m.telemetry.coreThesis}\n`;
        md += `> - **Fallacies:** ${m.telemetry.logicalFallacies.join(', ') || 'None'}\n`;
        md += `> - **Steelman Counter:** ${m.telemetry.steelmanCounter}\n`;
        md += `> - **Pivot Question:** ${m.telemetry.piercingQuestion}\n\n`;
      }

      if (m.sources && m.sources.length > 0) {
        md += `*Sources:*\n`;
        m.sources.forEach((s, idx) => {
          md += `${idx + 1}. [${s.title}](${s.uri})\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mind-sync-dossier-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusText('Dossier exported (⌘E)');
  };

  const handleClearChat = () => {
    audioEngine.stopPlayback();
    setVisualizerMode('idle');
    setMessages([
      {
        id: 'msg-welcome',
        role: 'model',
        text: `Session reset.\n\nEnter your proposition, thesis, or attach code files to begin the next epistemic spar.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setStatusText('SESSION RESET');
  };

  const activeFilesInContext = files.filter((f) => f.inContext);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const modSymbol = isMac ? '⌘' : 'Ctrl+';

  return (
    <div className="h-full flex flex-col font-sans bg-slate-950 text-slate-100 select-none">
      {/* Top Bar Navigation */}
      <TopBar
        activePersonaId={activePersonaId}
        onSelectPersona={handleSelectPersona}
        customPersonas={customPersonas}
        onOpenCustomPersonaModal={() => setIsCustomPersonaModalOpen(true)}
        onOpenSessionsHistory={() => setIsSessionsHistoryOpen(true)}
        onOpenGoogleDrive={() => {
          setDriveExportContent(undefined);
          setIsGoogleDriveOpen(true);
        }}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenFiles={() => setIsFilesDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onClearChat={handleClearChat}
        activeFileCount={activeFilesInContext.length}
        totalFileCount={files.length}
        voiceName={voiceName}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenShareMilestone={handleOpenShareMilestone}
        onFocusInput={() => chatInputRef.current?.focus()}
        onToggleMic={toggleRecording}
        onExport={handleExportSession}
      />

      {/* View Switcher Container */}
      {activeView === 'code' ? (
        <DevStudioView
          user={user}
          onSaveToFileRepo={(newFile) => {
            setFiles((prev) => [...prev.filter((f) => f.name !== newFile.name), newFile]);
          }}
          onSaveToDrive={(name, code, mimeType) => {
            setDriveExportContent({ name, content: code, mimeType });
            setIsGoogleDriveOpen(true);
          }}
        />
      ) : (
        /* Main Workspace Frame */
        <main className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row overflow-hidden p-3 gap-3">
          {/* Left Audio & Control Sidebar */}
          <Sidebar
            visualizerMode={visualizerMode}
            autoPlay={autoPlay}
            onToggleAutoPlay={setAutoPlay}
            activePersona={activePersona}
            onSelectPersona={handleSelectPersona}
            customPersonas={customPersonas}
            onOpenCustomPersonaModal={() => setIsCustomPersonaModalOpen(true)}
            onOpenSessionsHistory={() => setIsSessionsHistoryOpen(true)}
            useSearchGrounding={useSearchGrounding}
            onToggleSearchGrounding={setUseSearchGrounding}
            autoTelemetry={autoTelemetry}
            onToggleAutoTelemetry={setAutoTelemetry}
            onLaunchDualDebate={() => {
              const lastModelMsg = [...messages].reverse().find((m) => m.role === 'model');
              setDualDebateTopic(
                lastModelMsg?.text.slice(0, 150) || input || 'The ultimate software architecture tradeoff'
              );
              setIsDualDebateOpen(true);
            }}
            onLaunchConceptDiagram={() => {
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) {
                handleGenerateConceptDiagram(lastMsg.id, lastMsg.text);
              }
            }}
            onExportSession={handleExportSession}
            statusText={statusText}
          />

          {/* Right Sparring Conversation Area */}
          <section
            className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative border border-slate-800"
            aria-label="Conversation Mirror"
          >
            {/* Messages Scroll Area */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
              role="log"
              aria-live="polite"
            >
              {messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  onSpeak={(text) => handleSpeakText(text, msg.id)}
                  onDissect={(id, text) => handleDissectTelemetry(id, text)}
                  onDualDebate={(text) => {
                    setDualDebateTopic(text.slice(0, 150));
                    setIsDualDebateOpen(true);
                  }}
                  onGenerateDiagram={(id, text) => handleGenerateConceptDiagram(id, text)}
                  onShare={(text, title) => handleOpenShare(text, title)}
                  isSpeakingThis={speakingMessageId === msg.id && visualizerMode === 'speaking'}
                />
              ))}
            </div>

            {/* Speech-to-Text Live Transcript Banner */}
            {isRecording && (
              <div className="mx-4 mb-2 p-2.5 rounded-xl bg-cyan-950/90 border border-cyan-700/80 text-xs text-cyan-200 font-mono flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  <span className="truncate italic">
                    {interimSpeech ? `"${interimSpeech}"` : 'Listening... Speak clearly'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 text-[10px]"
                >
                  CANCEL
                </button>
              </div>
            )}

            {/* Active File Attachments Tray */}
            {activeFilesInContext.length > 0 && (
              <div className="mx-4 mb-2 p-2.5 rounded-xl bg-slate-900/95 border border-cyan-800/80 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
                  <div className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Armed in Context ({activeFilesInContext.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleAllContext(false)}
                    className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Detach All
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {activeFilesInContext.map((file) => {
                    let badge = 'bg-cyan-950 text-cyan-300 border-cyan-800';
                    let Icon = FileCode;
                    if (file.isAudio) {
                      badge = 'bg-emerald-950 text-emerald-300 border-emerald-800';
                      Icon = FileAudio;
                    } else if (file.isImage) {
                      badge = 'bg-violet-950 text-violet-300 border-violet-800';
                      Icon = FileImage;
                    }

                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-mono border border-slate-700 text-slate-200"
                      >
                        <Icon className="w-3 h-3 text-cyan-400" />
                        <span className={`text-[9px] px-1 py-0.2 rounded border ${badge}`}>
                          {file.ext}
                        </span>
                        <span
                          onClick={() => setPreviewFile(file)}
                          className="truncate max-w-[120px] font-medium cursor-pointer hover:underline"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleFileContext(file.id)}
                          className="text-slate-400 hover:text-rose-400 ml-1"
                          title="Detach from context"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Multimodal AI Studio Toolbar Strip */}
            <div className="px-3 pt-2 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-xs font-mono">
              {/* Studio Tools */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsLiveVoiceOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Real-time Voice Conversation with gemini-3.8-live"
                >
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="font-bold">Live Voice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTranscribeOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Transcribe Audio with gemini-3.5-transcribe"
                >
                  <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Transcribe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMusicStudioOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Generate Music with Lyria 3"
                >
                  <Music className="w-3.5 h-3.5 text-violet-400" />
                  <span>Music</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsImageStudioOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Create & Edit Images with gemini-3.1-flash-image-preview"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVeoVideoOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Veo 3 Video Generation & Animation (veo-3.1-fast-generate-preview)"
                >
                  <Video className="w-3.5 h-3.5 text-amber-400" />
                  <span>Veo 3</span>
                </button>
              </div>

              {/* Model Task Mode Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setTaskMode('general')}
                  className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                    taskMode === 'general'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="General Tasks: gemini-3.5-flash"
                >
                  ⚡ 3.5 Flash
                </button>
                <button
                  type="button"
                  onClick={() => setTaskMode('complex')}
                  className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                    taskMode === 'complex'
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Complex Reasoning: gemini-3.1-pro-preview"
                >
                  🧠 3.1 Pro
                </button>
                <button
                  type="button"
                  onClick={() => setTaskMode('fast')}
                  className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                    taskMode === 'fast'
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Fast Tasks: gemini-3.1-flash-lite"
                >
                  🚀 Flash Lite
                </button>
              </div>
            </div>

            {/* Chat Form & Inputs */}
            <div className="p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md flex flex-col gap-2">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {/* Attach File Button */}
                <button
                  type="button"
                  onClick={() => setIsFilesDrawerOpen(true)}
                  title="Manage & attach files (JSX, TSX, HTML, Audio, Images)"
                  className="p-3.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-cyan-300 border border-slate-700/80 transition-all shrink-0 flex items-center justify-center relative cursor-pointer"
                >
                  <Paperclip className="w-5 h-5" />
                  {activeFilesInContext.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </button>

                {/* Text Input with Ref for Cmd/Ctrl+K */}
                <div className="relative flex-1">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Type your proposition or press ${modSymbol}K to focus...`}
                    className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-400 px-4 py-3.5 pr-10 rounded-xl border border-slate-700/80 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition-all"
                    autoComplete="off"
                  />
                  {input.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Microphone Toggle Button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  title={`Toggle Speech-to-Text (${modSymbol}M)`}
                  className={`relative p-3.5 rounded-xl transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80'
                  }`}
                >
                  {isRecording && (
                    <span className="absolute inset-0 rounded-xl bg-rose-500/30 animate-ping" />
                  )}
                  <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-slate-300'}`} />
                </button>

                {/* Send Submit Button */}
                <button
                  type="submit"
                  disabled={isSending || (!input.trim() && activeFilesInContext.length === 0)}
                  title="Send to Gemini Mirror (Stream Tokens)"
                  className="p-3.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-40 text-white transition-all shadow-lg shrink-0 flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>

              {/* Shortcut Hints & Hotkeys Strip */}
              <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 px-1 gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => chatInputRef.current?.focus()}
                    className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                      {modSymbol}K
                    </kbd>
                    <span>Focus</span>
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                      {modSymbol}M
                    </kbd>
                    <span>Mic</span>
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={handleExportSession}
                    className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                      {modSymbol}E
                    </kbd>
                    <span>Export</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {user ? (
                    <button
                      type="button"
                      onClick={() => setIsSessionsHistoryOpen(true)}
                      className="text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      title="View all past sparring sessions in Firestore"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Firestore: {user.name}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      Google / Firebase Sign In
                    </button>
                  )}
                  <span className="tabular-nums">
                    {useSearchGrounding
                      ? 'Search Grounded'
                      : taskMode === 'complex'
                      ? '3.1 Pro'
                      : taskMode === 'fast'
                      ? '3.1 Lite'
                      : '3.5 Flash'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Slide-over Local File Manager Drawer */}
      <FileManagerDrawer
        isOpen={isFilesDrawerOpen}
        onClose={() => setIsFilesDrawerOpen(false)}
        files={files}
        onUploadFiles={handleUploadFiles}
        onToggleFileContext={handleToggleFileContext}
        onToggleAllContext={handleToggleAllContext}
        onDeleteFile={handleDeleteFile}
        onDeleteAllFiles={handleDeleteAllFiles}
        onPreviewFile={(file) => setPreviewFile(file)}
        onAuditCode={handleAuditCode}
        onPlayAudio={handlePlayAudioInVisualizer}
        onOpenGoogleDrive={() => {
          setIsFilesDrawerOpen(false);
          setDriveExportContent(undefined);
          setIsGoogleDriveOpen(true);
        }}
      />

      {/* In-App File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onPlayAudioInVisualizer={handlePlayAudioInVisualizer}
      />

      {/* Gemini AST Code Audit Modal */}
      <CodeAuditModal
        isOpen={Boolean(auditModalFile)}
        onClose={() => {
          setAuditModalFile(null);
          setAuditResult(null);
        }}
        file={auditModalFile}
        auditResult={auditResult}
        isLoading={isAuditing}
        onApplyRefactor={handleApplyRefactor}
      />

      {/* Dual-Speaker Adversarial Arena Modal */}
      <DualDebateModal
        isOpen={isDualDebateOpen}
        onClose={() => setIsDualDebateOpen(false)}
        defaultTopic={dualDebateTopic}
      />

      {/* Agent & Voice Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sttLang={sttLang}
        onChangeSttLang={setSttLang}
        voiceName={voiceName}
        onChangeVoiceName={setVoiceName}
        customPrompt={customPrompt}
        onChangeCustomPrompt={setCustomPrompt}
        onResetPromptToDefault={() => setCustomPrompt(activePersona.systemPrompt)}
        activePersona={activePersona}
      />

      {/* User Authentication Modal (Firebase Auth + Email) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Social Sharing Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSharePayload(null);
        }}
        payload={sharePayload}
      />

      {/* Live Voice Conversation Modal (gemini-3.8-live) */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        voiceName={voiceName}
      />

      {/* Audio Transcription Modal (gemini-3.5-transcribe) */}
      <AudioTranscribeModal
        isOpen={isTranscribeOpen}
        onClose={() => setIsTranscribeOpen(false)}
        onInsertToChat={(text) => setInput((prev) => (prev ? `${prev} ${text}` : text))}
      />

      {/* Music Generation Modal (Lyria 3) */}
      <MusicStudioModal
        isOpen={isMusicStudioOpen}
        onClose={() => setIsMusicStudioOpen(false)}
      />

      {/* Image Creation & Editing Modal (gemini-3.1-flash-image-preview) */}
      <ImageStudioModal
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
      />

      {/* Veo 3 Video Generation & Animation Modal (veo-3.1-fast-generate-preview) */}
      <VeoVideoModal
        isOpen={isVeoVideoOpen}
        onClose={() => setIsVeoVideoOpen(false)}
      />

      {/* Custom Persona Creator UI (Firestore Synced) */}
      <CustomPersonaModal
        isOpen={isCustomPersonaModalOpen}
        onClose={() => setIsCustomPersonaModalOpen(false)}
        user={user}
        onPersonaSaved={handleCustomPersonaSaved}
        existingCustomPersonas={customPersonas}
        onDeleteCustomPersona={handleDeleteCustomPersona}
      />

      {/* Past Chat Sessions History Drawer (Firestore Synced) */}
      <SessionsHistoryModal
        isOpen={isSessionsHistoryOpen}
        onClose={() => setIsSessionsHistoryOpen(false)}
        user={user}
        currentSessionId={currentSessionId}
        onLoadSession={handleLoadSession}
        onStartNewSession={handleStartNewSession}
      />

      {/* Google Drive Workspace Modal */}
      <GoogleDriveModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        user={user}
        onImportFile={(file) => {
          setFiles((prev) => [...prev.filter((f) => f.name !== file.name), file]);
          setStatusText(`Imported ${file.name} from Google Drive`);
        }}
        currentExportContent={driveExportContent}
      />
    </div>
  );
}
