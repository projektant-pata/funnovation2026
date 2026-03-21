'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import type { WorldRegion } from '@/app/lib/mockWorldRegions'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

export type MapViewBox = { x: number; y: number; w: number; h: number }

type Props = {
  regions: WorldRegion[]
  onRegionClick: (regionId: string) => void
  selectedRegionId: string | null
  lang: 'cs' | 'en'
  viewBox?: MapViewBox
}

/* ── Inline Mercator projection ── */
const WIDTH = 800
const HEIGHT = 500
const SCALE = 120
const CENTER_LON = 20
const CENTER_LAT = 30

function mercatorProject(lon: number, lat: number): [number, number] {
  const clampedLat = Math.max(-85, Math.min(85, lat))
  const x = (lon - CENTER_LON) * (Math.PI / 180) * SCALE + WIDTH / 2
  const y =
    -Math.log(Math.tan(Math.PI / 4 + (clampedLat * Math.PI) / 360)) * SCALE +
    Math.log(Math.tan(Math.PI / 4 + (CENTER_LAT * Math.PI) / 360)) * SCALE +
    HEIGHT / 2
  return [x, y]
}

/* ── Inline TopoJSON → GeoJSON (no external deps) ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TopoData = any

interface SimpleFeature {
  id: string
  rings: number[][][] // array of polygons, each polygon = array of rings, each ring = [lon, lat][]
}

function decodeArc(topology: TopoData, arcIdx: number): number[][] {
  const arc = topology.arcs[arcIdx < 0 ? ~arcIdx : arcIdx]
  const coords: number[][] = []
  let x = 0
  let y = 0
  for (const point of arc) {
    x += point[0]
    y += point[1]
    coords.push([x, y])
  }

  // Apply quantization transform
  const t = topology.transform
  const result = coords.map(([px, py]) => [
    px * t.scale[0] + t.translate[0],
    py * t.scale[1] + t.translate[1],
  ])

  return arcIdx < 0 ? result.reverse() : result
}

function decodeRing(topology: TopoData, arcIndices: number[]): number[][] {
  const points: number[][] = []
  for (const idx of arcIndices) {
    const decoded = decodeArc(topology, idx)
    // Skip first point of subsequent arcs (it duplicates the last of previous)
    const start = points.length > 0 ? 1 : 0
    for (let i = start; i < decoded.length; i++) {
      points.push(decoded[i])
    }
  }
  return points
}

function topoToFeatures(topology: TopoData): SimpleFeature[] {
  const obj = topology.objects.countries
  const features: SimpleFeature[] = []

  for (const geom of obj.geometries) {
    const id = String(geom.id ?? '')
    const rings: number[][][] = []

    if (geom.type === 'Polygon') {
      for (const arcRefs of geom.arcs) {
        rings.push(decodeRing(topology, arcRefs))
      }
    } else if (geom.type === 'MultiPolygon') {
      for (const polygon of geom.arcs) {
        for (const arcRefs of polygon) {
          rings.push(decodeRing(topology, arcRefs))
        }
      }
    }

    features.push({ id, rings })
  }

  return features
}

/**
 * Normalize a ring so that all longitudes are continuous (no antimeridian jumps).
 * If a point jumps by more than 180° from the previous, shift it by ±360°.
 * This makes Russia's Kamchatka (~-170°) become ~+190° so it renders on the right.
 */
function normalizeRing(ring: number[][]): number[][] {
  if (ring.length === 0) return ring
  const result: number[][] = [[ring[0][0], ring[0][1]]]
  for (let i = 1; i < ring.length; i++) {
    let lon = ring[i][0]
    const prevLon = result[i - 1][0]
    while (lon - prevLon > 180) lon -= 360
    while (prevLon - lon > 180) lon += 360
    result.push([lon, ring[i][1]])
  }
  return result
}

