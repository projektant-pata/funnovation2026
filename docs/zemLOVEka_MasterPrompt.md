# žemLOVEka — Master Project Specification

> **Účel dokumentu:** Kompletní popis projektu žemLOVEka — single source of truth. Definuje CO se staví, PROČ, a jak jednotlivé části do sebe zapadají. Slouží jako kontext pro AI modely při generování kódu i jako interní dokumentace.

> **Kontext:** Hackathon Funnovation Hack 2026 (24 hodin). Aplikace musí demonstrovat funkční AI integraci, gamifikační mechaniky, kvalitní UX a soulad s GDPR / EU AI Act. Podporuje češtinu (výchozí) a angličtinu, s i18n architekturou umožňující snadné přidání dalších jazyků.

> **Důležité:** Aplikace je demo — ukazuje celou vizi produktu, ale obsah je omezený (viz sekce 14). Veškerý UI existuje a je funkční, některé sekce mají omezený obsah nebo jsou zamčené s "Coming soon".

---

## 1. Elevator pitch

**žemLOVEka** je gamifikovaná webová aplikace, která učí uživatele vařit prostřednictvím interaktivní kampaňové storyline (vizuální novela s butterfly-effect větvením), sandbox režimu, světové mapy, sociální sekce a AI asistenta, který funguje jako osobní šéfkuchař.

AI není dekorativní chatbot přilepený k jinak statické aplikaci — je to **jádro produktu**: vyhodnocuje úroveň uživatele, adaptuje recepty na alergie a preference v reálném čase, generuje personalizované recepty a jídelníčky, a provází uživatele každým krokem vaření.

**Základní teze:** Duolingo dokázalo, že gamifikace funguje pro výuku jazyků. žemLOVEka aplikuje stejný princip na vaření — strukturovaná progrese, XP, odznaky, denní challenges, příběhový rámec a sociální prvky, které uživatele motivují se vracet.

---

## 2. Problém a cílová skupina

### 2.1 Problém

Většina mladých lidí (18–35) neumí efektivně vařit. Existující řešení (Cookpad, Tasty, Yummly) nabízejí databáze receptů, ale žádné z nich neposkytuje **strukturovanou cestu od začátečníka k pokročilému kuchaři** s motivací, příběhem a adaptivní AI.

### 2.2 Cílová skupina

- **Primární:** mladí dospělí (18–35), kteří se stěhují od rodičů, začínají žít s partnerem/partnerkou, nebo chtějí přestat jíst fast food každý den.
- **Sekundární:** kdokoliv, kdo chce systematicky zlepšit své kuchařské schopnosti a mít u toho zábavu.

### 2.3 Odlišení od alternativ

| | Cookpad / Tasty | Duolingo | žemLOVEka |
|---|---|---|---|
| Strukturovaná výuka | ✘ | ✔ | ✔ |
| Skutečné vaření | ✔ | ✘ | ✔ |
| Příběhový rámec s větvením | ✘ | ✘ | ✔ |
| AI adaptace na uživatele | ✘ | Omezeně | ✔ |
| Gamifikace | Minimální | ✔ | ✔ |
| Sociální prvky | Omezeně | ✘ | ✔ |

---

## 3. Tech stack

| Vrstva | Technologie |
|--------|-------------|
| Frontend | Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend / DB | PostgreSQL 16 (self-hosted), vlastní Auth vrstva (JWT), media storage, RLS |
| AI | Google Gemini API — Gemini 3 Flash (hlavní funkce), Gemini 3.1 Flash-Lite (lehké úlohy), Gemini 2.5 Flash Native Audio (live voice/image) |
| i18n | next-intl, JSON klíče per locale (`/messages/cs.json`, `/messages/en.json`) |
| State management | Zustand |
| Hosting | VPS (Docker) |

**Klíčová pravidla:**
- Všechna AI volání jdou přes Next.js API routes — nikdy nevystavovat Gemini API klíče klientovi.
- PostgreSQL Row Level Security (RLS) na každé tabulce.
- Každý user-facing string jde přes i18n — žádný hardcoded text v komponentách.
- Taby pro odsazení ve všech souborech.

