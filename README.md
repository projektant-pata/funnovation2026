## Color schema
#FFF3E0 - background
#FEDC56 - main color
#E57373 - second color
#6D4C41 - text
#4E342E - headers
#4FC3F7 - links

## 1. Srdce Evropy 
- Česká republika, Slovensko, Polsko, Německo, Rakousko, Maďarsko
- Základní: #FFB74D
- Hover: #F57C00 

## 2. Italská vášeň
- Itálie
- Základní: #81C784
- Hover: #43A047 

## 3. Francouzská elegance
- Francie, Belgie
- Základní: #BA68C8
- Hover: #9C27B0 

## 4. Iberský temperament 
- Španělsko, Portugalsko, Mexico
- Základní: #FEDC56
- Hover: #FBC02D 

## 5. Exploze chutí (Jihovýchodní Asie)
- Thajsko, Vietnam, Indonésie, Malajsie
- Základní: #D4E157
- Hover: #C0CA33


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Pages

Všechny stránky jsou prefixované locale segmentem `[lang]` (`cs` nebo `en`).
Proxy (`proxy.ts`) přesměrovává `/` → `/cs` automaticky.

---

### Veřejné stránky (bez přihlášení)

| Route | Název | Stav |
|-------|-------|------|
| `/[lang]` | Landing page | ✅ Hotovo |
| `/[lang]/map` | Světová mapa | ✅ Hotovo |
| `/[lang]/sandbox` | Sandbox — přehled receptů | 🚧 Coming soon |
| `/[lang]/sandbox/[id]` | Detail receptu + cooking flow | 🔒 Plánováno |
| `/[lang]/campaign` | Kampaň — story strom | 🚧 Coming soon |
| `/[lang]/login` | Přihlášení / registrace | 🔒 Plánováno |
| `/[lang]/dictionary` | Slovník kuchařského slangu | 🔒 Plánováno |
| `/[lang]/about` | O projektu | 🔒 Plánováno |
| `/[lang]/contact` | Kontakt | 🔒 Plánováno |
| `/[lang]/gdpr` | GDPR & podmínky | 🔒 Plánováno |

---

### Onboarding (po registraci)

| Route | Název | Stav |
|-------|-------|------|
| `/[lang]/onboarding` | Úvodní dotazník | 🔒 Plánováno |

Krátký dotazník (5–7 otázek) — kuchařská zkušenost, alergie, dietní preference, časový disponibilní čas. AI vyhodnotí odpovědi a určí počáteční skill level (1–7) a personalizační profil. GDPR souhlas pro zdravotní data (alergie) formou samostatného checkboxu.

---

### Kampaňový flow (vyžaduje přihlášení)

| Route | Název | Stav |
|-------|-------|------|
| `/[lang]/campaign` | Story strom — přehled nodů, zamčené větve | 🚧 Coming soon |
| `/[lang]/campaign/[nodeId]` | Pre-level summary — co budeš vařit, XP, obtížnost | 🔒 Plánováno |
| `/[lang]/campaign/[nodeId]/cutscene` | Cutscéna — vizuální novela před levelem | 🔒 Plánováno |
| `/[lang]/campaign/[nodeId]/cook` | Cooking flow — ingredience, kroky, AI asistent, timer | 🔒 Plánováno |
| `/[lang]/campaign/[nodeId]/complete` | Dokončení — XP, fotka výsledku, AI reflexe, větvení | 🔒 Plánováno |

Celý strom je vždy viditelný (i zamčené nody). Větvení (butterfly effect) na vybraných nodech — hráč volí, kam se příběh posune. Adaptivní start: onboarding určí startovní pozici ve stromu.

---

### Sandbox (přehled a vaření)

| Route | Název | Stav |
|-------|-------|------|
| `/[lang]/sandbox` | Přehled receptů — filtr, search, řazení | 🚧 Coming soon |
| `/[lang]/sandbox/[id]` | Detail receptu | 🔒 Plánováno |
| `/[lang]/sandbox/[id]/cook` | Cooking flow — ingredience, kroky, AI asistent, timer | 🔒 Plánováno |

Dostupný bez přihlášení (progres se neukládá, XP se nepřidělují). Filtry: obtížnost, kuchyně/země, alergeny, čas, kategorie. Cooking mode: zjednodušené UI, velký text, timer vždy viditelný.

---

### Profil a účet (vyžaduje přihlášení)

| Route | Název | Stav |
|-------|-------|------|
| `/[lang]/account` | Nastavení účtu — email, heslo, jazyk, GDPR, smazání | 🔒 Plánováno |
| `/[lang]/profile` | Vlastní profil — XP, level, odznaky, statistiky, galerie | 🔒 Plánováno |
| `/[lang]/profile/[username]` | Veřejný profil jiného hráče | 🔒 Plánováno |

---

### Gamifikace (vyžaduje přihlášení)

| Route | Název | Stav |
|-------|-------|------|
| `/[lang]/challenges` | Přehled challenges — osobní + komunitní | 🔒 Plánováno |
| `/[lang]/challenges/[id]` | Detail challenge + submissions + hlasování | 🔒 Plánováno |

Osobní challenges: denní/týdenní AI-generované úkoly (3 úrovně obtížnosti). Komunitní challenges: tématické výzvy s pairwise hlasováním (tinder-style). XP za splnění, korunky na profilu.

---

### Sociální sekce (vyžaduje přihlášení)

| Route | Název | Stav |
|-------|-------|------|
| `/[lang]/social` | Social feed — vertikální video discovery (à la Reels) | 🔒 Plánováno |
| `/[lang]/groups` | Skupiny — přehled, vytvoření, pozvánka kódem | 🔒 Plánováno |
| `/[lang]/groups/[id]` | Detail skupiny — leaderboard, sdílené recepty, challenges | 🔒 Plánováno |

---

### Nástroje (vyžaduje přihlášení)

| Route | Název | Stav |
|-------|-------|------|
| `/[lang]/meal-plan` | Generátor jídelníčku — AI generuje plán na 1–14 dní | 🔒 Plánováno |
| `/[lang]/shopping-list` | Nákupní seznam — checklist, integrace s recepty a špajzí | 🔒 Plánováno |
| `/[lang]/pantry` | Špajz — evidence zásob, OCR skenování účtenek | 🔒 Plánováno |
| `/[lang]/kitchen-ai` | Recept z ledničky — AI navrhne recept z dostupných ingrediencí | 🔒 Plánováno |
| `/[lang]/recipes/new` | Tvorba vlastního receptu — formulář + AI asistent | 🔒 Plánováno |
| `/[lang]/recipes/[id]/edit` | Úprava vlastního receptu | 🔒 Plánováno |

---

### Legenda

| Symbol | Význam |
|--------|--------|
| ✅ Hotovo | Stránka je implementována a funkční |
| 🚧 Coming soon | Route existuje, stránka je placeholder |
| 🔒 Plánováno | Route zatím neexistuje, v plánu pro produkci |

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# funnovation2026
