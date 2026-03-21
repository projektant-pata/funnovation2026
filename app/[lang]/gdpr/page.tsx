import { notFound } from 'next/navigation'
import { hasLocale, type Locale } from '../dictionaries'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import GdprClient from './GdprClient'

type Props = { params: Promise<{ lang: string }> }

const hero = {
	cs: {
		title: 'GDPR & Ochrana dat',
		subtitle: 'Transparentnost a kontrola jsou základem důvěry. Tady máš přehled o tom, jak zpracováváme tvoje data — a nástroje, abys mohl/a kdykoli rozhodnout sám/a.',
		lastUpdate: 'Naposledy aktualizováno: 21. 3. 2026',
		sections: [
			{
				title: 'Kdo jsme a co zpracováváme',
				body: `žemLOVEka je gamifikovaná platforma pro výuku vaření. Správcem osobních údajů je provozovatel platformy žemLOVEka (dále jen "my").

Zpracováváme tyto kategorie dat:
• Identifikační data — e-mailová adresa, uživatelské jméno, avatar
• Preferenční data — frekvence vaření, motivace, časový budget, oblíbené kuchyně
• Herní data — XP, odznaky, progres kampaně, dokončené recepty
• Zdravotní data (pouze se souhlasem) — alergie, intolerance, diety
• AI interakční data — záznamy dotazů a odpovědí AI asistenta pro auditní účely
• Obsah vytvořený uživatelem — fotky, reels, recepty`,
			},
			{
				title: 'Právní základ zpracování',
				body: `Zpracování probíhá na základě:
• Smlouvy — zpracování nezbytné pro poskytnutí služby (herní progres, autentizace)
• Souhlasu — zdravotní data, AI personalizace, marketing
• Oprávněného zájmu — bezpečnost platformy, detekce podvodů, audit AI
• Zákonné povinnosti — archivace dle příslušných právních předpisů`,
			},
			{
				title: 'Předávání dat třetím stranám',
				body: `Data předáváme pouze:
• Google LLC — provoz Gemini AI API (data jsou zpracovávána dle Google Cloud DPA; zdravotní data jsou odesílána pouze se souhlasem)
• Infrastrukturním poskytovatelům — hosting (VPS v EU)

Data neprodáváme, nesdílíme pro reklamní účely třetích stran a nepředáváme mimo EHP bez odpovídajících záruk.`,
			},
			{
				title: 'Doba uchovávání',
				body: `• Účet a profil — po dobu trvání registrace + 30 dní po žádosti o výmaz
• AI audit logy — 12 měsíců od vzniku záznamu
• Záznamy souhlasů — po dobu trvání účtu + 3 roky (zákonná lhůta)
• Data z marketingových e-mailů — do odvolání souhlasu`,
			},
			{
				title: 'Cookies a sledování',
				body: `Používáme výhradně funkční cookies nezbytné pro provoz:
• zl_session — JWT session token (HttpOnly, SameSite=Lax, Secure)

Nepoužíváme žádné analytické, marketingové ani sledovací cookies třetích stran.`,
			},
		],
	},
	en: {
		title: 'GDPR & Data Privacy',
		subtitle: 'Transparency and control are the foundation of trust. Here you have a full overview of how we process your data — and the tools to decide for yourself, at any time.',
		lastUpdate: 'Last updated: 21 March 2026',
		sections: [
			{
				title: 'Who we are and what we process',
				body: `žemLOVEka is a gamified cooking education platform. The data controller is the operator of the žemLOVEka platform ("we").

We process the following categories of data:
• Identity data — email address, username, avatar
• Preference data — cooking frequency, motivations, time budget, favourite cuisines
• Game data — XP, badges, campaign progress, completed recipes
• Health data (only with consent) — allergies, intolerances, diets
• AI interaction data — records of AI assistant queries and responses for audit purposes
• User-generated content — photos, reels, recipes`,
			},
			{
				title: 'Legal basis for processing',
				body: `Processing is based on:
• Contract — processing necessary to provide the service (game progress, authentication)
• Consent — health data, AI personalisation, marketing
• Legitimate interest — platform security, fraud detection, AI audit
• Legal obligation — archiving under applicable law`,
			},
			{
				title: 'Sharing data with third parties',
				body: `We share data only with:
• Google LLC — operating the Gemini AI API (data processed under the Google Cloud DPA; health data is sent only with your consent)
• Infrastructure providers — hosting (VPS in the EU)

We do not sell data, share it for third-party advertising, or transfer it outside the EEA without appropriate safeguards.`,
			},
			{
				title: 'Retention periods',
				body: `• Account and profile — for the duration of registration + 30 days after a deletion request
• AI audit logs — 12 months from the date of the record
• Consent records — for the duration of the account + 3 years (statutory period)
• Marketing email data — until consent is withdrawn`,
			},
			{
				title: 'Cookies and tracking',
				body: `We use only functional cookies necessary for operation:
• zl_session — JWT session token (HttpOnly, SameSite=Lax, Secure)

We do not use any analytical, marketing or third-party tracking cookies.`,
			},
		],
	},
}

export default async function GdprPage({ params }: Props) {
	const { lang } = await params
	if (!hasLocale(lang)) notFound()
	const locale = lang as Locale
	const h = hero[locale as 'cs' | 'en'] ?? hero.cs

	return (
		<div className="bg-[#FFF3E0] min-h-screen font-[family-name:var(--font-geist-sans)]">
			<Navbar lang={lang} />

			{/* Hero */}
			<div className="bg-[#4E342E] pt-20 pb-14 px-4 text-center">
				<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FEDC56]/20 mb-6">
					<svg className="w-7 h-7 text-[#FEDC56]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
						<path d="M7 11V7a5 5 0 0110 0v4" />
					</svg>
				</div>
				<h1 className="text-4xl font-black text-white mb-4">{h.title}</h1>
				<p className="text-white/60 text-base max-w-xl mx-auto leading-relaxed">{h.subtitle}</p>
				<p className="text-white/30 text-xs mt-4">{h.lastUpdate}</p>
			</div>

			{/* Policy sections */}
			<div className="max-w-2xl mx-auto px-4 pt-12 pb-4">
				{h.sections.map(section => (
					<section key={section.title} className="mb-8">
						<h2 className="text-lg font-black text-[#4E342E] mb-3">{section.title}</h2>
						<div className="bg-white rounded-2xl border border-[#6D4C41]/10 px-5 py-4">
							<p className="text-[#6D4C41]/70 text-sm leading-relaxed whitespace-pre-line">{section.body}</p>
						</div>
					</section>
				))}
			</div>

			{/* Divider */}
			<div className="max-w-2xl mx-auto px-4 py-6">
				<div className="h-px bg-[#6D4C41]/10" />
			</div>

			{/* Interactive consent management */}
			<GdprClient lang={locale as 'cs' | 'en'} />

			<Footer lang={lang} />
		</div>
	)
}
