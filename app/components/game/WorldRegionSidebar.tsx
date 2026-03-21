'use client'

import Link from 'next/link'
import type { WorldRegion } from '@/app/lib/mockWorldRegions'

type Labels = {
  enterRegion: string
  recipesCompleted: string
  comingSoon: string
  regionLocked: string
}

type Props = {
  region: WorldRegion
  lang: 'cs' | 'en'
  labels: Labels
  onClose: () => void
}

export default function WorldRegionSidebar({ region, lang, labels, onClose }: Props) {
  const isLocked = region.status === 'locked'
  const pct = region.totalRecipes > 0 ? Math.round((region.completedRecipes / region.totalRecipes) * 100) : 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      {/* Panel — right on desktop, bottom on mobile */}
      <div className="fixed z-50 animate-[slideIn_200ms_ease-out] bg-[#FFF3E0] border-l border-[#4E342E]/10 shadow-2xl
        bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl
        md:top-0 md:right-0 md:left-auto md:bottom-0 md:max-h-none md:w-[360px] md:rounded-t-none md:rounded-l-2xl
        flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: isLocked ? '#9E9E9E' : region.color }}
            >
              {isLocked ? (
                <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-[#4E342E] font-bold text-lg leading-tight">{region.name[lang]}</h2>
              {region.countryCodes.length > 0 && (
                <p className="text-[#6D4C41]/50 text-xs">
                  {region.countryCodes.join(' · ')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#4E342E]/5 hover:bg-[#4E342E]/10 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4 text-[#4E342E]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <p className="text-[#6D4C41]/70 text-sm mb-4 leading-relaxed">
            {region.description[lang]}
          </p>

          {!isLocked && (
            <>
              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[#4E342E] text-xs font-semibold">
                    {region.completedRecipes}/{region.totalRecipes} {labels.recipesCompleted}
                  </span>
                  <span className="text-[#6D4C41]/50 text-xs">{pct}%</span>
                </div>
                <div className="h-2 bg-[#4E342E]/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: region.color,
                    }}
                  />
                </div>
              </div>

              {/* Difficulty overview */}
              <div className="flex gap-2 mb-5">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className="flex-1 bg-[#4E342E]/5 rounded-lg p-2 text-center"
                  >
                    <div className="text-[#4E342E]/30 text-xs mb-0.5">
                      {'★'.repeat(level)}
                    </div>
                    <div className="text-[#4E342E] text-[10px] font-medium">
                      {level === 1 ? (lang === 'cs' ? 'Lehké' : 'Easy') : level === 2 ? (lang === 'cs' ? 'Střední' : 'Medium') : (lang === 'cs' ? 'Těžké' : 'Hard')}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Action */}
          {isLocked ? (
            <div className="bg-[#4E342E]/5 rounded-xl p-4 text-center">
              <svg className="w-8 h-8 text-[#4E342E]/20 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <p className="text-[#4E342E]/40 text-sm font-semibold">{labels.comingSoon}</p>
              <p className="text-[#6D4C41]/30 text-xs mt-1">{labels.regionLocked}</p>
            </div>
          ) : (
            <Link
              href={`/${lang}/game/world/${region.id}`}
              className="block w-full text-center rounded-xl py-3 px-4 font-bold text-sm transition-colors"
              style={{
                backgroundColor: region.color,
                color: '#FFF8E1',
              }}
            >
              {labels.enterRegion}
            </Link>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @media (min-width: 768px) {
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        }
      `}</style>
    </>
  )
}
