'use client'

import { useState } from 'react'

type Lang = 'cs' | 'en'

const t = {
	cs: {
		consentsTitle: 'Správa souhlasů',
		consentsDesc: 'Přehled a správa tvých souhlasů se zpracováním osobních údajů. Souhlas můžeš kdykoliv odvolat.',
		consentItems: [
			{
				id: 'terms',
				label: 'Podmínky služby',
				desc: 'Souhlas s podmínkami užívání platformy žemLOVEka. Tento souhlas je povinný pro používání aplikace.',
				required: true,
			},
			{
				id: 'privacy',
				label: 'Zásady ochrany osobních údajů',
				desc: 'Souhlas se základním zpracováním osobních údajů nezbytným pro provoz platformy.',
				required: true,
			},
			{
				id: 'health_data',
				label: 'Zdravotní a dietní data',
				desc: 'Souhlas s ukládáním alergií, intolerancí a dietních omezení. Tato data jsou klasifikována jako zvláštní kategorie dle čl. 9 GDPR a jsou používána výhradně pro personalizaci receptů a bezpečné rady AI asistenta.',
				required: false,
			},
			{
				id: 'ai_personalization',
				label: 'Personalizace AI',
				desc: 'Souhlas s použitím tvého profilu (skill level, preference, historii) pro přizpůsobení odpovědí AI asistenta. Bez tohoto souhlasu dostáváš generické rady.',
				required: false,
			},
			{
				id: 'marketing',
				label: 'Marketingová komunikace',
				desc: 'Souhlas se zasíláním novinek, tipu a nabídek e-mailem. Odhlásit se lze kdykoliv kliknutím na odkaz v e-mailu.',
				required: false,
			},
		],
		granted: 'Uděleno',
		withdrawn: 'Odvoláno',
		withdraw: 'Odvolat',
		grant: 'Udělit',
		required: 'Povinné',
		saving: 'Ukládám…',
		rightsTitle: 'Tvá práva dle GDPR',
		rightsDesc: 'Jako subjekt údajů máš vůči žemLOVEka tato práva:',
		rights: [
			{ icon: 'download', label: 'Právo na přístup a přenositelnost', desc: 'Můžeš požádat o export všech svých dat ve strojově čitelném formátu (JSON).' },
			{ icon: 'trash', label: 'Právo na výmaz ("být zapomenut")', desc: 'Můžeš požádat o smazání svého účtu a všech associated dat. Zpracování trvá do 30 dnů.' },
			{ icon: 'edit', label: 'Právo na opravu', desc: 'Svůj profil a preference můžeš kdykoliv editovat v Nastavení.' },
			{ icon: 'pause', label: 'Právo na omezení zpracování', desc: 'Můžeš odvolat konkrétní souhlasy výše a omezit tak zpracování svých dat.' },
			{ icon: 'flag', label: 'Právo podat stížnost', desc: 'Máš právo podat stížnost u Úřadu pro ochranu osobních údajů (ÚOOÚ), Pplk. Sochora 27, 170 00 Praha 7.' },
		],
		exportTitle: 'Export dat',
		exportDesc: 'Stáhnout všechna svá data ve formátu JSON.',
		exportBtn: 'Požádat o export dat',
		exportSent: 'Žádost o export odeslána. Dostaneš e-mail s odkazem do 72 hodin.',
		deleteTitle: 'Smazání účtu',
		deleteDesc: 'Trvalé smazání účtu a všech dat. Tato akce je nevratná.',
		deleteBtn: 'Požádat o smazání účtu',
		deleteConfirm: 'Opravdu chceš smazat svůj účet? Tato akce je nevratná.',
		deleteSent: 'Žádost o smazání odeslána. Účet bude smazán do 30 dnů.',
		contactTitle: 'Správce údajů',
		contactText: 'žemLOVEka · e-mail: gdpr@zemloveka.cz · Pro uplatnění práv nebo otázky ohledně zpracování dat nás kontaktuj na výše uvedeném e-mailu.',
		aiTitle: 'Zpracování dat AI',
		aiDesc: 'Každá interakce s AI asistentem (Šéfkuchař) je logována pro účely auditu, bezpečnosti a zlepšení služby. Logy obsahují: typ interakce, počet tokenů, latenci a flag úspěchu. Zdravotní data jsou do AI odesílána pouze pokud jsi udělil/a příslušný souhlas výše.',
	},
	en: {
		consentsTitle: 'Consent Management',
		consentsDesc: 'Overview and management of your data processing consents. You can withdraw any consent at any time.',
		consentItems: [
			{
				id: 'terms',
				label: 'Terms of Service',
				desc: 'Consent to the terms of use of the žemLOVEka platform. This consent is required to use the app.',
				required: true,
			},
			{
				id: 'privacy',
				label: 'Privacy Policy',
				desc: 'Consent to basic personal data processing necessary for platform operation.',
				required: true,
			},
			{
				id: 'health_data',
				label: 'Health & Dietary Data',
				desc: 'Consent to storing allergies, intolerances and dietary restrictions. This data is classified as a special category under Art. 9 GDPR and is used exclusively for recipe personalisation and safe AI assistant guidance.',
				required: false,
			},
			{
				id: 'ai_personalization',
				label: 'AI Personalisation',
				desc: 'Consent to using your profile (skill level, preferences, history) to tailor AI assistant responses. Without this consent you receive generic advice.',
				required: false,
			},
			{
				id: 'marketing',
				label: 'Marketing Communications',
				desc: 'Consent to receiving news, tips and offers by email. You can unsubscribe at any time via the link in any email.',
				required: false,
			},
		],
		granted: 'Granted',
		withdrawn: 'Withdrawn',
		withdraw: 'Withdraw',
		grant: 'Grant',
		required: 'Required',
		saving: 'Saving…',
		rightsTitle: 'Your GDPR Rights',
		rightsDesc: 'As a data subject you have the following rights with respect to žemLOVEka:',
		rights: [
			{ icon: 'download', label: 'Right of Access & Portability', desc: 'You can request an export of all your data in machine-readable format (JSON).' },
			{ icon: 'trash', label: 'Right to Erasure ("right to be forgotten")', desc: 'You can request deletion of your account and all associated data. Processing takes up to 30 days.' },
			{ icon: 'edit', label: 'Right to Rectification', desc: 'You can edit your profile and preferences at any time in Settings.' },
			{ icon: 'pause', label: 'Right to Restriction of Processing', desc: 'You can withdraw specific consents above to restrict processing of your data.' },
			{ icon: 'flag', label: 'Right to Lodge a Complaint', desc: 'You have the right to lodge a complaint with your national supervisory authority.' },
		],
		exportTitle: 'Data Export',
		exportDesc: 'Download all your data in JSON format.',
		exportBtn: 'Request data export',
		exportSent: 'Export request submitted. You will receive an email with a download link within 72 hours.',
		deleteTitle: 'Delete Account',
		deleteDesc: 'Permanently delete your account and all data. This action is irreversible.',
		deleteBtn: 'Request account deletion',
		deleteConfirm: 'Are you sure you want to delete your account? This action is irreversible.',
		deleteSent: 'Deletion request submitted. Your account will be deleted within 30 days.',
		contactTitle: 'Data Controller',
		contactText: 'žemLOVEka · email: gdpr@zemloveka.cz · To exercise your rights or ask about data processing, contact us at the email above.',
		aiTitle: 'AI Data Processing',
		aiDesc: 'Every interaction with the AI assistant (Chef) is logged for audit, safety and service improvement purposes. Logs contain: interaction type, token count, latency and success flag. Health data is only sent to AI if you have granted the relevant consent above.',
	},
}

