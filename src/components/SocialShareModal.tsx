import React, { useState } from 'react';
import { X, Share2, Copy, Check, Twitter, Facebook, Instagram, Linkedin, ExternalLink } from 'lucide-react';
import { SocialSharePayload } from '../types';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: SocialSharePayload | null;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  payload,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedInstagram, setCopiedInstagram] = useState(false);

  if (!isOpen || !payload) return null;

  const currentUrl = window.location.href;
  const shareText = `"${payload.text.slice(0, 240)}..."\n\n— Sparring session insight via MIND SYNC`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(currentUrl);

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=MIND_SYNC,AI,CognitiveSparring`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleLinkedinShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleInstagramShare = () => {
    // Instagram does not support direct URL pre-fill from web; we copy the formatted caption and open Instagram
    navigator.clipboard.writeText(`${payload.title}\n\n"${payload.text}"\n\n#MIND_SYNC #AI #CognitiveSparring #NeuralMirror`);
    setCopiedInstagram(true);
    setTimeout(() => setCopiedInstagram(false), 2500);
    window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shareModalTitle"
    >
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700/80 p-6 flex flex-col gap-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="shareModalTitle" className="font-mono font-bold text-sm text-slate-100">
                {payload.title || 'Share Sparring Milestone'}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Broadcast breakthroughs to social networks
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

        {/* Milestone / Content Preview Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-800/60 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
            <span>MIND_SYNC · COGNITIVE SPARRING</span>
            {payload.milestone && (
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px]">
                {payload.milestone}
              </span>
            )}
          </div>
          <p className="text-slate-200 text-xs sm:text-sm italic leading-relaxed">
            "{payload.text.slice(0, 280)}{payload.text.length > 280 ? '...' : ''}"
          </p>
          <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80 flex items-center justify-between">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>Tabular Telemetry Verified</span>
          </div>
        </div>

        {/* Social Platforms Grid */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-300 block font-semibold">
            SELECT DESTINATION:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* Twitter / X */}
            <button
              type="button"
              onClick={handleTwitterShare}
              className="p-3 rounded-xl bg-[#0F1419] hover:bg-black border border-slate-700 hover:border-cyan-500 text-slate-200 hover:text-white transition-all flex items-center gap-2.5 shadow-sm cursor-pointer"
            >
              <Twitter className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="text-left">
                <span className="font-bold block">X (Twitter)</span>
                <span className="text-[10px] text-slate-400">Direct Tweet intent</span>
              </div>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={handleFacebookShare}
              className="p-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/40 hover:border-[#1877F2] text-slate-200 hover:text-white transition-all flex items-center gap-2.5 shadow-sm cursor-pointer"
            >
              <Facebook className="w-4 h-4 text-[#1877F2] shrink-0" />
              <div className="text-left">
                <span className="font-bold block">Facebook</span>
                <span className="text-[10px] text-slate-400">Share to timeline</span>
              </div>
            </button>

            {/* Instagram */}
            <button
              type="button"
              onClick={handleInstagramShare}
              className="p-3 rounded-xl bg-gradient-to-r from-fuchsia-950/40 via-purple-950/40 to-pink-950/40 hover:from-fuchsia-900/60 hover:to-pink-900/60 border border-fuchsia-700/50 hover:border-fuchsia-500 text-slate-200 hover:text-white transition-all flex items-center gap-2.5 shadow-sm cursor-pointer"
            >
              <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
              <div className="text-left">
                <span className="font-bold block">Instagram</span>
                <span className="text-[10px] text-pink-300">
                  {copiedInstagram ? 'Caption Copied!' : 'Copy & Open IG'}
                </span>
              </div>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={handleLinkedinShare}
              className="p-3 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/40 hover:border-[#0A66C2] text-slate-200 hover:text-white transition-all flex items-center gap-2.5 shadow-sm cursor-pointer"
            >
              <Linkedin className="w-4 h-4 text-[#0A66C2] shrink-0" />
              <div className="text-left">
                <span className="font-bold block">LinkedIn</span>
                <span className="text-[10px] text-slate-400">Professional post</span>
              </div>
            </button>
          </div>
        </div>

        {/* Copy to Clipboard Bar */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