---

## 4. Účty a přístupnost

### 4.1 Bez účtu (anonymní přístup)

- Prohlížení a filtrování všech **public** receptů v sandboxu a na mapě.
- Spuštění a provaření libovolného public receptu (včetně AI asistenta během vaření).
- **Neuloží se:** progres, XP, fotky, poznámky. Při odchodu ze stránky je vše pryč.

### 4.2 S účtem (registrace)

- Povinné pro: kampaň, challenges, tvorba receptů, nákupní seznam, jídelníček, sociální sekce, skupiny, špajz.
- Registrace: email + heslo. Minimum tření.
- Po registraci: povinný onboarding dotazník (viz 4.3).

### 4.3 Onboarding dotazník

Krátký dotazník (5–7 otázek) ihned po první registraci:

1. **Kuchařská zkušenost** — "Jak často vaříš?" (nikdy / párkrát do měsíce / několikrát týdně / denně)
2. **Dovednosti** — "Které z těchto technik zvládáš?" (vařit těstoviny / osmažit maso / uvařit omáčku od nuly / péct / pracovat s těstem / pokročilé techniky jako sous-vide, fermentace)
3. **Alergie a intolerance** — multiselect z běžných (lepek, laktóza, ořechy, vejce, sója, mořské plody...) + custom input
4. **Dietní preference** — vegan, vegetarián, pescatarián, bezlepková dieta, low-carb, žádná
5. **Co tě motivuje?** — naučit se základy / vařit zdravěji / objevovat světové kuchyně / vařit pro ostatní / ušetřit za jídlo venku
6. **Kolik času typicky máš na přípravu jídla?** — do 30 minut / 30–60 minut / 1–2 hodiny / čas neřeším

AI vyhodnotí odpovědi a určí:
- **Počáteční skill level** (1–7) — určuje startovní pozici v kampani.
- **Personalizační profil** — ovlivňuje doporučení receptů, filtry a AI chování napříč celou aplikací.

**GDPR moment:** Alergie/intolerance jsou zdravotní data (GDPR čl. 9). Před jejich uložením musí uživatel explicitně souhlasit se zpracováním (samostatný checkbox, ne součást obecných podmínek). Bez souhlasu se tyto údaje neukládají a AI je nepoužívá.

---

## 5. Systém receptů

Recept je **nezávislá entita** — může být použit v kampani, sandboxu, na mapě i v challenges. Tyto režimy jsou v podstatě jen kurátorský filtr/pohled nad stejnou databází receptů.

### 5.1 Atributy receptu

Název, popis, ingredience (s množstvím a jednotkami), kroky (s volitelným časem a tipem), obtížnost (1–5), čas přípravy, čas vaření, porce, alergeny, země původu (nullable), kontinent (nullable), kategorie (snídaně / oběd / večeře / svačina / dezert / nápoj), typ, viditelnost, tagy, obrázek.

### 5.2 Typy receptů

- **Kurátorské (curated):** vytvořené týmem, kvalitně ověřené, značka "oficiální". Používají se v kampani.
- **Ověřené (verified):** uživatelské recepty schválené týmem, značka "ověřeno".
- **Uživatelské (community):** vytvořené uživateli, bez ověření.

Typ se u každého receptu vizuálně zobrazuje (badge/štítek).

### 5.3 Viditelnost receptů

- **Public:** vidí všichni (sandbox, mapa, sdílení). Výchozí pro kurátorské a ověřené.
- **Group:** vidí členové společné skupiny a autor.
- **Private:** vidí pouze autor.

Hierarchie je inkluzivní: autor vidí vždy vše své, člen skupiny vidí group + public, nepřihlášený vidí pouze public.

### 5.4 Lokalizace receptů

