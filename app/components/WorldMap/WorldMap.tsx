'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './WorldMap.module.css';

const GEO_URL =
  'https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson';

// ─── Brand palette ────────────────────────────────────────────────────────────
const PALETTE = {
  ocean:  '#4FC3F7',
  border: '#4E342E',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
interface Recipe {
  name: string;
  emoji: string;
  description: string;
  ingredients: string[];
}

interface Group {
  id: string;
  name: string;
  emoji: string;
  color: string;
  hoverColor: string;
  countries: string[];
  geoNames: Set<string>;
  recipes: Recipe[];
}

const GROUPS: Group[] = [
  {
    id: 'srdce-evropy',
    name: 'Prdel Evropy',
    emoji: '🏰',
    color: '#FFB74D',
    hoverColor: '#F57C00',
    countries: ['Česká republika', 'Slovensko', 'Polsko', 'Německo', 'Rakousko', 'Maďarsko'],
    geoNames: new Set(['Czech Rep.', 'Czechia', 'Czech Republic', 'Slovakia', 'Poland', 'Germany', 'Austria', 'Hungary']),
    recipes: [
      {
        name: 'Svíčková na smetaně',
        emoji: '🥩',
        description: 'Tradiční české hovězí svíčkové na smetaně s knedlíky a brusinkami — nedělní klasika každé české rodiny.',
        ingredients: ['hovězí svíčková', 'smetana', 'mrkev', 'celer', 'cibule', 'máslo', 'knedlíky', 'brusinky'],
      },
      {
        name: 'Pierogi Ruskie',
        emoji: '🥟',
        description: 'Polské plněné těstové knedlíčky s bramborovým a tvarohovým plněním, smažené na másle s cibulkou.',
        ingredients: ['pšeničná mouka', 'brambory', 'tvaroh', 'cibule', 'máslo', 'sůl', 'zakysaná smetana'],
      },
      {
        name: 'Wiener Schnitzel',
        emoji: '🍖',
        description: 'Vídeňský řízeček z telecího masa, obalený ve strouhance a smažený do zlatova na přepuštěném másle.',
        ingredients: ['telecí plátky', 'vejce', 'mouka', 'strouhanka', 'přepuštěné máslo', 'citron', 'petržel'],
      },
    ],
  },
  {
    id: 'italska-vassen',
    name: 'Italská vášeň',
    emoji: '🍕',
    color: '#81C784',
    hoverColor: '#43A047',
    countries: ['Itálie'],
    geoNames: new Set(['Italy']),
    recipes: [
      {
        name: 'Pizza Margherita',
        emoji: '🍕',
        description: 'Klasická neapolská pizza s rajčatovou omáčkou, mozzarellou di bufala a čerstvou bazalkou. Certifikovaná STG.',
        ingredients: ['těsto na pizzu', 'rajčata San Marzano', 'mozzarella di bufala', 'čerstvá bazalka', 'extra panenský olivový olej'],
      },
      {
        name: 'Cacio e Pepe',
        emoji: '🍝',
        description: 'Zdánlivě jednoduchá římská pasta — jen tři suroviny, ale technika přípravy krémové emulze rozhoduje o vše.',
        ingredients: ['tonnarelli', 'Pecorino Romano DOP', 'Parmigiano-Reggiano', 'čerstvě mletý černý pepř'],
      },
      {
        name: 'Tiramisù',
        emoji: '🍮',
        description: 'Ikonický italský dezert ze savoiardi piškotů namočených v espressu a krému z mascarpone.',
        ingredients: ['mascarpone', 'vejce', 'espresso', 'piškoty savoiardi', 'kakao', 'cukr', 'marsala (volitelně)'],
      },
    ],
  },
  {
    id: 'francouzska-elegance',
    name: 'Francouzská elegance',
    emoji: '🥐',
    color: '#BA68C8',
    hoverColor: '#9C27B0',
    countries: ['Francie', 'Belgie'],
    geoNames: new Set(['France', 'Belgium']),
    recipes: [
      {
        name: 'Boeuf Bourguignon',
        emoji: '🥩',
        description: 'Pomalý hovězí guláš dušený v burgundském víně s houbami a perlovou cibulkou. Recept Julie Child.',
        ingredients: ['hovězí plec', 'burgundské červené víno', 'slanina lardon', 'žampiony', 'perlová cibulka', 'mrkev', 'tymián', 'bobkový list'],
      },
      {
        name: 'Moules-Frites',
        emoji: '🦪',
        description: 'Belgické slávky dušené v bílém víně s česnekovým máslem, podávané s dvojitě smaženými hranolkami.',
        ingredients: ['slávky', 'bílé víno', 'šalotka', 'máslo', 'petržel', 'česnek', 'smetana', 'hranolky'],
      },
      {
        name: 'Croissant au Beurre',
        emoji: '🥐',
        description: 'Máslový croissant s laminovaným těstem — 27 vrstev másla v každém soustu.',
        ingredients: ['pšeničná mouka T45', 'máslo tourage 84%', 'mléko', 'droždí', 'cukr', 'sůl'],
      },
    ],
  },
  {
    id: 'ibersky-temperament',
    name: 'Iberský temperament',
    emoji: '💃',
    color: '#FEDC56',
    hoverColor: '#FBC02D',
    countries: ['Španělsko', 'Portugalsko', 'México'],
    geoNames: new Set(['Spain', 'Portugal', 'Mexico']),
    recipes: [
      {
        name: 'Paella Valenciana',
        emoji: '🥘',
        description: 'Španělská rýžová paella se šafránem, kuřetem a králíkem — připravovaná na otevřeném ohni v tradiční pánvi.',
        ingredients: ['rýže Bomba', 'kuřecí stehna', 'králík', 'zelené fazolky', 'šafrán', 'paprika pimentón', 'olivový olej', 'vývar'],
      },
      {
        name: 'Tacos al Pastor',
        emoji: '🌮',
        description: 'Mexické tacos s marinovaným vepřovým masem na vertikálním rožni a karamelizovaným ananasem. Pouliční jídlo royalty.',
        ingredients: ['vepřová plec', 'chilli guajillo & ancho', 'achiote pasta', 'ananas', 'kukuřičné tortilly', 'koriandr', 'bílá cibule', 'limetka'],
      },
      {
        name: 'Pastéis de Nata',
        emoji: '🧁',
        description: 'Lisabonské listové košíčky s hedvábným krémem ze žloutků, skořicí a citronovou kůrou. Vynalezeny mnichy v Belém.',
        ingredients: ['listové těsto', 'žloutky', 'smetana', 'cukr', 'skořice', 'citronová kůra', 'vanilka'],
      },
    ],
  },
  {
    id: 'exploze-chuti',
    name: 'Exploze chutí',
    emoji: '🌶️',
    color: '#D4E157',
    hoverColor: '#C0CA33',
    countries: ['Thajsko', 'Vietnam', 'Indonésie', 'Malajsie'],
    geoNames: new Set(['Thailand', 'Vietnam', 'Indonesia', 'Malaysia']),
    recipes: [
      {
        name: 'Pad Thai',
        emoji: '🍜',
        description: 'Thajské smažené rýžové nudle s krevetami, tofu, tamarindovou omáčkou a drcenými arašídy.',
        ingredients: ['rýžové nudle', 'krevety', 'tofu', 'tamarindová pasta', 'rybí omáčka', 'arašídy', 'limetka', 'klíčky'],
      },
      {
        name: 'Phở Bò',
        emoji: '🍲',
        description: 'Vietnamská hovězí polévka s rýžovými nudlemi, hvězdičkovým anýzem a čerstvými bylinkami — duše ve šálku.',
        ingredients: ['hovězí kosti', 'rýžové nudle', 'hvězdičkový anýz', 'skořice', 'zázvor', 'cibule', 'thajská bazalka', 'klíčky mungo'],
      },
      {
        name: 'Nasi Goreng',
        emoji: '🍳',
        description: 'Indonéská smažená rýže s krevetami, vajíčkem, kecap manis omáčkou a sambalem — národní pokrm Indonésie.',
        ingredients: ['vařená rýže', 'krevety', 'vejce', 'kecap manis', 'sambal oelek', 'jarní cibulka', 'česnek', 'okurka'],
      },
    ],
  },
];

const getCountryGroup = (name: string): Group | null =>
  GROUPS.find((g) => g.geoNames.has(name)) ?? null;

// ─── Zoom controls ────────────────────────────────────────────────────────────
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

// ─── Side panel ───────────────────────────────────────────────────────────────
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
                <div key={r.name} className={styles.recipeCard}>
                  <div className={styles.recipeCardHeader}>
                    <span className={styles.recipeEmoji}>{r.emoji}</span>
                    <h4 className={styles.recipeName}>{r.name}</h4>
                  </div>
                  <p className={styles.recipeDesc}>{r.description}</p>
                  <div className={styles.ingredientsWrap}>
                    <span className={styles.ingredientsLabel}>Suroviny:</span>
                    <span className={styles.ingredientsList}>{r.ingredients.join(' · ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function WorldMap() {
  const [geoData, setGeoData]        = useState<GeoJSON.FeatureCollection | null>(null);
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

    // register layer so we can highlight the whole group on hover
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

  const handleReset = () => mapRef.current?.setView([20, 10], 2);

  return (
    <div className={styles.mapContainer}>
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
