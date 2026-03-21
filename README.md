# žemLOVEka

Gamifikovaná výuka vaření — Duolingo pro vaření.

## Dokumentace

Projektová dokumentace je konsolidovaná ve složce `docs/` (kromě tohoto `README.md`).

## Požadavky

- [Docker](https://docs.docker.com/get-docker/) a [Docker Compose](https://docs.docker.com/compose/install/) (Docker Desktop obsahuje obojí)
- Git

## Lokální nasazení

### 1. Klonování repozitáře

```bash
git clone <url-repozitáře>
cd funnovation2026
```

### 2. Nastavení `.env` a API klíče

Nejdřív si vytvoř lokální `.env` z šablony:

```bash
cp .env.example .env
```

Potom doplň vlastní hodnoty (hlavně `GEMINI_API_KEY`) do `.env`.

Poznámka: `.env` je gitignore a necommitujeme ho.

### 3. Dev režim (hot reload)

```bash
docker compose -f docker-compose.dev.yml up
```

Aplikace poběží na **http://localhost:3000**. Změny v kódu se projeví okamžitě bez restartu. PostgreSQL databáze se inicializuje automaticky ze `schema.sql` a `seed.sql`.

### 4. Produkční režim

```bash
docker compose up --build
```

Aplikace poběží na **http://localhost:4030**.

### Zastavení

```bash
# Ctrl+C v terminálu, nebo:
docker compose down                             # produkce
docker compose -f docker-compose.dev.yml down   # dev
```

### Reset databáze

Smazat data a začít od nuly:

```bash
docker compose down -v
docker compose up --build
```

## Bez Dockeru

```bash
npm install
npm run dev
```

Aplikace poběží na **http://localhost:4030**. PostgreSQL musí běžet zvlášť — můžeš nastavít `DATABASE_URL` v `.env`.

## SOPS decrypt (2 způsoby)

Šifrovaný secret soubor je `secrets/runtime.env.sops`.

### Způsob 1: default SSH klíč (lokální účet)

Pokud máš soukromý klíč v běžné SSH lokaci (`~/.ssh/...`) a odpovídá tvému GitHub public key:

```bash
sops -d --input-type dotenv --output-type dotenv secrets/runtime.env.sops
```

### Způsob 2: explicitní cesta ke klíči

Použij, když klíč není v default lokaci (typicky deploy klíč):

```bash
export SOPS_AGE_SSH_PRIVATE_KEY_FILE=/path/to/private_key
sops -d --input-type dotenv --output-type dotenv secrets/runtime.env.sops
```

Příklad deploy klíče v tomto projektu:

```bash
export SOPS_AGE_SSH_PRIVATE_KEY_FILE=~/.config/sops/deploy_team_sops_ed25519
sops -d --input-type dotenv --output-type dotenv secrets/runtime.env.sops
```

## Příkazy

| Příkaz | Popis |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Produkční build |
| `npm run start` | Produkční server |
| `npm run lint` | ESLint |

## Struktura aplikace

| Cesta | Popis |
|---|---|
| `/cs`, `/en` | Landing page |
| `/cs/game` | Herní prostředí — výběr herního módu |
| `/cs/game/campaign` | Kampaň — interaktivní příběh s větvením |
| `/cs/game/world` | Svět — kulinářské regiony |
| `/cs/game/freeplay` | Freeplay — volné vaření |
| `/cs/game/social` | Social — komunita |
| `/cs/game/profile` | Profil hráče |

## Barevná paleta

| Barva | Použití |
|---|---|
| `#FFF3E0` | Pozadí (landing page) |
| `#FEDC56` | Hlavní akcent (žlutá/zlatá) |
| `#E57373` | Sekundární (červená/korálová) |
| `#6D4C41` | Text (hnědá) |
| `#4E342E` | Nadpisy (tmavě hnědá) |
| `#4FC3F7` | Odkazy (světle modrá) |
| `#2C3E50` | Pozadí herního prostředí (tmavá) |

## Tech stack

- Next.js 16 (App Router, standalone output)
- React 19, TypeScript 5, Tailwind CSS v4
- PostgreSQL 16 (Docker)
- Leaflet + react-leaflet (mapa)
