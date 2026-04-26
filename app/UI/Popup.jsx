'use client'
import { useState, useEffect, useCallback } from "react"

const POPUP_STATES = {
    Success: {
        icon: 'icon-[solar--check-circle-bold-duotone]',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100'
    },
    Warning: {
        icon: 'icon-[solar--danger-bold-duotone]',
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        border: 'border-amber-100'
    },
    Error: {
        icon: 'icon-[solar--close-circle-bold-duotone]',
        color: 'text-rose-500',
        bg: 'bg-rose-50',
        border: 'border-rose-100'
    },
    Processing: {
        icon: 'icon-[line-md--loading-twotone-loop]',
        color: 'text-indigo-500',
        bg: 'bg-indigo-50',
        border: 'border-indigo-100'
    }
}

export default function Popup() {
    const [hidden, setHidden] = useState(true)
    const [state, setState] = useState('Success')
    const [message, setMessage] = useState('')

    const handler = useCallback(e => {
        let normalizedState = e.detail.state;
        if (normalizedState) {
            normalizedState = normalizedState.charAt(0).toUpperCase() + normalizedState.slice(1).toLowerCase();
        }
        
        if (!POPUP_STATES[normalizedState]) {
            normalizedState = 'Processing';
        }

        setState(normalizedState)
        setMessage(e.detail.message)
        setHidden(false)
    }, []);

    useEffect(() => {
        window.addEventListener('popup', handler)
        return () => window.removeEventListener('popup', handler)
    }, [handler])

    useEffect(() => {
        if (!hidden && state !== 'Processing') {
            const timer = setTimeout(() => setHidden(true), 4000)
            return () => clearTimeout(timer)
        }
    }, [hidden, state])

    if (hidden) return null;

    const config = POPUP_STATES[state] || POPUP_STATES.Processing;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-none">
            {/* Backdrop Blur */}
            <div 
                className="absolute inset-0 bg-gray-900/10 backdrop-blur-[2px] transition-opacity duration-500 pointer-events-auto"
                onClick={() => state !== 'Processing' && setHidden(true)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-900/20 border border-gray-50 overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 pointer-events-auto">
                <div className="p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-[1.8rem] ${config.bg} flex items-center justify-center ${config.color} mb-6 shadow-inner`}>
                            <span className={`${config.icon} w-10 h-10`} />
                        </div>
                        
                        <h4 className={`text-xs font-black uppercase tracking-[0.3em] ${config.color} mb-2`}>
                            {state}
                        </h4>
                        
                        <p className="text-gray-600 font-bold text-sm leading-relaxed px-2">
                            {message}
                        </p>
                    </div>

                    {state !== 'Processing' && (
                        <button 
                            onClick={() => setHidden(true)}
                            className="mt-8 w-full py-4 rounded-2xl bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 hover:text-gray-600 transition-all"
                        >
                            Dismiss
                        </button>
                    )}
                </div>

                {/* Progress bar for auto-dismiss */}
                {state !== 'Processing' && (
                    <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full">
                        <div className={`h-full ${config.color.replace('text-', 'bg-')} animate-progress`} />
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-progress {
                    animation: progress 4s linear forwards;
                }
            `}</style>
        </div>
    )
}