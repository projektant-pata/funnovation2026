'use client'

import Link from 'next/link'
import { useState, useRef, useCallback, useEffect } from 'react'
import type { NodeTreeData, StoryNode, NodeStatus } from '@/app/lib/mockCampaign'

type PopoverLabels = {
  completed: string
  inProgress: string
  available: string
  locked: string
  mainTask: string
  bonusTasks: string
  close: string
}

type Props = {
  lang: string
  basePath: string
  playLevelLabel: string
  data: NodeTreeData
  popoverLabels: PopoverLabels
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
      stroke="#4E342E"
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
        fill={node.status === 'locked' ? 'rgba(78,52,46,0.3)' : '#4E342E'}
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

function statusBadge(status: NodeStatus, labels: PopoverLabels) {
  switch (status) {
    case 'completed':
      return { bg: 'bg-[#66BB6A]/15', text: 'text-[#2E7D32]', label: labels.completed }
    case 'in_progress':
      return { bg: 'bg-[#FEDC56]/20', text: 'text-[#E65100]', label: labels.inProgress }
    case 'available':
      return { bg: 'bg-[#4E342E]/8', text: 'text-[#4E342E]', label: labels.available }
    default:
      return { bg: 'bg-[#4E342E]/5', text: 'text-[#4E342E]/40', label: labels.locked }
  }
}

function NodePopover({
  node,
  containerRect,
  viewBox,
  lang,
  basePath,
  playLevelLabel,
  popoverLabels,
  onClose,
}: {
  node: StoryNode
  containerRect: { width: number; height: number }
  viewBox: ViewBox
  lang: string
  basePath: string
  playLevelLabel: string
  popoverLabels: PopoverLabels
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

  const popoverW = 300
  const showAbove = screen.y > containerRect.height * 0.5

  const left = Math.max(8, Math.min(screen.x - popoverW / 2, containerRect.width - popoverW - 8))
  const topOrBottom = showAbove
    ? { bottom: containerRect.height - screen.y + 20 }
    : { top: screen.y + 20 }

  const badge = statusBadge(node.status, popoverLabels)

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 w-[300px] animate-[popIn_200ms_cubic-bezier(0.34,1.56,0.64,1)]"
      style={{ left, ...topOrBottom }}
    >
      {/* Arrow */}
      <div
        className="absolute w-3.5 h-3.5 bg-white rotate-45 z-[-1]"
        style={{
          left: Math.max(20, Math.min(screen.x - left - 7, popoverW - 28)),
          ...(showAbove
            ? { bottom: -6, borderBottom: '1px solid rgba(78,52,46,0.1)', borderRight: '1px solid rgba(78,52,46,0.1)' }
            : { top: -6, borderTop: '1px solid rgba(78,52,46,0.1)', borderLeft: '1px solid rgba(78,52,46,0.1)' }),
        }}
      />

      <div className="bg-white rounded-2xl border border-[#4E342E]/10 shadow-[0_8px_32px_rgba(78,52,46,0.15)] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4E342E] to-[#5D4037] px-4 py-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[#FEDC56] font-bold text-sm leading-tight">{node.label}</h3>
            <p className="text-white/60 text-[11px] mt-0.5 leading-snug">{node.description}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label={popoverLabels.close}
          >
            <svg className="w-3 h-3 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-3">
          {/* Status badge + completion */}
          <div className="flex items-center gap-2">
            <span className={`${badge.bg} ${badge.text} text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full`}>
              {badge.label}
            </span>
            {node.completion > 0 && (
              <span className="text-[10px] font-semibold text-[#4E342E]/50">{node.completion}%</span>
            )}
          </div>

          {/* Progress bar */}
          {node.completion > 0 && (
            <div className="h-1.5 bg-[#4E342E]/8 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${node.completion}%`,
                  background: node.completion === 100
                    ? 'linear-gradient(90deg, #66BB6A, #43A047)'
                    : 'linear-gradient(90deg, #FEDC56, #F5A623)',
                }}
              />
            </div>
          )}

          {/* Main task */}
          <div className="rounded-xl bg-[#FFF8E1] border border-[#F5A623]/20 p-2.5">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-3.5 h-3.5 text-[#F5A623] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
              </svg>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#4E342E]/50">{popoverLabels.mainTask}</span>
            </div>
            <p className="text-sm font-semibold text-[#4E342E] pl-5.5">{node.mainTask}</p>
          </div>

          {/* Subtasks */}
          {node.subtasks.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#4E342E]/40">{popoverLabels.bonusTasks}</span>
              {node.subtasks.map((task) => (
                <div key={task} className="flex items-center gap-2 pl-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4E342E]/20 shrink-0" />
                  <span className="text-xs text-[#4E342E]/70">{task}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA button */}
          {node.status !== 'locked' && (
            <Link
              href={`${basePath}/${node.id}`}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#FEDC56] hover:bg-[#f5d430] text-[#4E342E] text-sm font-bold py-2.5 transition-all hover:shadow-md active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              {playLevelLabel}
            </Link>
          )}
        </div>
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

export default function NodeTree({ lang, basePath, playLevelLabel, data, popoverLabels }: Props) {
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
            basePath={basePath}
            playLevelLabel={playLevelLabel}
            popoverLabels={popoverLabels}
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
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.85) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
