'use client'

import { useRef, useState } from 'react'

const team = [
  { name: 'Nikola Horáčková', role: 'Frontend Developer', photo: '/chefs/niki.png' },
  { name: 'Patrik Novák', role: 'Full Stack Developer', photo: '/chefs/pata.png' },
  { name: 'Štěpánka Krejčí', role: 'UX Designer', photo: '/chefs/stefy.png' },
  { name: 'Milan Dvořák', role: 'Backend Developer', photo: '/chefs/pata.png' },
  { name: 'Tereza Marková', role: 'AI Engineer', photo: '/chefs/niki.png' },
  { name: 'Jakub Pospíšil', role: 'Product Manager', photo: '/chefs/stefy.png' },
  { name: 'Lucie Bendová', role: 'Data Scientist', photo: '/chefs/niki.png' },
  { name: 'Tomáš Veselý', role: 'DevOps Engineer', photo: '/chefs/pata.png' },
]

const SCROLL_STEP = 280 // card width (256) + gap (24)

export default function TeamSlider() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const onScroll = () => {
    const el = containerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  const scroll = (dir: 'left' | 'right') => {
    containerRef.current?.scrollBy({ left: dir === 'right' ? SCROLL_STEP : -SCROLL_STEP, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* Slider track */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto px-6 pb-4"
        style={{ scrollbarWidth: 'none' }}
        onScroll={onScroll}
      >
        {team.map((member, i) => (
          <div key={i} className="flex-shrink-0 w-64 text-center">
            <div className="w-44 h-44 rounded-full overflow-hidden mx-auto mb-5 bg-[#FFF3E0] border-4 border-[#FEDC56]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
            </div>
            <div className="font-bold text-[#4E342E] text-base leading-tight">{member.name}</div>
            <div className="text-[#6D4C41]/50 text-sm mt-1.5">{member.role}</div>
          </div>
        ))}
        {/* Trailing spacer so last card doesn't sit against edge */}
        <div className="flex-shrink-0 w-2" aria-hidden />
      </div>

      {/* Right gradient + arrow */}
      <div className="absolute right-0 inset-y-0 w-28 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none" />
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-4 top-20 w-12 h-12 bg-[#FEDC56] hover:bg-[#f5d430] text-[#4E342E] rounded-full font-bold text-xl flex items-center justify-center shadow-lg transition-colors z-10"
          aria-label="Scroll right"
        >
          →
        </button>
      )}

      {/* Left gradient + arrow */}
      {canScrollLeft && (
        <>
          <div className="absolute left-0 inset-y-0 w-28 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none" />
          <button
            onClick={() => scroll('left')}
            className="absolute left-4 top-20 w-12 h-12 bg-[#FEDC56] hover:bg-[#f5d430] text-[#4E342E] rounded-full font-bold text-xl flex items-center justify-center shadow-lg transition-colors z-10"
            aria-label="Scroll left"
          >
            ←
          </button>
        </>
      )}
    </div>
  )
}