Každý recept má název, popis, ingredience a kroky v češtině i angličtině. Kurátorské recepty mají obě verze od začátku. Uživatelské recepty mohou mít jen jeden jazyk — AI může pomoci s překladem.

---

## 6. AI kuchařský asistent ("Šéf") — jádro produktu

Centrální AI asistent dostupný v celé aplikaci jako floating ikona. Textový chat + voice input/output. Běží na Gemini 3 Flash přes backend API routes.

### 6.1 Role asistenta

- **Průvodce vařením:** provází každým krokem receptu, odpovídá na otázky, navrhuje kompromisy (substituce ingrediencí, úpravy postupu).
- **Adaptace receptů:** v reálném čase upravuje recepty dle alergií, intolerancí a diet uživatele. Pokud recept obsahuje alergen, Šéf automaticky navrhne alternativu.
- **Onboarding evaluace:** vyhodnocuje vstupní dotazník a určuje počáteční úroveň.
- **Hodnocení po vaření:** po dokončení levelu diskutuje s uživatelem o výsledku, navrhuje zlepšení.
- **Generování obsahu:** vytváří personalizované recepty, jídelníčky, challenge zadání.
- **Ovládání timeru:** timer ovladatelný přes asistenta textově nebo hlasově.
- **Přizpůsobení receptu:** uživatel může požádat asistenta o úpravu libovolného receptu (veřejného nebo svého) dle osobních připomínek — např. "chci to ostřejší", "nemám máslo, čím nahradit?".
- **Slovníková funkce:** uživatel se může zeptat na jakýkoliv kuchařský termín nebo slang, asistent vysvětlí v kontextu.

### 6.2 Kontextové chování

Systémový prompt asistenta vždy obsahuje kontext uživatele: alergie, skill level, aktuální recept a krok, jazyk. Asistent ví, kde v aplikaci se uživatel nachází a přizpůsobuje odpovědi.

### 6.3 Dostupnost

- **Během vaření (level):** sidebar chat, plný kontext receptu a kroku.
- **Mimo vaření:** floating action button na každé obrazovce. Obecné kuchařské otázky, pomoc s tvorbou receptu, slovníkové dotazy.
- **Voice:** vstup i výstup hlasem (STT/TTS integrace). Klíčové pro použití v kuchyni s mokrýma rukama.

### 6.4 Proč to není AIwashing

- Bez AI by každý uživatel dostal stejné recepty — s AI dostává recepty adaptované na jeho profil.
- Statický recept neodpoví na otázky — AI ano, včetně substitucí a troubleshootingu.
- Jídelníčky, recepty z ledničky a challenge zadání jsou generovány dynamicky.
- AI vyhodnocuje onboarding a určuje personalizovanou cestu kampaní.

Všechny AI interakce se logují (systémový prompt, user message, response, model, tokeny) pro účely hackathonové dokumentace a auditu. Všechny prompty budou zdokumentovány v technické dokumentaci.

---

## 7. Kampaňový režim (hlavní storyline)

Interaktivní vizuální novela o mladém kuchaři/kuchařce, který/á se učí vařit v různých životních situacích. Kampaň je hlavní motivační motor aplikace.

### 7.1 Struktura — strom s butterfly-effect větvením

Kampaňová mapa je **směrovaný strom** (vizuálně podobný stylu Duolingo / Fireboy and Watergirl). Hráč začíná v jednom centrálním bodě a postupně se větví do různých storylines na základě svých rozhodnutí.

**Větvení (butterfly effect):** Na konci některých nodů hráč činí rozhodnutí, které ovlivní, kam se příběh posune. Např. po "Odstěhování od rodiny" si hráč může vybrat cestu "Zdravé vaření" nebo "Rychlé vaření pro zaneprázdněné" — každá vede k jiným receptům a jiným příběhovým situacím.

**Celý strom je vždy viditelný** na mapě — i zamčené nody a větve. Hráč vidí, kam se může dostat, ale nemá přístup dál, než má odemčeno. To vytváří motivaci k postupu a replayability (projít jinou větev).

### 7.2 Kapitoly a nody

