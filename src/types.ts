export interface GroundedSource {
  uri: string;
  title: string;
}

export interface TelemetryData {
  frictionScore: number;
  epistemicHealth: 'Robust' | 'Vulnerable' | 'Fractured' | string;
  coreThesis: string;
  logicalFallacies: string[];
  hiddenAssumptions: string[];
  steelmanCounter: string;
  piercingQuestion: string;
}

export interface VulnerabilityItem {
  issue: string;
  severity: 'high' | 'medium' | 'low' | string;
  lineHint?: string;
}

export interface AuditResult {
  qualityScore: number;
  summary: string;
  vulnerabilities: VulnerabilityItem[];
  optimizations: string[];
  refactoredCode: string;
}

export interface DebateTurn {
  speaker: string;
  text: string;
}

export interface FileItem {
  id: string;
  name: string;
  ext: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  category: 'code' | 'audio' | 'image' | 'text' | 'other';
  isCode: boolean;
  isAudio: boolean;
  isImage: boolean;
  inContext: boolean;
  content?: string | null;
  dataUrl?: string | null;
  base64?: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  sources?: GroundedSource[];
  attachedFiles?: Array<{ name: string; ext: string }>;
  imageSrc?: string;
  telemetry?: TelemetryData;
  visualDiagramUrl?: string;
  isGenerating?: boolean;
}

export interface PersonaConfig {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  voice: 'Fenrir' | 'Zephyr' | 'Puck' | 'Kore' | 'Aoede' | 'Charon';
  systemPrompt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SocialSharePayload {
  title: string;
  text: string;
  url?: string;
  milestone?: string;
}

export interface CustomPersona {
  id: string;
  userId: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  voice: 'Fenrir' | 'Zephyr' | 'Puck' | 'Kore' | 'Aoede' | 'Charon' | string;
  systemPrompt: string;
  frictionLevel?: 'Low' | 'Medium' | 'High' | 'Extreme' | string;
  createdAt: string;
  isCustom?: boolean;
}

export interface SavedSession {
  sessionId: string;
  userId: string;
  title: string;
  personaId: string;
  personaName?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  frictionScoreAvg?: number;
  messages?: ChatMessage[];
}

