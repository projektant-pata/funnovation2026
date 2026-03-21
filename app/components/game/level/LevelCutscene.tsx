'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

type CutsceneCharacter = {
  id: string
  name: string
  side: 'left' | 'right'
  avatar?: string
}

type CutsceneLine = {
  speakerId: string
  text: string
}

type Props = {
  title: string
  setting: string
  backgroundOptions: string[]
  characters: CutsceneCharacter[]
  lines: CutsceneLine[]
  modeLabel: string
  tapHintLabel: string
  skipLabel: string
  narratorLabel: string
  continueLabel: string
  onContinue: () => void
}

export default function LevelCutscene({
  title,
  setting,
  backgroundOptions,
  characters,
  lines,
  modeLabel,
  tapHintLabel,
  skipLabel,
  narratorLabel,
  continueLabel,
  onContinue,
}: Props) {
  const [lineIndex, setLineIndex] = useState(0)
  const [revealedChars, setRevealedChars] = useState(0)
  const selectedBackground = backgroundOptions[0] ?? ''

  const line = lines[lineIndex]
  const fullText = line?.text ?? ''

  const characterById = useMemo(() => {
    return new Map(characters.map((character) => [character.id, character]))
  }, [characters])

  const activeCharacter = line ? characterById.get(line.speakerId) : characters[0]
  const leftCharacter = characters.find((character) => character.side === 'left')
  const rightCharacter = characters.find((character) => character.side === 'right')

  useEffect(() => {
    if (!fullText) return
    if (revealedChars >= fullText.length) return

    const id = window.setTimeout(() => {
      setRevealedChars((prev) => Math.min(prev + 1, fullText.length))
    }, 20)

    return () => window.clearTimeout(id)
  }, [fullText, revealedChars])

  const isTextFullyVisible = revealedChars >= fullText.length
  const isLastLine = lineIndex === lines.length - 1

  function handleAdvance() {
    if (!isTextFullyVisible) {
      setRevealedChars(fullText.length)
      return
    }

    if (!isLastLine) {
      setRevealedChars(0)
      setLineIndex((prev) => prev + 1)
      return
    }

    onContinue()
  }

  const backgroundStyle = selectedBackground
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(18, 12, 10, 0.12), rgba(18, 12, 10, 0.72)), url(${selectedBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage:
          'radial-gradient(circle at 20% 30%, rgba(245, 166, 35, 0.35), transparent 45%), radial-gradient(circle at 80% 20%, rgba(109, 76, 65, 0.4), transparent 48%), linear-gradient(165deg, #4e342e 0%, #3e2723 100%)',
      }

  return (
    <section className="w-full min-h-[100dvh]">
      <div
        className="relative w-full min-h-[100dvh] overflow-hidden"
        style={backgroundStyle}
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_40%)]" />

        <div className="relative z-10 px-5 pt-6 md:px-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#FFF8E1]/75">{modeLabel}</p>
          <h1 className="text-2xl md:text-3xl font-black text-[#FFF8E1] mt-1">{title}</h1>
          <p className="text-sm md:text-base text-[#FFF8E1]/85 mt-2 max-w-2xl">{setting}</p>
        </div>

        <div className="hidden md:block absolute inset-x-0 bottom-0 top-[5.75rem] pointer-events-none">
          {leftCharacter && (
            <CharacterSprite
              key={leftCharacter.id}
              character={leftCharacter}
              active={activeCharacter?.id === leftCharacter.id}
              side="left"
            />
          )}

          {rightCharacter && (
            <CharacterSprite
              key={rightCharacter.id}
              character={rightCharacter}
              active={activeCharacter?.id === rightCharacter.id}
              side="right"
            />
          )}
        </div>

        <div className="md:hidden absolute inset-x-0 bottom-0 top-[5.75rem] pointer-events-none flex items-end justify-center px-4">
          {activeCharacter && (
            <CharacterSprite
              character={activeCharacter}
              active
              side="center"
            />
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
          <button
            type="button"
            onClick={handleAdvance}
            className="w-full text-left rounded-2xl border border-[#FFF8E1]/40 bg-[#231815]/80 backdrop-blur-md px-4 py-4 md:px-5 md:py-5 shadow-xl hover:bg-[#2b1d18]/85 transition-colors"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-xs uppercase tracking-[0.16em] text-[#FEDC56] font-bold">
                {activeCharacter?.name ?? narratorLabel}
              </p>
              <p className="text-[11px] text-[#FFF8E1]/65">
                {isLastLine && isTextFullyVisible ? continueLabel : tapHintLabel}
              </p>
            </div>
            <p className="text-[15px] md:text-[17px] leading-relaxed text-[#FFF8E1] min-h-[4.5rem] md:min-h-[5rem]">
              {fullText.slice(0, revealedChars)}
              {!isTextFullyVisible && <span className="vn-cursor">|</span>}
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[#FFF8E1]/60">
              <span>
                {lineIndex + 1}/{lines.length}
              </span>
              <span>{isTextFullyVisible ? '▼' : '...'}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="mt-3 rounded-xl bg-[#4E342E]/90 hover:bg-[#5D4037] text-[#FFF8E1] text-sm font-semibold px-4 py-2 transition-colors"
          >
            {skipLabel}
          </button>
        </div>

        <style>{`
          @keyframes vn-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-7px); }
          }
          .vn-float {
            animation: vn-float 2.5s ease-in-out infinite;
          }
          @keyframes vn-cursor {
            0%, 45% { opacity: 1; }
            46%, 100% { opacity: 0; }
          }
          .vn-cursor {
            display: inline-block;
            margin-left: 2px;
            animation: vn-cursor 0.9s linear infinite;
          }
        `}</style>
      </div>
    </section>
  )
}

function CharacterSprite({
  character,
  active,
  side,
}: {
  character: CutsceneCharacter
  active: boolean
  side: 'left' | 'right' | 'center'
}) {
  const positionClass =
    side === 'left'
      ? 'left-[-11vw]'
      : side === 'right'
        ? 'right-[-11vw]'
        : 'left-1/2 -translate-x-1/2'

  const sizeClass = side === 'center' ? 'h-[65vh] w-[65vh]' : 'h-[95vh] w-[95vh]'

  return (
    <div
      className={`absolute bottom-[2rem] ${positionClass} pointer-events-none transition-all duration-500 ${
        active
          ? 'vn-float opacity-100 grayscale-0 brightness-110 saturate-125'
          : 'opacity-55 grayscale brightness-50 saturate-0'
      }`}
    >
      {character.avatar ? (
        <Image
          src={character.avatar}
          alt={character.name}
          width={600}
          height={600}
          className={`${sizeClass} object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.38)]`}
        />
      ) : (
        <div className="h-20 w-20 rounded-full bg-[#FFF8E1]/30 flex items-center justify-center text-[#FFF8E1] text-3xl font-bold">
          {character.name.charAt(0)}
        </div>
      )}
    </div>
  )
}