Každý **node** představuje kapitolu se specifickým životním tématem. Příklady:

1. **"První večeře"** — základní techniky (vaření vody, krájení, ohřev)
2. **"Odstěhování od rodiny"** — jednoduchá jídla na každý den
3. **"Začátky s přítelkyní/přítelem"** — vaření pro dva, romantická večeře
4. **"První večírek"** — vaření pro více lidí, předkrmy a hlavní chody
5. **"Sváteční hostina"** — pokročilé techniky, pečení, grilování
6. **"Světová kuchyně"** — italská, asijská, mexická kuchyně
7. **"Mistr kuchyně"** — pokročilé gastronomické koncepty

(Toto je ilustrativní — skutečný strom bude mít více nodů a větvení.)

### 7.3 Hlavní tasky a podtasky

Každý node má:
- **Hlavní task** (povinný recept) — splnění odemkne další node(y) ve stromu.
- **Podtasky** (volitelné recepty na stejné téma) — zvyšují procentuální completion node a přinášejí XP.

Node má procentuální completion (0–100%). 100% = hlavní task + všechny podtasky splněny ("vymasterováno").

### 7.4 Průběh jednoho levelu

**Fáze 1 — Cutscéna (před levelem):**
Předpřipravená narativní scéna zasazená do příběhu. Forma: dialogové bubliny ve vizuální novele (pozadí + postavy + text). Obsah je předgenerovaný a zafixovaný, ne generovaný za runtimu.

**Fáze 2 — Pre-level summary:**
Přehled úkolu: co bude uživatel vařit, seznam ingrediencí, odhadovaný čas, obtížnost, XP odměna, požadavky.

**Fáze 3 — Vaření (aktivní gameplay):**
- **Sidebar s ingrediencemi** — vždy viditelné, s checkboxy pro odškrtávání.
- **Kroky receptu** — uživatel je manuálně proklikává (další/předchozí). Každý krok zobrazuje instrukci + volitelný tip.
- **AI asistent** — sidebar chat/voice, dostupný celou dobu. Kontextově ví, na kterém kroku uživatel je.
- **Timer** — nastavitelný, ovladatelný přes UI i přes asistenta.

**Fáze 4 — Dokončení:**
- Uživatel klikne "Hotovo" — level se označí jako splněný.
- **Žádné bodové hodnocení výsledku** — filosofie je "dokončil jsi to, to je úspěch". (Prevence stresu a dark patterns.)
- Možnost vyfotit výsledek (fotodeníček) a přidat poznámku.
- AI asistent nabídne reflexi: "Jak to dopadlo? Co bylo nejtěžší?" — konverzace o výsledku, tipy na zlepšení.
- XP se připíší.

**Fáze 5 — Rozhodnutí (u větvících nodů):**
Pokud je node větvící bod, po dokončení se hráči zobrazí volba: kam dál? Každá možnost má krátký popis toho, co ho čeká. Rozhodnutí ovlivní příběh (butterfly effect).

### 7.5 Adaptivní onboarding

Onboarding dotazník (sekce 4.3) určí počáteční pozici v kampani. Každý node je navržen jako **možný starting point** — příběhový úvod do každé kapitoly funguje i bez kontextu předchozích.

---

## 8. Sandbox režim

Volný přístup ke všem **public** receptům bez nutnosti hrát kampaň.

- **Filtrování:** obtížnost, kuchyně/země, alergeny, čas přípravy, kategorie (snídaně/oběd/...), tagy.
- **Vyhledávání:** fulltext search přes název a popis.
- **Řazení:** dle obtížnosti, času, novosti, popularity.
- **Spuštění receptu:** stejný cooking flow jako v kampani (ingredience, kroky, AI asistent, timer), ale bez narativní cutscény.

Sandbox je **dostupný i bez přihlášení**, ale progres se neukládá a XP se nepřidělují.

---

## 9. Světová mapa

