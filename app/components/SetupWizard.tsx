'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Diet     = { id: string; code: string; name_cs: string }
type Allergen = { id: string; code: string; name_cs: string }

const STEPS = 5

const GENDER_OPTIONS = [
  { value: 'male',              label: 'Muž',              emoji: '👨' },
  { value: 'female',            label: 'Žena',             emoji: '👩' },
  { value: 'other',             label: 'Jiné',             emoji: '🧑' },
  { value: 'prefer_not_to_say', label: 'Nechci uvést',     emoji: '🙈' },
]

const AGE_OPTIONS = [
  { value: 'under_18', label: 'Méně než 18 let' },
  { value: '18_25',    label: '18 – 25 let' },
  { value: '26_35',    label: '26 – 35 let' },
  { value: '36_50',    label: '36 – 50 let' },
  { value: '51_plus',  label: '51 a více let' },
]

const EXPERIENCE_OPTIONS = [
  { value: 'never',         label: 'Začátečník',   desc: 'Vařím zřídka nebo vůbec',      emoji: '🥚' },
  { value: 'few_per_month', label: 'Pokročilý',    desc: 'Vařím pravidelně několikrát týdně', emoji: '🍳' },
  { value: 'daily',         label: 'Profík',       desc: 'Vaření je moje vášeň',          emoji: '👨‍🍳' },
]

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="w-full flex gap-1.5">
      {Array.from({ length: STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-500 ${
            i < step ? 'bg-[#FEDC56]' : 'bg-[#4E342E]/10'
          }`}
        />
      ))}
    </div>
  )
}

function SingleSelect<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string; emoji?: string; desc?: string }[]
  value: T | null
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all ${
            value === opt.value
              ? 'border-[#FEDC56] bg-[#FEDC56]/15 shadow-sm'
              : 'border-[#4E342E]/10 bg-white hover:border-[#4E342E]/30'
          }`}
        >
          {opt.emoji && <span className="text-3xl">{opt.emoji}</span>}
          <div>
            <div className="font-bold text-[#4E342E]">{opt.label}</div>
            {opt.desc && <div className="text-sm text-[#6D4C41]/60">{opt.desc}</div>}
          </div>
          <div className={`ml-auto w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            value === opt.value ? 'border-[#FEDC56] bg-[#FEDC56]' : 'border-[#4E342E]/20'
          }`}>
            {value === opt.value && (
              <svg className="w-3 h-3 text-[#4E342E]" viewBox="0 0 12 12" fill="currentColor">
                <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

function MultiSelect({
  options, values, onChange,
}: {
  options: { id: string; code: string; name_cs: string }[]
  values: string[]
  onChange: (codes: string[]) => void
}) {
  function toggle(code: string) {
    onChange(values.includes(code) ? values.filter((c) => c !== code) : [...values, code])
  }
  return (
    <div className="flex flex-wrap gap-3 w-full justify-center">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => toggle(opt.code)}
          className={`px-5 py-2.5 rounded-full border-2 font-semibold text-sm transition-all ${
            values.includes(opt.code)
              ? 'border-[#FEDC56] bg-[#FEDC56]/15 text-[#4E342E] shadow-sm'
              : 'border-[#4E342E]/15 bg-white text-[#6D4C41] hover:border-[#4E342E]/30'
          }`}
        >
          {opt.name_cs}
        </button>
      ))}
    </div>
  )
}

export default function SetupWizard({
  lang,
  diets,
  allergens,
}: {
  lang: string
  diets: Diet[]
  allergens: Allergen[]
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [gender,    setGender]    = useState<string | null>(null)
  const [ageRange,  setAgeRange]  = useState<string | null>(null)
  const [experience, setExperience] = useState<string | null>(null)
  const [selectedDiets,     setSelectedDiets]     = useState<string[]>([])
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])

  const canContinue = (() => {
    if (step === 1) return gender !== null
    if (step === 2) return ageRange !== null
    if (step === 3) return experience !== null
    return true // steps 4+5 are optional
  })()

  async function handleFinish() {
    setSaving(true)
    await fetch('/api/setup/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gender,
        age_range:         ageRange,
        cooking_frequency: experience,
        diet_codes:        selectedDiets,
        allergen_codes:    selectedAllergens,
      }),
    })
    router.push(`/${lang}`)
    router.refresh()
  }

  const steps: { title: string; subtitle: string; content: React.ReactNode }[] = [
    {
      title: 'Jaké je tvoje pohlaví?',
      subtitle: 'Pomůže nám přizpůsobit obsah.',
      content: <SingleSelect options={GENDER_OPTIONS} value={gender} onChange={setGender} />,
    },
    {
      title: 'Kolik ti je let?',
      subtitle: 'Přizpůsobíme obtížnost receptů.',
      content: <SingleSelect options={AGE_OPTIONS} value={ageRange} onChange={setAgeRange} />,
    },
    {
      title: 'Jaké máš zkušenosti s vařením?',
      subtitle: 'Budeš dostávat recepty přesně pro tebe.',
      content: <SingleSelect options={EXPERIENCE_OPTIONS} value={experience} onChange={setExperience} />,
    },
    {
      title: 'Stravovací preference',
      subtitle: 'Vyber vše, co se tě týká. Můžeš přeskočit.',
      content: <MultiSelect options={diets} values={selectedDiets} onChange={setSelectedDiets} />,
    },
    {
      title: 'Máš nějaké alergie?',
      subtitle: 'Upozorníme tě u každého receptu. Můžeš přeskočit.',
      content: <MultiSelect options={allergens} values={selectedAllergens} onChange={setSelectedAllergens} />,
    },
  ]

  const current = steps[step - 1]

  return (
    <div className="min-h-screen bg-[#FFF3E0] flex flex-col">
      {/* Top bar */}
      <div className="px-6 pt-8 pb-4 flex items-center gap-4">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#4E342E]/8 transition-colors"
          >
            <svg className="w-5 h-5 text-[#6D4C41]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="flex-1">
          <ProgressBar step={step} />
        </div>
        <button
          onClick={step === STEPS ? handleFinish : () => setStep((s) => s + 1)}
          className="text-sm font-semibold text-[#6D4C41]/50 hover:text-[#6D4C41] transition-colors"
        >
          Přeskočit
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-10 pb-10 max-w-lg mx-auto w-full">
        <div className="text-xs font-bold uppercase tracking-widest text-[#6D4C41]/40 mb-3">
          {step} / {STEPS}
        </div>
        <h1 className="text-3xl font-black text-[#4E342E] text-center mb-2 leading-tight">
          {current.title}
        </h1>
        <p className="text-base text-[#6D4C41]/60 text-center mb-10">
          {current.subtitle}
        </p>

        {current.content}
      </div>

      {/* Bottom button */}
      <div className="px-6 pb-10 max-w-lg mx-auto w-full">
        {step < STEPS ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canContinue}
            className="w-full bg-[#FEDC56] hover:bg-[#f5d430] disabled:opacity-40 disabled:cursor-not-allowed text-[#4E342E] font-black text-lg px-6 py-4 rounded-2xl transition-colors shadow-sm"
          >
            Pokračovat
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={saving}
            className="w-full bg-[#4E342E] hover:bg-[#3e2723] disabled:opacity-50 text-white font-black text-lg px-6 py-4 rounded-2xl transition-colors shadow-sm"
          >
            {saving ? 'Ukládám…' : 'Hotovo! Jdeme vařit 🍳'}
          </button>
        )}
      </div>
    </div>
  )
}
