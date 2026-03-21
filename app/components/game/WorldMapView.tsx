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
  const pinchRef = useRef<{ id: number; x: number; y: number }[]>([])
  const lastPinchDist = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedRegion = selectedRegionId
    ? regions.find((r) => r.id === selectedRegionId) ?? null
    : null

  function handleRegionClick(regionId: string) {
    setSelectedRegionId(regionId === selectedRegionId ? null : regionId)
  }

  function clampVb(x: number, y: number, w: number, h: number): MapViewBox {
    const newW = Math.max(MAP_W / MAX_ZOOM, Math.min(MAP_W / MIN_ZOOM, w))
    const newH = Math.max(MAP_H / MAX_ZOOM, Math.min(MAP_H / MIN_ZOOM, h))
    return { x, y, w: newW, h: newH }
  }

  function zoomAround(cx: number, cy: number, factor: number) {
    setVb((prev) => {
      const newW = Math.max(MAP_W / MAX_ZOOM, Math.min(MAP_W / MIN_ZOOM, prev.w * factor))
      const newH = Math.max(MAP_H / MAX_ZOOM, Math.min(MAP_H / MIN_ZOOM, prev.h * factor))
      // keep the point under cursor fixed
      const newX = cx - (cx - prev.x) * (newW / prev.w)
      const newY = cy - (cy - prev.y) * (newH / prev.h)
      return { x: newX, y: newY, w: newW, h: newH }
    })
  }

  // ─── Wheel zoom ───
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const factor = e.deltaY > 0 ? 1.15 : 0.87
      // cursor position in viewBox coords
      const cx = vb.x + ((e.clientX - rect.left) / rect.width) * vb.w
      const cy = vb.y + ((e.clientY - rect.top) / rect.height) * vb.h
      zoomAround(cx, cy, factor)
    },
    [vb]
  )

  // ─── Pan (single pointer) ───
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      pinchRef.current = pinchRef.current.filter((p) => p.id !== e.pointerId)
      pinchRef.current.push({ id: e.pointerId, x: e.clientX, y: e.clientY })
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)

      if (pinchRef.current.length === 1) {
        setDragging(true)
        dragRef.current = { startX: e.clientX, startY: e.clientY, vbX: vb.x, vbY: vb.y }
        lastPinchDist.current = null
      }
    },
    [vb.x, vb.y]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      // Update stored position for this pointer
      const idx = pinchRef.current.findIndex((p) => p.id === e.pointerId)
      if (idx !== -1) pinchRef.current[idx] = { id: e.pointerId, x: e.clientX, y: e.clientY }

      if (pinchRef.current.length === 2) {
        // Pinch zoom
        const [a, b] = pinchRef.current
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (lastPinchDist.current !== null && dist > 0) {
          const factor = lastPinchDist.current / dist
          const rect = containerRef.current?.getBoundingClientRect()
          if (rect) {
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            const cx = vb.x + ((mx - rect.left) / rect.width) * vb.w
            const cy = vb.y + ((my - rect.top) / rect.height) * vb.h
            zoomAround(cx, cy, factor)
          }
        }
        lastPinchDist.current = dist
      } else if (dragging && dragRef.current && containerRef.current) {
        // Pan
        const rect = containerRef.current.getBoundingClientRect()
        const drag = dragRef.current
        const dx = ((e.clientX - drag.startX) / rect.width) * vb.w
        const dy = ((e.clientY - drag.startY) / rect.height) * vb.h
        setVb((prev) => ({ ...prev, x: drag.vbX - dx, y: drag.vbY - dy }))
      }
    },
    [dragging, vb]
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pinchRef.current = pinchRef.current.filter((p) => p.id !== e.pointerId)
    if (pinchRef.current.length < 2) lastPinchDist.current = null
    if (pinchRef.current.length === 0) {
      setDragging(false)
      dragRef.current = null
    }
  }, [])

  // ─── Zoom buttons ───
  function zoomBy(factor: number) {
    setVb((prev) => clampVb(
      prev.x + (prev.w - prev.w * factor) / 2,
      prev.y + (prev.h - prev.h * factor) / 2,
      prev.w * factor,
      prev.h * factor,
    ))
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
      onWheel={onWheel}
    >
      {/* Title overlay */}
      <div className="absolute top-4 left-0 right-0 z-10 text-center pointer-events-none">
        <h1 className="text-3xl font-black text-[#4E342E] tracking-wide">
          {labels.title}
        </h1>
        <p className="text-sm text-[#6D4C41]/60 mt-1">
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
            <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
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
