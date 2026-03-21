const team = [
  { name: 'Hrant "Fun" Fanian',    role: 'AI specialista',  photo: '/chefs/niki.png' },
  { name: 'Richard "Páťa" Hývl',  role: 'Prompt mág',      photo: '/chefs/pata.png' },
  { name: 'Jan "Mlíko" Štefáček', role: 'Claude expert',   photo: '/chefs/stefy.png' },
]

export default function TeamSlider() {
  return (
    <div className="max-w-3xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-10">
      {team.map((member, i) => (
        <div key={i} className="text-center">
          <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-5 bg-[#FFF3E0] border-4 border-[#FEDC56]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
          </div>
          <div className="font-bold text-[#4E342E] text-base leading-tight">{member.name}</div>
          <div className="text-[#6D4C41]/50 text-sm mt-1.5">{member.role}</div>
        </div>
      ))}
    </div>
  )
}
