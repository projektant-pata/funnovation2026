'use client'

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import WorldRegionSidebar from './WorldRegionSidebar'
import type { WorldRegion } from '@/app/lib/mockWorldRegions'
import type { MapViewBox } from './WorldMapSvg'

const WorldMapSvg = dynamic(() => import('./WorldMapSvg'), { ssr: false })

const MAP_W = 800
const MAP_H = 500
const MIN_ZOOM = 0.5
const MAX_ZOOM = 4

type Labels = {
  enterRegion: string
  recipesCompleted: string
  comingSoon: string
  regionLocked: string
  title: string
  subtitle: string
}

type Props = {
  regions: WorldRegion[]
  lang: 'cs' | 'en'
  labels: Labels
}

export default function WorldMapView({ regions, lang, labels }: Props) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  const [vb, setVb] = useState<MapViewBox>({ x: 0, y: 0, w: MAP_W, h: MAP_H })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; vbX: number; vbY: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedRegion = selectedRegionId
    ? regions.find((r) => r.id === selectedRegionId) ?? null
    : null

  function handleRegionClick(regionId: string) {
    setSelectedRegionId(regionId === selectedRegionId ? null : regionId)
  }

  // ─── Pan ───
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      setDragging(true)
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        vbX: vb.x,
        vbY: vb.y,
      }
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    },
    [vb.x, vb.y]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !dragRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const drag = dragRef.current
      const dx = ((e.clientX - drag.startX) / rect.width) * vb.w
      const dy = ((e.clientY - drag.startY) / rect.height) * vb.h
      setVb((prev) => ({
        ...prev,
        x: drag.vbX - dx,
        y: drag.vbY - dy,
      }))
    },
    [dragging, vb.w, vb.h]
  )

  const onPointerUp = useCallback(() => {
    setDragging(false)
    dragRef.current = null
  }, [])

  // ─── Zoom via buttons ───
  function zoomBy(factor: number) {
    setVb((prev) => {
      const newW = Math.max(MAP_W / MAX_ZOOM, Math.min(MAP_W / MIN_ZOOM, prev.w * factor))
      const newH = Math.max(MAP_H / MAX_ZOOM, Math.min(MAP_H / MIN_ZOOM, prev.h * factor))
      return {
        x: prev.x + (prev.w - newW) / 2,
        y: prev.y + (prev.h - newH) / 2,
        w: newW,
        h: newH,
      }
    })
  }

  function resetView() {
    setVb({ x: 0, y: 0, w: MAP_W, h: MAP_H })
  }

  const btnClass =
    'w-10 h-10 bg-[#FFF3E0] border border-[#4E342E]/10 flex items-center justify-center hover:bg-[#FEDC56]/20 transition-colors pointer-events-auto'

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#FFF3E0] overflow-hidden relative -mb-24"
      style={{
        height: 'calc(100vh - 56px)',
        touchAction: 'none',
        cursor: dragging ? 'grabbing' : 'grab',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Title overlay */}
      <div className="absolute top-4 left-0 right-0 z-10 text-center pointer-events-none">
        <h1 className="text-lg font-bold text-[#4E342E] tracking-wide">
          {labels.title}
        </h1>
        <p className="text-[10px] text-[#6D4C41]/60 mt-0.5">
          {labels.subtitle}
        </p>
      </div>

      {/* Map controls — right side */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col rounded-xl overflow-hidden shadow-lg pointer-events-none">
        <button onClick={() => zoomBy(0.7)} className={`${btnClass} rounded-t-xl`} aria-label="Zoom in">
          <svg className="w-5 h-5 text-[#4E342E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button onClick={resetView} className={`${btnClass} border-t-0 border-b-0`} aria-label="Reset view">
          <svg className="w-5 h-5 text-[#4E342E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
        <button onClick={() => zoomBy(1.4)} className={`${btnClass} rounded-b-xl`} aria-label="Zoom out">
          <svg className="w-5 h-5 text-[#4E342E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Map */}
      <WorldMapSvg
        regions={regions}
        onRegionClick={handleRegionClick}
        selectedRegionId={selectedRegionId}
        lang={lang}
        viewBox={vb}
      />

      {/* Sidebar */}
      {selectedRegion && (
        <WorldRegionSidebar
          region={selectedRegion}
          lang={lang}
          labels={labels}
          onClose={() => setSelectedRegionId(null)}
        />
      )}
    </div>
  )
}
