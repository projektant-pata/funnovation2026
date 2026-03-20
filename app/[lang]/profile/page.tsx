import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/app/lib/auth';
import pool from '@/app/lib/db';

type Props = { params: Promise<{ lang: string }> }

// ─── DB queries ────────────────────────────────────────────────────────────
async function getProfile(userId: string) {
  const { rows } = await pool.query(`
    SELECT
      p.user_id,
      p.username,
      p.display_name,
      p.bio,
      p.avatar_url,
      p.current_level,
      p.total_xp,
      p.streak_days,
      p.last_cooked_at,
      p.created_at,
      (SELECT COUNT(*) FROM public.follows WHERE follower_user_id = p.user_id)::int  AS following_count,
      (SELECT COUNT(*) FROM public.follows WHERE followed_user_id = p.user_id)::int  AS followers_count,
      (SELECT COUNT(*) FROM public.cooking_sessions
        WHERE user_id = p.user_id AND status = 'completed')::int                     AS cooked_count,
      (SELECT COUNT(DISTINCT r.country_id)
        FROM public.cooking_sessions cs
        JOIN public.recipes r ON r.id = cs.recipe_id
        WHERE cs.user_id = p.user_id AND cs.status = 'completed')::int              AS countries_count,
      (SELECT COUNT(*) FROM public.crowns WHERE user_id = p.user_id)::int            AS crowns_count,
      lc_now.xp_required_total  AS current_level_xp,
      lc_next.xp_required_total AS next_level_xp
    FROM public.profiles p
    LEFT JOIN public.level_config lc_now  ON lc_now.level  = p.current_level
    LEFT JOIN public.level_config lc_next ON lc_next.level = p.current_level + 1
    WHERE p.user_id = $1
  `, [userId]);
  return rows[0] ?? null;
}

