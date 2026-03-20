'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './WorldMap.module.css';

const GEO_URL =
  'https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson';

// ─── Brand palette ─────────────────────────────────────────────────────────
const PALETTE = {
  ocean:  '#4FC3F7',
  border: '#4E342E',
};

// ─── GeoJSON name aliases per ISO-2 code ───────────────────────────────────
// The GeoJSON file uses non-standard country name strings.
const ISO2_GEO_NAMES: Record<string, string[]> = {
  CZ: ['Czech Rep.', 'Czechia', 'Czech Republic'],
  SK: ['Slovakia'],
  PL: ['Poland'],
  DE: ['Germany'],
  AT: ['Austria'],
  HU: ['Hungary'],
  IT: ['Italy'],
  FR: ['France'],
  BE: ['Belgium'],
  ES: ['Spain'],
  PT: ['Portugal'],
  MX: ['Mexico'],
  GR: ['Greece'],
  TH: ['Thailand'],
  VN: ['Vietnam', 'Viet Nam'],
  ID: ['Indonesia'],
  MY: ['Malaysia'],
  JP: ['Japan'],
  IN: ['India'],
  KR: ['South Korea', 'S. Korea', 'Korea'],
};

// ─── Types ─────────────────────────────────────────────────────────────────
interface Recipe {
  title: string;
  description: string;
  ingredients: string[] | null;
}

interface ApiGroup {
  code:        string;
  name_cs:     string;
  name_en:     string;
  emoji:       string;
  color:       string;
  hover_color: string;
  countries:   { iso2: string; name_cs: string; name_en: string }[];
  recipes:     Recipe[] | null;
}

interface Group {
  id:         string;
  name:       string;
  emoji:      string;
  color:      string;
  hoverColor: string;
  countries:  string[];
  geoNames:   Set<string>;
  recipes:    Recipe[];
}

function apiGroupToGroup(ag: ApiGroup): Group {
  const geoNames = new Set(
    (ag.countries ?? []).flatMap((c) => ISO2_GEO_NAMES[c.iso2] ?? [c.name_en])
  );
  return {
    id:         ag.code,
    name:       ag.name_cs,
    emoji:      ag.emoji,
    color:      ag.color,
    hoverColor: ag.hover_color,
    countries:  (ag.countries ?? []).map((c) => c.name_cs),
    geoNames,
    recipes:    ag.recipes ?? [],
  };
}

// ─── Zoom controls ─────────────────────────────────────────────────────────
function ZoomControls({ onReset }: { onReset: () => void }) {
  const map = useMap();
  return (
    <div className={styles.controls}>
      <button className={styles.controlBtn} onClick={() => map.zoomIn()}  aria-label="Zoom in">+</button>
      <button className={styles.controlBtn} onClick={() => map.zoomOut()} aria-label="Zoom out">−</button>
      <button className={styles.controlBtn} onClick={onReset}             aria-label="Reset view" title="Reset view">⌂</button>
    </div>
  );
}

