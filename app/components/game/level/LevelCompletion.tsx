'use client'

import Link from 'next/link'

type Props = {
  title: string
  subtitle: string
  noteLabel: string
  notePlaceholder: string
  noteValue: string
  onNoteChange: (value: string) => void
  photoLabel: string
  aiReflectionTitle: string
  reflectionPrompts: string[]
  doneLabel: string
  backToTreeHref: string
}

export default function LevelCompletion({
  title,
  subtitle,
  noteLabel,
  notePlaceholder,
  noteValue,
  onNoteChange,
  photoLabel,
  aiReflectionTitle,
  reflectionPrompts,
  doneLabel,
  backToTreeHref,
}: Props) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-6">
      <div className="rounded-3xl border border-[#4E342E]/10 bg-white shadow-lg overflow-hidden">
        <div className="px-6 py-6 bg-gradient-to-br from-[#F5A623]/20 to-[#FEDC56]/20 border-b border-[#4E342E]/10">
          <h1 className="text-2xl font-black text-[#4E342E]">{title}</h1>
          <p className="text-sm text-[#6D4C41] mt-2">{subtitle}</p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#4E342E] mb-2">{photoLabel}</label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-[#5D4037] file:mr-3 file:rounded-lg file:border-0 file:bg-[#4E342E] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#FFF8E1] hover:file:bg-[#5D4037]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#4E342E] mb-2">{noteLabel}</label>
            <textarea
              value={noteValue}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder={notePlaceholder}
              rows={4}
              className="w-full rounded-xl border border-[#4E342E]/20 px-3 py-2 text-sm text-[#4E342E] placeholder:text-[#6D4C41]/50 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
            />
          </div>

          <div className="rounded-xl border border-[#4E342E]/10 bg-[#FFF8E1] p-4">
            <h2 className="text-sm font-bold text-[#4E342E] mb-2">{aiReflectionTitle}</h2>
            <ul className="space-y-1.5">
              {reflectionPrompts.map((prompt) => (
                <li key={prompt} className="text-sm text-[#5D4037]">
                  • {prompt}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Link
              href={backToTreeHref}
              className="inline-flex rounded-xl bg-[#4E342E] hover:bg-[#5D4037] text-[#FFF8E1] font-semibold px-5 py-3 transition-colors"
            >
              {doneLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