async function getBadges(userId: string) {
  const { rows } = await pool.query(`
    SELECT
      b.code,
      b.name_cs,
      b.description_cs,
      ub.earned_at
    FROM public.badges b
    LEFT JOIN public.user_badges ub ON ub.badge_id = b.id AND ub.user_id = $1
    ORDER BY ub.earned_at DESC NULLS LAST, b.code
  `, [userId]);
  return rows;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = ['#E57373','#66BB6A','#5C6BC0','#FFA726','#AB47BC','#26C6DA'];
function avatarColor(username: string) {
  let h = 0;
  for (const c of username) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function xpPercent(total: number, current: number, next: number | null) {
  if (!next || !current) return 0;
  const prev = current;
  return Math.min(100, Math.round(((total - prev) / (next - prev)) * 100));
}

const BADGE_ICONS: Record<string, string> = {
  first_recipe:     '🍳',
  world_traveler:   '🌍',
  streak_7:         '🔥',
  chapter_master:   '📖',
  challenge_winner: '🏆',
  creator:          '✍️',
  graduate:         '🎓',
  clan_player:      '👥',
  food_photographer:'📸',
};

// ─── Sub-components ────────────────────────────────────────────────────────
function StatBubble({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#4E342E]/8 p-5 flex flex-col items-center gap-1 shadow-sm">
      <span className="text-3xl">{icon}</span>
      <span className="text-2xl font-black text-[#4E342E]">{value}</span>
      <span className="text-xs text-[#6D4C41]/60 font-medium text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default async function ProfilePage({ params }: Props) {
  const { lang } = await params;
  const session  = await getSession();
  if (!session) redirect(`/${lang}/login`);

  const [profile, badges] = await Promise.all([
    getProfile(session.userId),
    getBadges(session.userId),
  ]);

  if (!profile) redirect(`/${lang}/login`);

  const color    = avatarColor(profile.username);
  const pct      = xpPercent(profile.total_xp, profile.current_level_xp, profile.next_level_xp);
  const earnedBadges = badges.filter((b: { earned_at: string | null }) => b.earned_at !== null);

  const memberSince = new Date(profile.created_at).toLocaleDateString('cs-CZ', {
    month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#FFF3E0]">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#FFF3E0]/90 backdrop-blur border-b border-[#4E342E]/10 px-6 py-3 flex items-center gap-4">
        <Link href={`/${lang}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="žemLOVEka" className="h-10 w-auto" />
        </Link>
        <div className="flex-1" />
        <Link href={`/${lang}/map`}      className="px-3 py-2 rounded-lg text-sm font-semibold text-[#6D4C41] hover:bg-[#4E342E]/8">Mapa</Link>
        <Link href={`/${lang}/sandbox`}  className="px-3 py-2 rounded-lg text-sm font-semibold text-[#6D4C41] hover:bg-[#4E342E]/8">Sandbox</Link>
        <Link href={`/${lang}/campaign`} className="px-3 py-2 rounded-lg text-sm font-semibold text-[#6D4C41] hover:bg-[#4E342E]/8">Kampaň</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-[#4E342E]/8 shadow-sm p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start">

          {/* Avatar */}
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.display_name}
              className="w-24 h-24 rounded-full object-cover flex-shrink-0 border-4 border-[#FEDC56]" />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black text-white flex-shrink-0 border-4 border-[#FEDC56]"
              style={{ background: color }}
            >
              {initials(profile.display_name || profile.username)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-black text-[#4E342E]">{profile.display_name || profile.username}</h1>
            <p className="text-[#6D4C41]/60 text-sm font-medium mb-2">@{profile.username}</p>

            {profile.bio && (
              <p className="text-[#6D4C41] text-base mb-3">{profile.bio}</p>
            )}

            {/* Followers row */}
            <div className="flex gap-5 justify-center sm:justify-start text-sm text-[#6D4C41]/70 mb-3">
              <span><strong className="text-[#4E342E]">{profile.following_count}</strong> sleduji</span>
              <span><strong className="text-[#4E342E]">{profile.followers_count}</strong> sledovatelů</span>
              <span className="hidden sm:inline">člen od {memberSince}</span>
            </div>

            {/* XP bar */}
            <div className="max-w-xs mx-auto sm:mx-0">
              <div className="flex justify-between text-xs text-[#6D4C41]/60 mb-1">
                <span>Level {profile.current_level}</span>
                <span>{profile.total_xp.toLocaleString('cs-CZ')} XP</span>
              </div>
              <div className="h-2.5 bg-[#4E342E]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FEDC56] rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {profile.next_level_xp && (
                <p className="text-xs text-[#6D4C41]/50 mt-1 text-right">
                  do levelu {profile.current_level + 1}: {(profile.next_level_xp - profile.total_xp).toLocaleString('cs-CZ')} XP
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats bubbles ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-black text-[#4E342E] mb-4">Statistiky</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <StatBubble icon="🔥" value={profile.streak_days}    label="dní v řadě" />
            <StatBubble icon="⭐" value={`${profile.current_level}`} label="level" />
            <StatBubble icon="🍳" value={profile.cooked_count}   label="uvařeno" />
            <StatBubble icon="🌍" value={profile.countries_count} label="zemí" />
            <StatBubble icon="🏆" value={profile.crowns_count}   label="výher" />
          </div>
        </section>

        {/* ── Badges ──────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-[#4E342E]">
              Odznáčky
              {earnedBadges.length > 0 && (
                <span className="ml-2 text-sm font-semibold text-[#6D4C41]/50">
                  {earnedBadges.length}/{badges.length}
                </span>
              )}
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {badges.map((b: { code: string; name_cs: string; description_cs: string; earned_at: string | null }) => {
              const earned = b.earned_at !== null;
              return (
                <div
                  key={b.code}
                  title={b.description_cs}
                  className={`rounded-2xl border p-4 flex flex-col items-center gap-2 text-center transition-all ${
                    earned
                      ? 'bg-white border-[#FEDC56] shadow-sm'
                      : 'bg-[#4E342E]/4 border-[#4E342E]/8 opacity-50 grayscale'
                  }`}
                >
                  <span className="text-3xl">{BADGE_ICONS[b.code] ?? '🎖️'}</span>
                  <span className={`text-xs font-bold leading-tight ${earned ? 'text-[#4E342E]' : 'text-[#6D4C41]'}`}>
                    {b.name_cs}
                  </span>
                  {earned && b.earned_at && (
                    <span className="text-[10px] text-[#6D4C41]/50">
                      {new Date(b.earned_at).toLocaleDateString('cs-CZ', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  {!earned && <span className="text-xs">🔒</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Placeholders ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Campaign */}
          <div className="bg-[#E57373]/10 border border-[#E57373]/20 rounded-2xl p-6 flex flex-col gap-3">
            <div className="text-2xl">🎭</div>
            <h3 className="font-black text-[#4E342E]">Kampaň</h3>
            <p className="text-sm text-[#6D4C41]/70">Tvůj postup příběhem bude sledován zde.</p>
            <div className="h-2 bg-[#4E342E]/10 rounded-full">
              <div className="h-full w-0 bg-[#E57373] rounded-full" />
            </div>
            <span className="text-xs text-[#6D4C41]/50 font-medium">Brzy k dispozici</span>
          </div>

          {/* Diary */}
          <div className="bg-[#4FC3F7]/10 border border-[#4FC3F7]/20 rounded-2xl p-6 flex flex-col gap-3">
            <div className="text-2xl">📓</div>
            <h3 className="font-black text-[#4E342E]">Deníček</h3>
            <p className="text-sm text-[#6D4C41]/70">Historie všeho, co jsi uvařil/a. Každý recept, každý den.</p>
            <span className="text-xs text-[#6D4C41]/50 font-medium">Brzy k dispozici</span>
          </div>

        </div>

      </div>
    </div>
  );
}