Interaktivní mapa světa s klikatelnými kontinenty/regiony. Alternativní způsob procházení receptů — filtrace dle země původu a obtížnosti.

- Klik na kontinent → zobrazí recepty z daného regionu.
- Region se vizuálně "odemyká" po uvaření prvního receptu dané kuchyně (gamifikační prvek).
- Na mapě se zobrazuje progress uživatele (počet uvařených receptů z každého regionu).
- Mapa má obtížnostní filtr — uživatel si vybere obtížnost a vidí pouze odpovídající recepty.

---

## 10. Sociální funkce

### 10.1 Profil hráče

Veřejný profil zobrazující: uživatelské jméno, avatar, level, XP, odznaky, statistiky (počet uvařených receptů, oblíbená kuchyně, streak), a galerie fotek/videí.

### 10.2 Reels / video showcase

Hráč může na svém profilu vytvářet krátká videa (styl reels/TikTok), kterými propaguje svůj profil a vaření. Tato videa se zobrazí:
- Na profilu hráče (galerie).
- V sekci **Social feed** — feed, který ostatním hráčům náhodně nabízí nová videa (vertikální scrollovací styl à la Instagram/TikTok).

Social feed je discovery mechanismus — pomáhá hráčům objevovat zajímavé profily a inspirovat se.

### 10.3 Skupiny / klany

Hráči se mohou spojit do skupin (klanů), kde:
- Porovnávají statistiky (leaderboard skupiny).
- Sdílejí recepty s viditelností **group** (viditelné pouze členům skupiny).
- Mohou mít společné challenges.

Správa skupiny: vytvoření, pozvánky (odkaz/kód), přijetí/odmítnutí, odchod, zrušení.

---

## 11. Další funkce

### 11.1 Tvorba vlastních receptů

Přihlášení uživatelé mohou vytvářet vlastní recepty přes formulář. AI asistent může pomoci:
- Zformulovat kroky srozumitelně.
- Doporučit zlepšení (technika, koření, timing).
- Navrhnout alternativní ingredience.
- Přeložit recept do druhého jazyka.

### 11.2 Recept z ledničky

Uživatel zadá ingredience, které má k dispozici, a AI navrhne recept. Výsledek lze uložit jako vlastní recept.

### 11.3 Generátor jídelníčku

Uživatel si zvolí parametry a AI vygeneruje personalizovaný jídelníček:

**Vstupní parametry:**
- Která jídla generovat: snídaně, obědy, večeře, svačiny (multiselect).
- Na kolik dní (1–14).
- Profilové preference: chci objevovat nové / chci osvědčené / budget-friendly / zdravé / rychlé / meal prep.

**Automaticky zohledněno z profilu:** alergie, intolerance, diety.

**Výstup:** seznam receptů (existujících z DB nebo AI-generovaných) přiřazených k jednotlivým dnům a jídlům. Ingredience z jídelníčku lze jedním klikem přidat do nákupního seznamu.

### 11.4 Špajz (evidence zásob)

Hráč může (nemusí) evidovat potraviny, které má doma. Způsoby přidání:
- **Manuální zadání** — název, množství, volitelně datum spotřeby.
- **OCR skenování účtenky** — hráč vyfotí účtenku, AI (Gemini 3.1 Flash-Lite vision) extrahuje položky a přidá je do špajzu.

U každého receptu se zobrazuje, zda uživatel má potřebné ingredience ve špajzu. Chybějící lze přidat na nákupní seznam.

### 11.5 Nákupní seznam

Jednoduchý checklist integrovaný s recepty, jídelníčkem a špajzem:
- U každého receptu: tlačítko "Přidat ingredience na nákupní seznam" — přidá chybějící položky.
- Při vygenerování jídelníčku: automatické přidání ingrediencí.
- Zaškrtnuté položky se přesunou do špajzu (pokud ho uživatel používá).
- Filtr: všechny / nenakoupené / nakoupené.

### 11.6 Slovník kuchařského slangu

