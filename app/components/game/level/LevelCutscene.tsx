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
  thought?: boolean
}

type CutsceneSegment =
  | { type: 'scene'; background: string; lines: CutsceneLine[] }
  | { type: 'transition'; caption: string }

type Props = {
  title: string
  characters: CutsceneCharacter[]
  segments: CutsceneSegment[]
  modeLabel: string
  tapHintLabel: string
  skipLabel: string
  narratorLabel: string
  continueLabel: string
  onContinue: () => void
}

type ScreenState =
  | { kind: 'scene'; segIdx: number; lineIdx: number }
  | { kind: 'caption'; text: string; nextSegIdx: number }

export default function LevelCutscene({
  title,
  characters,
  segments,
  modeLabel,
  tapHintLabel,
  skipLabel,
  narratorLabel,
  continueLabel,
  onContinue,
}: Props) {
  const [screen, setScreen] = useState<ScreenState>(() => {
    if (segments[0]?.type === 'transition') {
      return { kind: 'caption', text: segments[0].caption, nextSegIdx: 1 }
    }
    return { kind: 'scene', segIdx: 0, lineIdx: 0 }
  })
  const [revealedChars, setRevealedChars] = useState(0)
  const [overlayOpaque, setOverlayOpaque] = useState(false)

  const characterById = useMemo(() => {
    return new Map(characters.map((character) => [character.id, character]))
  }, [characters])

  // Derive current scene data for rendering
  const currentScene =
    screen.kind === 'scene' && segments[screen.segIdx]?.type === 'scene'
      ? (segments[screen.segIdx] as { type: 'scene'; background: string; lines: CutsceneLine[] })
      : null

  const currentLine = currentScene ? currentScene.lines[screen.kind === 'scene' ? screen.lineIdx : 0] : null
  const fullText = currentLine?.text ?? ''

  useEffect(() => {
    if (screen.kind !== 'scene') return
    if (!fullText) return
    if (revealedChars >= fullText.length) return

    const id = window.setTimeout(() => {
      setRevealedChars((prev) => Math.min(prev + 1, fullText.length))
    }, 20)

    return () => window.clearTimeout(id)
  }, [screen.kind, fullText, revealedChars])

  // Reset typewriter when line changes
  useEffect(() => {
    setRevealedChars(0)
  }, [screen])

  function fadeTransition(afterFade: () => void) {
    setOverlayOpaque(true)
    setTimeout(() => {
      afterFade()
      requestAnimationFrame(() => requestAnimationFrame(() => setOverlayOpaque(false)))
    }, 400)
  }

  function handleAdvance() {
    if (screen.kind === 'caption') {
      fadeTransition(() => {
        if (screen.nextSegIdx >= segments.length) {
          onContinue()
          return
        }
        const nextSeg = segments[screen.nextSegIdx]
        if (nextSeg.type === 'scene') {
          setScreen({ kind: 'scene', segIdx: screen.nextSegIdx, lineIdx: 0 })
        } else {
          setScreen({ kind: 'caption', text: nextSeg.caption, nextSegIdx: screen.nextSegIdx + 1 })
        }
      })
      return
    }

    // screen.kind === 'scene'
    const isTextFullyVisible = revealedChars >= fullText.length

    if (!isTextFullyVisible) {
      setRevealedChars(fullText.length)
      return
    }

    if (!currentScene) return

    const isLastLine = screen.lineIdx === currentScene.lines.length - 1

    if (!isLastLine) {
      setScreen({ kind: 'scene', segIdx: screen.segIdx, lineIdx: screen.lineIdx + 1 })
      return
    }

    // Last line of scene — advance to next segment
    const nextSegIdx = screen.segIdx + 1

    if (nextSegIdx >= segments.length) {
      onContinue()
      return
    }

    const nextSeg = segments[nextSegIdx]
    if (nextSeg.type === 'transition') {
      fadeTransition(() => {
        setScreen({ kind: 'caption', text: nextSeg.caption, nextSegIdx: nextSegIdx + 1 })
      })
    } else {
      fadeTransition(() => {
        setScreen({ kind: 'scene', segIdx: nextSegIdx, lineIdx: 0 })
      })
    }
  }

  // Caption screen
  if (screen.kind === 'caption') {
    return (
      <section className="w-full min-h-[100dvh]">
        <div
          className="relative w-full min-h-[100dvh] overflow-hidden bg-black flex flex-col items-center justify-center"
          onClick={handleAdvance}
        >
          <p className="text-2xl md:text-4xl italic text-[#FFF8E1]/90 text-center max-w-2xl px-8 leading-snug">
            {screen.text}
          </p>
          <p className="mt-8 text-sm text-[#FFF8E1]/45 tracking-widest uppercase">
            {tapHintLabel}
          </p>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onContinue() }}
            className="absolute bottom-6 left-4 rounded-xl bg-[#4E342E]/90 hover:bg-[#5D4037] text-[#FFF8E1] text-sm font-semibold px-4 py-2 transition-colors"
          >
            {skipLabel}
          </button>

          <div
            className={`fixed inset-0 bg-black z-[200] pointer-events-none transition-opacity duration-[400ms] ${overlayOpaque ? 'opacity-100' : 'opacity-0'}`}
          />
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
      </section>
    )
  }

  // Scene screen
  if (!currentScene || !currentLine) return null

  const activeCharacter = characterById.get(currentLine.speakerId)

  // Only show sprites for characters that speak in this scene
  const sceneCharacterIds = new Set(currentScene.lines.map((l) => l.speakerId))
  const sceneCharacters = characters.filter((c) => sceneCharacterIds.has(c.id))
  const leftCharacter = sceneCharacters.find((c) => c.side === 'left')
  const rightCharacter = sceneCharacters.find((c) => c.side === 'right')

  const isTextFullyVisible = revealedChars >= fullText.length
  const isLastLine = screen.lineIdx === currentScene.lines.length - 1

  // Count total lines seen across segments for progress display
  const totalLines = segments.reduce((sum, seg) => {
    if (seg.type === 'scene') return sum + seg.lines.length
    return sum
  }, 0)
  const linesBeforeThisSegment = segments.slice(0, screen.segIdx).reduce((sum, seg) => {
    if (seg.type === 'scene') return sum + seg.lines.length
    return sum
  }, 0)
  const globalLineIndex = linesBeforeThisSegment + screen.lineIdx

  const backgroundStyle = currentScene.background
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(18, 12, 10, 0.12), rgba(18, 12, 10, 0.72)), url(${currentScene.background})`,
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
            <p className={`text-[15px] md:text-[17px] leading-relaxed text-[#FFF8E1] min-h-[4.5rem] md:min-h-[5rem] ${currentLine.thought ? 'italic' : ''}`}>
              {fullText.slice(0, revealedChars)}
              {!isTextFullyVisible && <span className="vn-cursor">|</span>}
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[#FFF8E1]/60">
              <span>
                {globalLineIndex + 1}/{totalLines}
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

        <div
          className={`fixed inset-0 bg-black z-[200] pointer-events-none transition-opacity duration-[400ms] ${overlayOpaque ? 'opacity-100' : 'opacity-0'}`}
        />

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