// ─── Left sidebar ──────────────────────────────────────────────────────────
function LeftSidebar({
  lang,
  groups,
  onSelectGroup,
}: {
  lang: string;
  groups: Group[];
  onSelectGroup: (g: Group) => void;
}) {
  return (
    <div className={styles.sidebar}>
      <a href={`/${lang}`} className={styles.sidebarLogo}>
        žem<span style={{ color: '#E57373' }}>LOVE</span>ka
      </a>

      <nav className={styles.sidebarNav}>
        <a href={`/${lang}`}          className={styles.sidebarNavLink}>🏠 Domů</a>
        <a href={`/${lang}/sandbox`}  className={styles.sidebarNavLink}>📦 Sandbox</a>
        <a href={`/${lang}/campaign`} className={styles.sidebarNavLink}>🎭 Kampaň</a>
      </nav>

      <hr className={styles.sidebarDivider} />

      <p className={styles.sidebarSectionTitle}>Kulinářské regiony</p>
      <div className={styles.sidebarLegend}>
        {groups.map((group) => (
          <button
            key={group.id}
            className={styles.sidebarLegendItem}
            onClick={() => onSelectGroup(group)}
          >
            <span className={styles.sidebarLegendDot} style={{ background: group.color }} />
            <span>{group.emoji} {group.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Right side panel ──────────────────────────────────────────────────────
function SidePanel({ group, onClose }: { group: Group | null; onClose: () => void }) {
  return (
    <div
      className={`${styles.panel} ${group ? styles.panelOpen : ''}`}
      aria-hidden={!group}
    >
      {group && (
        <>
          <button className={styles.panelClose} onClick={onClose} aria-label="Close panel">✕</button>

          <div className={styles.panelHeader}>
            <span className={styles.panelEmoji}>{group.emoji}</span>
            <h2 className={styles.panelTitle}>{group.name}</h2>
          </div>

          <div className={styles.panelSection}>
            <h3 className={styles.panelSectionTitle}>🌍 Země</h3>
            <div className={styles.countriesList}>
              {group.countries.map((c) => (
                <span key={c} className={styles.countryTag}>{c}</span>
              ))}
            </div>
          </div>

          <div className={styles.panelSection}>
            <h3 className={styles.panelSectionTitle}>🍽️ Recepty</h3>
            <div className={styles.recipesList}>
              {group.recipes.map((r) => (
                <div key={r.title} className={styles.recipeCard}>
                  <div className={styles.recipeCardHeader}>
                    <span className={styles.recipeEmoji}>🍽️</span>
                    <h4 className={styles.recipeName}>{r.title}</h4>
                  </div>
                  <p className={styles.recipeDesc}>{r.description}</p>
                  {r.ingredients && r.ingredients.length > 0 && (
                    <div className={styles.ingredientsWrap}>
                      <span className={styles.ingredientsLabel}>Suroviny:</span>
                      <span className={styles.ingredientsList}>{r.ingredients.join(' · ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function WorldMap({ lang }: { lang: string }) {
  const [geoData, setGeoData]        = useState<GeoJSON.FeatureCollection | null>(null);
  const [groups, setGroups]          = useState<Group[]>([]);
  const [selectedGroup, setSelected] = useState<Group | null>(null);
  const mapRef                       = useRef<L.Map | null>(null);
  const layersByGroup                = useRef<Map<string, L.Path[]>>(new Map());
  const tooltipRef                   = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then(setGeoData)
      .catch((err) => console.error('Failed to load world GeoJSON:', err));
  }, []);

  useEffect(() => {
    fetch('/api/map-groups')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setGroups((json.data as ApiGroup[]).map(apiGroupToGroup));
      })
      .catch((err) => console.error('Failed to load map groups:', err));
  }, []);

  const getCountryGroup = (name: string): Group | null =>
    groups.find((g) => g.geoNames.has(name)) ?? null;

  const styleFeature = (feature: GeoJSON.Feature | undefined) => {
    const group = feature ? getCountryGroup(feature.properties?.name) : null;
    return {
      fillColor:   group ? group.color : '#FFF3E0',
      fillOpacity: 1,
      color:       PALETTE.border,
      weight:      0.5,
      className:   group ? '' : 'inert-country',
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
    const name  = feature.properties?.name ?? 'Unknown';
    const group = getCountryGroup(name);
    const path  = layer as L.Path;

    if (!group) return;

    if (!layersByGroup.current.has(group.id)) {
      layersByGroup.current.set(group.id, []);
    }
    layersByGroup.current.get(group.id)!.push(path);

    path.on({
      mouseover() {
        layersByGroup.current.get(group.id)?.forEach((l) =>
          l.setStyle({ fillColor: group.hoverColor })
        );
        if (tooltipRef.current) {
          tooltipRef.current.textContent = `${group.emoji} ${group.name}`;
          tooltipRef.current.style.opacity = '1';
        }
      },
      mouseout() {
        layersByGroup.current.get(group.id)?.forEach((l) =>
          l.setStyle({ fillColor: group.color })
        );
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = '0';
        }
      },
      click() {
        setSelected(group);
      },
    });
  };

  // Re-render GeoJSON when groups load so colors apply correctly
  const geoKey = groups.map((g) => g.id).join(',');

  const handleReset = () => mapRef.current?.setView([20, 10], 2);

  return (
    <div className={styles.mapContainer}>
      <LeftSidebar lang={lang} groups={groups} onSelectGroup={setSelected} />

      <div ref={tooltipRef} className={styles.tooltip} style={{ opacity: 0 }} aria-live="polite" />

      <MapContainer
        ref={mapRef}
        center={[20, 10]}
        zoom={3}
        minZoom={2.5}
        maxZoom={8}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
        worldCopyJump={false}
      >
        {geoData && (
          <GeoJSON
            key={geoKey}
            data={geoData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
        <ZoomControls onReset={handleReset} />
      </MapContainer>

      {!geoData && (
        <div className={styles.loading}>Loading map…</div>
      )}

      <SidePanel group={selectedGroup} onClose={() => setSelected(null)} />
    </div>
  );
}