Prohledávatelný slovník kuchařských termínů a slangu (search). Hra se na něj může odkazovat v dialozích kampaně (tooltip/link). Alternativně se uživatel může zeptat AI asistenta — slovník je užitečný pro browsing a discovery.

### 11.7 AI kontrola nahraných obrázků

Všechny obrázky nahrané uživateli (fotky jídel, challenge submissions, profilové fotky, videa) procházejí AI kontrolou přes Gemini 3.1 Flash-Lite vision:
- NSFW detekce.
- Relevantnost k receptu/kontextu (volitelně, pro challenge submissions).

### 11.8 Přizpůsobení receptu pomocí AI

Uživatel může u libovolného receptu (veřejného nebo svého) požádat AI o úpravu dle osobních připomínek: "chci to bez lepku", "pro 6 osob místo 2", "chci to pálivější". AI vygeneruje upravenou verzi, kterou lze uložit jako nový vlastní recept.

---

## 12. Gamifikační systém

### 12.1 XP a uživatelský level

Každá dokončená akce přináší XP:

| Akce | XP |
|------|-----|
| Dokončení kampaňového hlavního tasku | 100 |
| Dokončení kampaňového podtasku | 50 |
| Uvaření receptu v sandboxu | 30 |
| Splnění osobní challenge (lehká / střední / těžká) | 40 / 60 / 80 |
| Výhra v komunitní challenge | 150 |
| Vytvoření vlastního receptu | 20 |
| Ohodnocení v komunitní challenge (za účast v hlasování) | 10 |

XP určují celkový level uživatele (zobrazený na profilu). XP křivka je **logaritmická** — vyšší levely vyžadují progresivně více XP.

### 12.2 Odznaky (badges)

Odznaky za splnění specifických milestones:

- **První recept** — dokončení prvního receptu v libovolném režimu.
- **Světoběžník** — uvaření receptu z každého kontinentu.
- **7denní streak** — vaření 7 dní v řadě.
- **Mistr kapitoly** — 100% completion libovolného kampaňového node.
- **Challenge vítěz** — výhra v komunitní challenge.
- **Tvůrce** — vytvoření prvního vlastního receptu.
- **Absolvent** — dokončení celé kampaně (nebo alespoň jedné celé větve).
- **Klanový hráč** — připojení ke skupině.
- **Fotograf** — nahrání 10 fotek do deníčku.

Odznaky se zobrazují na profilu a při získání se zobrazí celebrační animace.

### 12.3 Challenges

#### Osobní challenges

Denní a týdenní úkoly generované AI. Příklady:
- "Uvař něco bez použití sporáku"
- "Vytvoř jídlo pouze z 5 ingrediencí"
- "Uvař recept z kuchyně, kterou jsi ještě nezkoušel/a"

Tři úrovně obtížnosti: lehká, střední, těžká. Dostupné pouze pro přihlášené. AI zohledňuje profil uživatele při generování. Za splnění: XP + speciální korunka. Korunky se sbírají a zobrazují na profilu.

#### Komunitní challenges

Týdenní tématické výzvy (např. "Nejlepší italský pokrm", "Kreativní snídaně"). Flow:

1. Challenge se zobrazí všem přihlášeným uživatelům.
2. Hráči uvaří jídlo dle zadání a odešlou výsledek (foto + popis).
3. **Hodnocení párovým srovnáním** (tinder-style): dvě submissions se zobrazí vedle sebe, hodnotící hráč vybere lepší. Po několika kolech (např. 10 párů) se hodnotiteli poděkuje. Tento systém zajišťuje, že kvalitní recepty se neztratí v množství.
4. Po skončení challenge se zobrazí výsledky — vítěz + top 3.

### 12.4 Live eventy

Challenges mají charakter live eventů — jsou náhodně trigernuté a časově omezené:
- **Daily:** platí 24 hodin.
- **Weekly:** platí 7 dní.

Nové challenge se generují automaticky (AI), dostupné pouze pro přihlášené hráče.

### 12.5 Prevence zneužití