function ringToSvgPath(ring: number[][]): string {
  const normalized = normalizeRing(ring)
  return normalized
    .map((coord, i) => {
      const [x, y] = mercatorProject(coord[0], coord[1])
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join('') + 'Z'
}

function featureToPath(feat: SimpleFeature): string {
  return feat.rings.map(ringToSvgPath).join(' ')
}

/* ── Country → Region mapping (ISO 3166-1 numeric) ── */
const countryToRegion: Record<string, string> = {}

;[
  '040','056','100','191','203','208','233','246','250','276',
  '300','348','352','372','380','428','440','442','470','528',
  '578','616','620','642','703','705','724','752','756','826',
  '008','070','499','688','804','112','498','807',
].forEach((c) => { countryToRegion[c] = 'europe' })

;[
  '004','031','048','050','064','096','104','116','156',
  '356','360','364','368','376','392','398','400','410','414',
  '417','418','422','458','462','496','512','524','586','608',
  '634','643','682','702','760','762','764','792','795','860',
  '704','887','784','275',
].forEach((c) => { countryToRegion[c] = 'asia' })

;[
  '032','044','076','084','124','152','170','188','192','214',
  '218','222','320','328','332','340','388','484','558','591',
  '600','604','630','740','780','840','858','862',
].forEach((c) => { countryToRegion[c] = 'americas' })

;[
  '012','024','072','108','120','132','140','148','174','178',
  '180','204','226','231','232','262','266','270','288','324',
  '384','404','426','430','434','450','454','466','478','480',
  '504','508','516','562','566','646','678','686','694','706',
  '710','716','728','729','748','768','788','800','834','854',
  '894',
].forEach((c) => { countryToRegion[c] = 'africa' })

;[
  '036','554','598','090','242','548','776','882','584','583',
  '520','296','570','585',
].forEach((c) => { countryToRegion[c] = 'oceania' })

const regionColors: Record<string, string> = {
  europe: '#E8A838',
  asia: '#E85D4A',
  americas: '#4CAF50',
  africa: '#9E9E9E',
  oceania: '#9E9E9E',
}

const regionLabelCoords: Record<string, [number, number]> = {
  europe: [15, 50],
  asia: [80, 35],
  americas: [-80, 5],
  africa: [20, 5],
  oceania: [140, -25],
}

export { WIDTH as MAP_WIDTH, HEIGHT as MAP_HEIGHT }

export default function WorldMapSvg({ regions, onRegionClick, selectedRegionId, lang, viewBox: vb }: Props) {
  const [pathData, setPathData] = useState<{ id: string; d: string; regionId?: string }[] | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((topo) => {
        const features = topoToFeatures(topo)
        setPathData(
          features.map((f) => ({
            id: f.id,
            d: featureToPath(f),
            regionId: countryToRegion[f.id],
          }))
        )
      })
  }, [])

  const regionMap = useMemo(() => new Map(regions.map((r) => [r.id, r])), [regions])

  const handleMouseEnter = useCallback((rid: string) => setHoveredRegion(rid), [])
  const handleMouseLeave = useCallback(() => setHoveredRegion(null), [])

  if (!pathData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#FFF8E1]/30 border-t-[#FEDC56] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <svg
      viewBox={vb ? `${vb.x} ${vb.y} ${vb.w} ${vb.h}` : `0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    >
      <defs>
        <clipPath id="mapClip">
          <rect width={WIDTH} height={HEIGHT} />
        </clipPath>
      </defs>
      <g clipPath="url(#mapClip)">
      {/* Country shapes */}
      {pathData.map((p, i) => {
        if (!p.d) return null
        if (!p.regionId) {
          return (
            <path
              key={i}
              d={p.d}
              fill="rgba(78,52,46,0.08)"
              stroke="rgba(78,52,46,0.12)"
              strokeWidth={0.3}
            />
          )
        }

        const region = regionMap.get(p.regionId)
        if (!region) return null

        const isLocked = region.status === 'locked'
        const isSelected = selectedRegionId === p.regionId
        const isHovered = hoveredRegion === p.regionId
        const baseColor = regionColors[p.regionId]

        return (
          <path
            key={i}
            d={p.d}
            fill={isLocked ? 'rgba(78,52,46,0.1)' : baseColor}
            fillOpacity={isLocked ? 0.5 : isSelected || isHovered ? 1 : 0.75}
            stroke={isSelected && !isLocked ? '#FEDC56' : 'rgba(78,52,46,0.15)'}
            strokeWidth={isSelected && !isLocked ? 1.5 : 0.4}
            onClick={() => onRegionClick(p.regionId!)}
            onMouseEnter={() => !isLocked && handleMouseEnter(p.regionId!)}
            onMouseLeave={handleMouseLeave}
            className={isLocked ? '' : 'cursor-pointer transition-[fill-opacity] duration-200'}
          />
        )
      })}

      {/* Region labels */}
      {regions.map((region) => {
        const coords = regionLabelCoords[region.id]
        if (!coords) return null
        const [px, py] = mercatorProject(coords[0], coords[1])

        const isLocked = region.status === 'locked'
        const isSelected = selectedRegionId === region.id

        return (
          <g key={region.id} className="pointer-events-none">
            <rect
              x={px - 38}
              y={py - 15}
              width={76}
              height={38}
              rx={13}
              fill={isSelected && !isLocked ? 'rgba(254,220,86,0.92)' : 'rgba(62,39,35,0.8)'}
            />
            <text
              x={px}
              y={py + 2}
              textAnchor="middle"
              fill={isSelected && !isLocked ? '#4E342E' : isLocked ? 'rgba(255,248,225,0.4)' : '#FFF8E1'}
              fontSize={11}
              fontWeight={700}
              className="select-none"
            >
              {region.name[lang]}
            </text>

            {isLocked && (
              <g transform={`translate(${px - 3.5}, ${py + 6})`}>
                <rect x="0.5" y="3.5" width="7" height="5.5" rx="0.8" fill="rgba(255,248,225,0.35)" />
                <path d="M1.5 3.5V2a2.25 2.25 0 014.5 0v1.5" fill="none" stroke="rgba(255,248,225,0.35)" strokeWidth="0.9" />
              </g>
            )}

            {!isLocked && (
              <text
                x={px}
                y={py + 14}
                textAnchor="middle"
                fill={isSelected ? 'rgba(62,39,35,0.5)' : 'rgba(255,248,225,0.55)'}
                fontSize={8}
                fontWeight={600}
                className="select-none"
              >
                {region.completedRecipes}/{region.totalRecipes}
              </text>
            )}
          </g>
        )
      })}
      </g>
    </svg>
  )
}
