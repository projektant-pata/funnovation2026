'use client'

import Link from 'next/link'
import { useState, useRef, useCallback, useEffect } from 'react'
import type { NodeTreeData, StoryNode, NodeStatus } from '@/app/lib/mockCampaign'

type Props = {
  lang: string
  playLevelLabel: string
  data: NodeTreeData
}

const NODE_R = 3
const BRANCH_R = 4.2
const BASE_VB_H = 100

type ViewBox = {
  x: number
  y: number
  w: number
  h: number
}

function edgeColor(fromStatus: NodeStatus, toStatus: NodeStatus): string {
  if (fromStatus === 'completed' && toStatus === 'completed') return '#FEDC56'
  if (toStatus === 'locked') return 'rgba(78,52,46,0.15)'
  return 'rgba(78,52,46,0.3)'
}

function edgeDash(toStatus: NodeStatus): string | undefined {
  return toStatus === 'locked' ? '1 0.8' : undefined
}

function LockIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 1}, ${y - 1.2}) scale(0.15)`}>
      <rect x="2" y="7" width="10" height="8" rx="1.5" fill="rgba(78,52,46,0.4)" />
      <path
        d="M4 7V5a3 3 0 016 0v2"
        fill="none"
        stroke="rgba(78,52,46,0.4)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  )
}

function CheckIcon({ x, y }: { x: number; y: number }) {
  return (
    <polyline
      points={`${x - 1.2},${y} ${x - 0.3},${y + 1} ${x + 1.5},${y - 1}`}
      fill="none"
      stroke="#3E2723"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}


function NodeCircle({
  node,
  onClick,
  shaking,
}: {
  node: StoryNode
  onClick: (n: StoryNode) => void
  shaking: boolean
}) {
  const r = node.isBranching ? BRANCH_R : NODE_R
  const cx = node.x
  const cy = node.y

  let fill = '#4E342E'
  let opacity = 1
  let strokeColor = 'transparent'
  let strokeW = 0
  let glowFilter = ''

  switch (node.status) {
    case 'locked':
      fill = 'rgba(78,52,46,0.25)'
      opacity = 0.5
      break
    case 'available':
      fill = '#4E342E'
      break
    case 'in_progress':
      fill = '#4E342E'
      strokeColor = '#FEDC56'
      strokeW = 0.5
      break
    case 'completed':
      fill = '#FEDC56'
      break
  }

  if (node.isBranching && node.status !== 'locked') {
    glowFilter = 'url(#glow)'
  }

  const ringR = r + 1.0
  const circumference = 2 * Math.PI * ringR
  const progressOffset = circumference - (circumference * node.completion) / 100
  const startOuterR = r + 1.7
  const startInnerR = r + 0.95
  const labelOffset = node.isStart ? 0.9 : 0

  const isAvailable = node.status === 'available'



  return (
    <g
      className={`cursor-pointer ${shaking ? 'animate-shake' : ''} ${isAvailable ? 'animate-scale-pulse' : ''}`}
      style={isAvailable ? { transformOrigin: `${cx}px ${cy}px` } as React.CSSProperties : undefined}
      onClick={(e) => {
        e.stopPropagation()
        onClick(node)
      }}
      role="button"
      tabIndex={0}
      aria-label={`${node.label} — ${node.status}`}
    >
      {glowFilter && (
        <circle cx={cx} cy={cy} r={r + 1} fill="none" stroke="#FEDC56" strokeWidth="0.3" opacity={0.4} filter={glowFilter} />
      )}

      {node.isStart && (
        <>
          <circle cx={cx} cy={cy} r={startOuterR} fill="none" stroke="#F5A623" strokeWidth="0.8" opacity={0.95} />
          <circle cx={cx} cy={cy} r={startInnerR} fill="none" stroke="#F5A623" strokeWidth="0.35" strokeDasharray="1.2 0.8" opacity={0.9} />
        </>
      )}

      {node.status === 'in_progress' && (
        <>
          <circle cx={cx} cy={cy} r={ringR} fill="none" stroke="rgba(78,52,46,0.1)" strokeWidth="0.5" />
          <circle
            cx={cx} cy={cy} r={ringR}
            fill="none" stroke="#FEDC56" strokeWidth="0.5"
            strokeDasharray={circumference} strokeDashoffset={progressOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </>
      )}

      <circle cx={cx} cy={cy} r={r} fill={fill} opacity={opacity} stroke={strokeColor} strokeWidth={strokeW} />

      {node.status === 'locked' && <LockIcon x={cx} y={cy} />}
      {node.status === 'completed' && <CheckIcon x={cx} y={cy} />}


      <text
        x={cx} y={cy + r + 2.8 + labelOffset}
        textAnchor="middle"
        fill={node.status === 'locked' ? 'rgba(78,52,46,0.3)' : '#3E2723'}
        fontSize="1.8" fontWeight="600"
        className="select-none pointer-events-none"
      >
        {node.label}
      </text>


      <text
        x={cx} y={cy + r + 4.6 + labelOffset}
        textAnchor="middle"
        fill={node.status === 'locked' ? 'rgba(78,52,46,0.2)' : 'rgba(78,52,46,0.55)'}
        fontSize="1.3"
        filter="url(#textShadow)"
        className="select-none pointer-events-none"
      >
        {node.description}
      </text>
    </g>
  )
}

/* ─── SVG → screen coordinate helper ─── */

function svgToScreen(
  nodeX: number,
  nodeY: number,
  viewBox: ViewBox,
  containerRect: { width: number; height: number }
) {
  return {
    x: ((nodeX - viewBox.x) / viewBox.w) * containerRect.width,
    y: ((nodeY - viewBox.y) / viewBox.h) * containerRect.height,
  }
}

/* ─── Compute centered viewBox for a node ─── */
/* xMidYMid meet handles aspect-ratio centering, so we just offset by half the viewBox */

function centeredVb(node: StoryNode, vbW: number, vbH: number): ViewBox {
  return {
    x: node.x - vbW / 2,
    y: node.y - vbH / 2,
    w: vbW,
    h: vbH,
  }
}

/* ─── Popover ─── */

function NodePopover({
  node,
  containerRect,
  viewBox,
  lang,
  playLevelLabel,
  onClose,
}: {
  node: StoryNode
  containerRect: { width: number; height: number }
  viewBox: ViewBox
  lang: string
  playLevelLabel: string
  onClose: () => void
}) {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleDown(e: MouseEvent | TouchEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleDown)
    document.addEventListener('touchstart', handleDown)
    return () => {
      document.removeEventListener('mousedown', handleDown)
      document.removeEventListener('touchstart', handleDown)
    }
  }, [onClose])

  if (containerRect.width <= 0 || containerRect.height <= 0) return null

  const screen = svgToScreen(node.x, node.y, viewBox, containerRect)

  const popoverW = 260
  const showAbove = screen.y > containerRect.height * 0.5

  const left = Math.max(8, Math.min(screen.x - popoverW / 2, containerRect.width - popoverW - 8))
  const topOrBottom = showAbove
    ? { bottom: containerRect.height - screen.y + 16 }
    : { top: screen.y + 16 }

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 bg-white border border-[#4E342E]/10 rounded-xl shadow-2xl p-4 w-[260px] animate-[fadeIn_150ms_ease-out]"
      style={{ left, ...topOrBottom }}
    >
      {/* Arrow */}
      <div
        className="absolute w-3 h-3 bg-white rotate-45"
        style={{
          left: Math.max(16, Math.min(screen.x - left - 6, popoverW - 24)),
          ...(showAbove
            ? { bottom: -6, borderBottom: '1px solid rgba(78,52,46,0.1)', borderRight: '1px solid rgba(78,52,46,0.1)' }
            : { top: -6, borderTop: '1px solid rgba(78,52,46,0.1)', borderLeft: '1px solid rgba(78,52,46,0.1)' }),
        }}
      />

      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-[#3E2723] font-bold text-sm">{node.label}</h3>
        <button
          onClick={onClose}
          className="text-[#4E342E]/40 hover:text-[#4E342E]/80 text-lg leading-none"
          aria-label="Zavřít"
        >
          &times;
        </button>
      </div>
      <p className="text-[#4E342E]/50 text-xs mb-2">{node.description}</p>
      <div className="text-[#3E2723] text-xs space-y-1">
        <div className="flex items-start gap-2">
          <span className="text-[#4E342E] font-semibold shrink-0">Hlavní úkol:</span>
          <span>{node.mainTask}</span>
        </div>
        {node.subtasks.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-[#4E342E]/40 shrink-0">Bonusy:</span>
            <span>{node.subtasks.join(', ')}</span>
          </div>
        )}
        {node.completion > 0 && (
          <div className="mt-2 h-1.5 bg-[#4E342E]/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FEDC56] rounded-full transition-all"
              style={{ width: `${node.completion}%` }}
            />
          </div>
        )}

        {node.status !== 'locked' && (
          <Link
            href={`/${lang}/game/campaign/${node.id}`}
            className="mt-3 inline-flex rounded-lg bg-[#4E342E] hover:bg-[#5D4037] text-[#FFF8E1] text-xs font-semibold px-3 py-1.5 transition-colors"
          >
            {playLevelLabel}
          </Link>
        )}
      </div>
    </div>
  )
}

/* ─── Main component ─── */

function findCurrentNode(nodes: StoryNode[]): StoryNode | undefined {
  return (
    nodes.find((n) => n.status === 'in_progress') ||
    nodes.find((n) => n.status === 'available')
  )
}

export default function NodeTree({ lang, playLevelLabel, data }: Props) {
  const [shakingId, setShakingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const currentNode = findCurrentNode(data.nodes)
  const [vb, setVb] = useState<ViewBox>({ x: 0, y: -5, w: 100, h: BASE_VB_H })
  const [containerRect, setContainerRect] = useState({ width: 0, height: 0 })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; vbX: number; vbY: number; vbW: number; vbH: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initialCenterDoneRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateCameraSize = () => {
      const rect = container.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      const nextW = (rect.width / rect.height) * BASE_VB_H
      const nextH = BASE_VB_H
      setContainerRect({ width: rect.width, height: rect.height })

      setVb((prev) => {
        if (!initialCenterDoneRef.current && currentNode) {
          initialCenterDoneRef.current = true
          return centeredVb(currentNode, nextW, nextH)
        }

        const centerX = prev.x + prev.w / 2
        const centerY = prev.y + prev.h / 2
        return {
          x: centerX - nextW / 2,
          y: centerY - nextH / 2,
          w: nextW,
          h: nextH,
        }
      })
    }

    updateCameraSize()
    const observer = new ResizeObserver(updateCameraSize)
    observer.observe(container)

    return () => observer.disconnect()
  }, [currentNode])

  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]))

  function handleNodeClick(node: StoryNode) {
    if (node.status === 'locked') {
      setShakingId(node.id)
      setTimeout(() => setShakingId(null), 500)
      return
    }
    setSelectedId(node.id === selectedId ? null : node.id)
  }

  function centerOnCurrent() {
    const target = findCurrentNode(data.nodes)
    if (!target) return
    setVb((prev) => centeredVb(target, prev.w, prev.h))
  }

  // ─── Pointer handlers for panning ───
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      setDragging(true)
        dragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          vbX: vb.x,
          vbY: vb.y,
          vbW: vb.w,
          vbH: vb.h,
        }
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    },
    [vb]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !dragRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const drag = dragRef.current
      if (!drag) return
      const dx = ((e.clientX - drag.startX) / rect.width) * drag.vbW
      const dy = ((e.clientY - drag.startY) / rect.height) * drag.vbH
      setVb((prev) => ({
        ...prev,
        x: drag.vbX - dx,
        y: drag.vbY - dy,
      }))
    },
    [dragging]
  )

  const onPointerUp = useCallback(() => {
    setDragging(false)
    dragRef.current = null
  }, [])

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
      <svg
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

        </defs>

        {/* Edges */}
        {data.edges.map((edge) => {
          const from = nodeMap.get(edge.from)
          const to = nodeMap.get(edge.to)
          if (!from || !to) return null
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={edgeColor(from.status, to.status)}
              strokeWidth="0.3"
              strokeDasharray={edgeDash(to.status)}
            />
          )
        })}

        {/* Nodes */}
        {data.nodes.map((node) => (
          <NodeCircle
            key={node.id}
            node={node}
            onClick={handleNodeClick}
            shaking={shakingId === node.id}
          />
        ))}
      </svg>

      {/* Center button — horizontally centered above ChefFab */}
      <button
        onClick={centerOnCurrent}
        className="fixed bottom-[6.5rem] right-[calc(1.5rem+(3.5rem-2.5rem)/2)] w-10 h-10 bg-[#FFF3E0] border border-[#4E342E]/10 rounded-full shadow-lg flex items-center justify-center hover:bg-[#FEDC56]/30 transition-colors z-50"
        aria-label="Vycentrovat na aktuální uzel"
      >
        <svg className="w-5 h-5 text-[#4E342E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>

      {/* Popover */}
      {selectedId && (() => {
        const node = nodeMap.get(selectedId)
        if (!node) return null
        return (
          <NodePopover
            node={node}
            containerRect={containerRect}
            viewBox={vb}
            lang={lang}
            playLevelLabel={playLevelLabel}
            onClose={() => setSelectedId(null)}
          />
        )
      })()}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        .animate-scale-pulse {
          animation: scale-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