- **XP cap:** denní limit na maximální počet získaných XP (prevence grindu).
- **Cooldown:** minimální čas mezi dokončením levelů (nelze proklikat 50 levelů za minutu).
- **AI verifikace:** kontrola nahraných obrázků (NSFW detekce, relevantnost).
- **Žádné dark patterns:** žádné manipulativní notifikace, žádné umělé ztráty za nehrání, žádný pay-to-win, žádné streaky penalizující uživatele. Streak badge odměňuje, ale jeho ztráta netrestá.

---

## 13. AI integrace — přehled

| Funkce | Model | Typ | Priorita |
|--------|-------|-----|----------|
| Chat/voice asistent | Gemini 3 Flash | Konverzace | P0 |
| Adaptace receptů na alergie | Gemini 3 Flash | Generování | P0 |
| Onboarding evaluace | Gemini 3 Flash | Analýza | P0 |
| Přizpůsobení receptu dle připomínek | Gemini 3 Flash | Generování | P1 |
| Jídelníček generátor | Gemini 3 Flash | Generování | P1 |
| Recept z ledničky | Gemini 3 Flash | Generování | P1 |
| Challenge generování | Gemini 3.1 Flash-Lite | Generování | P2 |
| NSFW detekce obrázků | Gemini 3.1 Flash-Lite (vision) | Klasifikace | P2 |
| OCR účtenek (špajz) | Gemini 3.1 Flash-Lite (vision) | Extrakce | P2 |
| Překlad uživatelských receptů | Gemini 3.1 Flash-Lite | Překlad | P3 |
| Voice STT/TTS (live) | Gemini 2.5 Flash Native Audio | Voice + Vision | P3 |

---

## 14. Demo rozsah

Aplikace je funkční demo ukazující celou vizi. Konkrétní omezení:

### Kampaň
- **Celý strom je viditelný** na mapě — všechny nody, větve, zámky.
- **5 nodů je hratelných:** 1 centrální startovní → rozvětví se do 2 dostupných → ke každému ještě 1. Zbytek stromu je viditelný ale zamčený.
- Každý hratelný node má kompletní flow: cutscéna, pre-level summary, cooking flow, dokončení.
- Cutscény jsou předpřipravené (ne runtime generované).

### Recepty
- Minimálně 20–30 kurátorských receptů pokrývajících obtížnosti 1–5, různé kuchyně a kategorie. CZ + EN verze.
- 5 kampaňových receptů (pro hratelné nody) + receptury pro podtasky.

### Ostatní
- Sandbox: plně funkční se všemi kurátorskými recepty.
- Mapa: plně funkční s omezeným počtem receptů na kontinent.
- Social feed: funkční s demo obsahem.
- Skupiny: funkční, lze vytvořit/připojit se.
- Challenges: alespoň 1 aktivní osobní + 1 komunitní.
- Jídelníček: plně funkční (generuje AI live).
- Špajz + nákupní seznam: plně funkční.
- Slovník: alespoň 20–30 termínů + fallback na AI asistenta.

---

## 15. UX a informační architektura

### 15.1 Hlavní navigace

Bottom tab bar (mobil) / sidebar (desktop):
1. **Kampaň** — strom příběhu, progrese, cutscény.
2. **Sandbox** — všechny recepty, filtrování, vyhledávání.
3. **Mapa** — světová mapa s recepty dle regionu.
4. **Social** — video feed, discovery.
5. **Profil** — statistiky, odznaky, nastavení, skupina, challenges, nákupní seznam, jídelníček, špajz.

**AI asistent** je floating action button dostupný na každé obrazovce.

### 15.2 UX principy

