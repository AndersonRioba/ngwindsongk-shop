'use client'

import { useState, useEffect, useCallback } from "react";
import { Check, Share2, X } from "lucide-react";

/**
 * ShareModal — reusable social-share modal.
 *
 * Props:
 *   isOpen     {boolean}   — controls visibility
 *   onClose    {function}  — called when the modal should close
 *   title      {string}    — name of the content being shared
 *   shareText  {string}    — pre-filled message for platforms that accept text
 *   url        {string}    — URL to share; defaults to window.location.href
 */
export default function ShareModal({ isOpen, onClose, title = '', shareText = '', url }) {
    const [copySuccess, setCopySuccess] = useState(false);
    const [tiktokCopied, setTiktokCopied] = useState(false);
    const [instagramCopied, setInstagramCopied] = useState(false);

    const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText || `Check out: ${title}`);

    const close = useCallback(() => { onClose?.(); }, [onClose]);

    // Close on ESC
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') close(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, close]);

    // Prevent body scroll while open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const copyToClipboard = async (text, setter) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const el = document.createElement('input');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        setter(true);
        setTimeout(() => setter(false), 2500);
    };

    const handleCopyLink = () => copyToClipboard(shareUrl, setCopySuccess);
    const handleTikTok   = () => copyToClipboard(shareUrl, setTiktokCopied);
    const handleInstagram = () => copyToClipboard(shareUrl, setInstagramCopied);

    const handleNativeShare = async () => {
        const data = { title, text: shareText || `Check out: ${title}`, url: shareUrl };
        try {
            if (navigator.share && navigator.canShare?.(data)) {
                await navigator.share(data);
            } else {
                handleCopyLink();
            }
        } catch { /* user cancelled */ }
    };

    const platforms = [
        {
            id: 'whatsapp',
            label: 'WhatsApp',
            icon: 'icon-[tabler--brand-whatsapp]',
            color: '#25D366',
            action: 'link',
            href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
        },
        {
            id: 'facebook',
            label: 'Facebook',
            icon: 'icon-[tabler--brand-facebook]',
            color: '#1877F2',
            action: 'link',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
        {
            id: 'tiktok',
            label: 'TikTok',
            icon: 'icon-[tabler--brand-tiktok]',
            color: '#010101',
            action: 'copy',
            copied: tiktokCopied,
            handler: handleTikTok,
            hint: 'Link copied! Paste it in TikTok.',
        },
        {
            id: 'instagram',
            label: 'Instagram',
            icon: 'icon-[tabler--brand-instagram]',
            color: '#E1306C',
            action: 'copy',
            copied: instagramCopied,
            handler: handleInstagram,
            hint: 'Link copied! Paste it in Instagram.',
        },
    ];

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label={`Share ${title}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={close}
            />

            {/* Panel */}
            <div className="relative bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 md:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={close}
                    id="share-modal-close"
                    className="absolute top-7 right-7 p-2 rounded-full hover:bg-black/5 transition-colors"
                    aria-label="Close share modal"
                >
                    <X size={20} className="text-black/40" />
                </button>

                {/* Header */}
                <div className="space-y-1 mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Share</p>
                    <h2 className="text-2xl font-semibold tracking-tight text-black leading-tight line-clamp-2">
                        {title || 'Share this page'}
                    </h2>
                </div>

                {/* Social platform grid */}
                <div className="grid grid-cols-4 gap-3 mb-8">
                    {platforms.map((p) => (
                        <div key={p.id} className="relative flex flex-col items-center">
                            {p.action === 'link' ? (
                                <a
                                    id={`share-${p.id}`}
                                    href={p.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col items-center gap-2 w-full"
                                    aria-label={`Share on ${p.label}`}
                                >
                                    <div
                                        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                                        style={{ backgroundColor: `${p.color}18`, color: p.color }}
                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = p.color; e.currentTarget.style.color = '#fff'; }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${p.color}18`; e.currentTarget.style.color = p.color; }}
                                    >
                                        <span className={`${p.icon} w-6 h-6`} />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-black/40 group-hover:text-black transition-colors text-center">
                                        {p.label}
                                    </span>
                                </a>
                            ) : (
                                <button
                                    id={`share-${p.id}`}
                                    onClick={p.handler}
                                    className="group flex flex-col items-center gap-2 w-full"
                                    aria-label={`Copy link to share on ${p.label}`}
                                >
                                    <div
                                        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                                        style={{
                                            backgroundColor: p.copied ? '#22c55e18' : `${p.color}18`,
                                            color: p.copied ? '#22c55e' : p.color,
                                        }}
                                        onMouseEnter={e => { if (!p.copied) { e.currentTarget.style.backgroundColor = p.color; e.currentTarget.style.color = '#fff'; } }}
                                        onMouseLeave={e => { if (!p.copied) { e.currentTarget.style.backgroundColor = `${p.color}18`; e.currentTarget.style.color = p.color; } }}
                                    >
                                        {p.copied
                                            ? <Check size={22} />
                                            : <span className={`${p.icon} w-6 h-6`} />
                                        }
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-black/40 group-hover:text-black transition-colors text-center">
                                        {p.copied ? 'Copied!' : p.label}
                                    </span>
                                </button>
                            )}

                            {/* Tooltip shown after copy */}
                            {p.action === 'copy' && p.copied && (
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl animate-in fade-in zoom-in-95 duration-200 z-10">
                                    {p.hint}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Copy link section */}
                <div className="border-t border-black/5 pt-6 space-y-3">
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">Or copy link</p>

                    <div className="flex items-center gap-2 p-2 bg-[#f9f9f7] rounded-2xl border border-black/5">
                        <p className="flex-1 px-3 text-xs text-black/50 font-medium truncate select-all">
                            {shareUrl}
                        </p>
                        <button
                            id="share-copy-link"
                            onClick={handleCopyLink}
                            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${
                                copySuccess
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                    : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                            }`}
                            aria-label="Copy link to clipboard"
                        >
                            {copySuccess ? <><Check size={12} /> Copied</> : 'Copy'}
                        </button>
                    </div>

                    {/* Native share — only rendered when the API exists */}
                    {typeof window !== 'undefined' && !!navigator.share && (
                        <button
                            id="share-native"
                            onClick={handleNativeShare}
                            className="w-full py-3.5 rounded-2xl bg-[#f9f9f7] hover:bg-black/5 text-black/50 font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <Share2 size={14} />
                            More sharing options
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
