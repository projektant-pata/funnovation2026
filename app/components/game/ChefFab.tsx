'use client'

import { useState } from 'react'

type Props = {
  labels: {
    chef: string
    chefDescription: string
    comingSoon: string
  }
}

export default function ChefFab({ labels }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Chat sidebar — always rendered, animated with transform */}
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-[#2C3E50] border-l border-white/10 z-[60] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ChefHatIcon className="w-6 h-6 text-[#FEDC56]" />
            <span className="text-white font-bold text-lg">{labels.chef}</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors duration-150"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <ChefHatIcon className="w-16 h-16 text-[#FEDC56]/30 mb-4" />
          <p className="text-white/40 text-sm">{labels.chefDescription}</p>
          <p className="text-white/20 text-xs mt-2">{labels.comingSoon}</p>
        </div>
      </div>

      {/* Backdrop — always rendered, animated with opacity */}
      <div
        className={`fixed inset-0 bg-black/30 z-[55] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-6 z-[60] w-14 h-14 rounded-full bg-[#FEDC56] hover:bg-[#f5d430] hover:scale-105 text-[#4E342E] shadow-lg flex items-center justify-center transition-all duration-200"
        aria-label={labels.chef}
      >
        <ChefHatIcon className={`w-7 h-7 transition-transform duration-300 ${open ? 'rotate-12' : ''}`} />
      </button>
    </>
  )
}

function ChefHatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C9.24 2 7 4.24 7 7c-2.21 0-4 1.79-4 4 0 1.95 1.4 3.57 3.25 3.92L7 19h10l.75-4.08C19.6 14.57 21 12.95 21 11c0-2.21-1.79-4-4-4 0-2.76-2.24-5-5-5zM7 21h10v1H7v-1z" />
    </svg>
  )
}