function ToggleIcon({ on }: { on: boolean }) {
	return (
		<div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${on ? 'bg-[#4E342E]' : 'bg-[#6D4C41]/20'}`}>
			<div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
		</div>
	)
}

function RightIcon({ type }: { type: string }) {
	const cls = 'w-5 h-5 text-[#FEDC56]'
	if (type === 'download') return (
		<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
		</svg>
	)
	if (type === 'trash') return (
		<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
		</svg>
	)
	if (type === 'edit') return (
		<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
		</svg>
	)
	if (type === 'pause') return (
		<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="10" /><line x1="10" y1="15" x2="10" y2="9" /><line x1="14" y1="15" x2="14" y2="9" />
		</svg>
	)
	return (
		<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
		</svg>
	)
}

export default function GdprClient({ lang }: { lang: Lang }) {
	const d = t[lang] ?? t.cs

	// Simulate consents — in real app these come from the server / API
	const [consents, setConsents] = useState<Record<string, boolean>>({
		terms: true,
		privacy: true,
		health_data: false,
		ai_personalization: true,
		marketing: false,
	})
	const [saving, setSaving] = useState<string | null>(null)
	const [exportSent, setExportSent] = useState(false)
	const [deleteSent, setDeleteSent] = useState(false)

	async function toggle(id: string, required: boolean) {
		if (required) return
		setSaving(id)
		// Simulate API call
		await new Promise(r => setTimeout(r, 600))
		setConsents(prev => ({ ...prev, [id]: !prev[id] }))
		setSaving(null)
	}

	function requestExport() {
		setExportSent(true)
	}

	function requestDelete() {
		if (!confirm(d.deleteConfirm)) return
		setDeleteSent(true)
	}

	return (
		<div className="max-w-2xl mx-auto px-4 pb-16">

			{/* Consent management */}
			<section className="mb-12">
				<h2 className="text-2xl font-black text-[#4E342E] mb-2">{d.consentsTitle}</h2>
				<p className="text-[#6D4C41]/70 text-sm mb-6 leading-relaxed">{d.consentsDesc}</p>

				<div className="flex flex-col gap-3">
					{d.consentItems.map(item => {
						const on = consents[item.id] ?? false
						const busy = saving === item.id
						return (
							<div
								key={item.id}
								className="bg-white rounded-2xl border border-[#6D4C41]/10 px-5 py-4"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<span className="font-bold text-[#4E342E] text-sm">{item.label}</span>
											{item.required && (
												<span className="text-[10px] font-bold uppercase tracking-wide text-[#FEDC56] bg-[#4E342E] px-2 py-0.5 rounded-full">
													{d.required}
												</span>
											)}
										</div>
										<p className="text-[#6D4C41]/60 text-xs leading-relaxed">{item.desc}</p>
									</div>
									<button
										onClick={() => toggle(item.id, item.required)}
										disabled={item.required || busy}
										aria-label={on ? d.withdraw : d.grant}
										className={`mt-0.5 shrink-0 ${item.required ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
									>
										{busy ? (
											<div className="w-11 h-6 flex items-center justify-center">
												<div className="w-4 h-4 border-2 border-[#4E342E]/30 border-t-[#4E342E] rounded-full animate-spin" />
											</div>
										) : (
											<ToggleIcon on={on} />
										)}
									</button>
								</div>
								<div className="mt-2">
									<span className={`text-xs font-semibold ${on ? 'text-green-600' : 'text-[#6D4C41]/40'}`}>
										{on ? d.granted : d.withdrawn}
									</span>
								</div>
							</div>
						)
					})}
				</div>
			</section>

			{/* AI data processing note */}
			<section className="mb-12">
				<div className="bg-[#FEDC56]/15 border border-[#FEDC56]/40 rounded-2xl px-5 py-4">
					<div className="flex items-center gap-2 mb-2">
						<svg className="w-4 h-4 text-[#4E342E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
						</svg>
						<span className="font-bold text-[#4E342E] text-sm">{d.aiTitle}</span>
					</div>
					<p className="text-[#4E342E]/70 text-xs leading-relaxed">{d.aiDesc}</p>
				</div>
			</section>

			{/* GDPR rights */}
			<section className="mb-12">
				<h2 className="text-2xl font-black text-[#4E342E] mb-2">{d.rightsTitle}</h2>
				<p className="text-[#6D4C41]/70 text-sm mb-6">{d.rightsDesc}</p>
				<div className="flex flex-col gap-3">
					{d.rights.map(right => (
						<div key={right.label} className="flex gap-4 bg-white rounded-2xl border border-[#6D4C41]/10 px-5 py-4">
							<div className="w-9 h-9 rounded-xl bg-[#FEDC56]/20 flex items-center justify-center shrink-0">
								<RightIcon type={right.icon} />
							</div>
							<div>
								<div className="font-bold text-[#4E342E] text-sm mb-1">{right.label}</div>
								<div className="text-[#6D4C41]/60 text-xs leading-relaxed">{right.desc}</div>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Export data */}
			<section className="mb-6">
				<div className="bg-white rounded-2xl border border-[#6D4C41]/10 px-5 py-5">
					<h3 className="font-black text-[#4E342E] text-base mb-1">{d.exportTitle}</h3>
					<p className="text-[#6D4C41]/60 text-xs mb-4">{d.exportDesc}</p>
					{exportSent ? (
						<div className="flex items-start gap-2 text-green-700 text-xs">
							<svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<polyline points="20 6 9 17 4 12" />
							</svg>
							{d.exportSent}
						</div>
					) : (
						<button
							onClick={requestExport}
							className="flex items-center gap-2 bg-[#4E342E] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#3E2723] transition-colors"
						>
							<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
							</svg>
							{d.exportBtn}
						</button>
					)}
				</div>
			</section>

			{/* Delete account */}
			<section className="mb-12">
				<div className="bg-white rounded-2xl border border-red-200 px-5 py-5">
					<h3 className="font-black text-red-700 text-base mb-1">{d.deleteTitle}</h3>
					<p className="text-[#6D4C41]/60 text-xs mb-4">{d.deleteDesc}</p>
					{deleteSent ? (
						<div className="flex items-start gap-2 text-red-700 text-xs">
							<svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<polyline points="20 6 9 17 4 12" />
							</svg>
							{d.deleteSent}
						</div>
					) : (
						<button
							onClick={requestDelete}
							className="flex items-center gap-2 border border-red-300 text-red-700 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors"
						>
							<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
							</svg>
							{d.deleteBtn}
						</button>
					)}
				</div>
			</section>

			{/* Contact */}
			<section>
				<div className="bg-[#4E342E]/5 rounded-2xl px-5 py-4 border border-[#6D4C41]/10">
					<h3 className="font-bold text-[#4E342E] text-sm mb-1">{d.contactTitle}</h3>
					<p className="text-[#6D4C41]/70 text-xs leading-relaxed">{d.contactText}</p>
				</div>
			</section>
		</div>
	)
}