- **Zero-friction start:** sandbox bez registrace, kampaň vyžaduje jen email + dotazník.
- **Progresivní disclosure:** nový uživatel vidí kampaň a sandbox; pokročilé funkce se odemykají postupně.
- **Konzistentní vizuál:** design system s definovanými barvami, typografií a komponentami (shadcn/ui + Tailwind).
- **Stavy chyb a načítání:** skeleton loadery, jasné chybové hlášky, graceful degradation při výpadku AI.
- **Mobilní priorita:** responsive design, touch-friendly prvky, cooking mode optimalizovaný pro kuchyni (velké tlačítka, čitelný text).
- **Cooking mode:** při aktivním vaření se UI přepne do zjednodušeného režimu — velký text, velká tlačítka, minimální distrakce, timer vždy viditelný.

### 15.3 Jazyková podpora

- Čeština (výchozí) a angličtina.
- Architektura: i18n klíče v JSON souborech per locale. Přidání nového jazyka = přidání nového JSON souboru + překlad klíčů. Žádný zásah do kódu.
- Recepty mají lokalizované názvy, popisy, ingredience a kroky.
- AI asistent odpovídá v jazyce uživatele.
- UI jazyk se přepíná v nastavení; výchozí se detekuje z browseru.

---

## 16. GDPR a EU AI Act

### 16.1 Zpracovávaná data

- **Osobní údaje:** email, jméno (volitelné), profilový obrázek (volitelný).
- **Zvláštní kategorie (GDPR čl. 9):** alergie a intolerance jsou zdravotní data → explicitní souhlas.
- **Uživatelem vytvořený obsah:** recepty, fotky jídel, videa, poznámky.
- **Finanční data (při OCR účtenek):** dočasné zpracování, neukládáme celou účtenku — jen extrahované položky potravin.

### 16.2 GDPR opatření

- **Explicitní souhlas** pro zpracování zdravotních dat při onboardingu (samostatný checkbox).
- **Minimalizace dat:** sbíráme pouze to, co je nutné pro funkci aplikace.
- **Právo na výmaz:** uživatel může smazat účet a všechna data (hard delete).
- **Právo na export:** stažení všech dat ve strojově čitelném formátu (JSON).
- **API provideři:** data odesílaná do Google Gemini API podléhají Google Cloud DPA; API keys z hackathonu.
- **OCR účtenek:** obrázek účtenky se zpracuje, extrahují se položky, originální obrázek se neskladuje permanentně.

### 16.3 EU AI Act

žemLOVEka spadá do kategorie **minimálního rizika** (zábavní/vzdělávací AI). Přesto implementujeme:
- Transparentní označení AI generovaného obsahu (štítek "Generováno AI").
- Možnost odmítnout AI personalizaci.
- Logování AI interakcí pro audit.

---

## 17. Prioritizace implementace

Pořadí, ve kterém se funkce implementují. Vyšší priorita = dříve.

### P0 — Základ (bez toho aplikace nefunguje)
1. PostgreSQL setup (auth vrstva, DB schema, RLS)
2. Next.js projekt s i18n (CZ + EN)
3. Auth flow (registrace, přihlášení, profil)
4. Onboarding dotazník + AI evaluace
5. Datový model receptů + seed kurátorských receptů
6. Cooking flow (ingredience, kroky, timer)
7. AI asistent (chat, kontextové odpovědi, adaptace receptů)
8. XP + level systém

### P1 — Kampaň a hlavní loop
9. Kampaňový strom (vizualizace, zamykání, odemykání, větvení)
10. Cutscény (předpřipravený obsah, vizuální novela UI)
11. Sandbox (prohlížení, filtrování, řazení, search)
12. Profil (statistiky, odznaky, nastavení)
13. Badges systém

### P2 — Rozšíření
14. Světová mapa
15. Tvorba vlastních receptů + AI pomoc
16. Challenges (osobní + komunitní + pairwise voting)
17. Nákupní seznam
18. Generátor jídelníčku
19. Recept z ledničky

### P3 — Polish a extras
20. Sociální sekce (profil galerie, video upload, social feed)
21. Skupiny / klany
22. Špajz + OCR účtenek
23. Slovník kuchařského slangu
24. Voice asistent (STT/TTS)
25. Přizpůsobení receptu dle připomínek (AI)
26. AI kontrola obrázků (NSFW)
