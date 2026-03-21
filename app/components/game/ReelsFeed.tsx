'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

type Comment = { id: string; author: string; avatar: string; text: string }

type Reel = {
  id: string
  src: string
  type: 'image' | 'video'
  author: { name: string; handle: string; avatar: string }
  caption: string
  likes: number
  commentsList: Comment[]
}

const REELS: Reel[] = [
  {
    id: '1',
    src: '/reels/1.jpg',
    type: 'image',
    author: { name: 'Stefy', handle: '@stefy_vari', avatar: '/chefs/stefy.png' },
    caption:
      'Snídaňové avokádo s vejcem na toastu. Tohle si dávám každé ráno před školou — jednoduchý, rychlý a plný energie. Zvládnete to za 10 minut a zbyde čas na kafe.',
    likes: 284,
    commentsList: [
      { id: 'c1', author: 'Páťa', avatar: '/chefs/pata.png', text: 'To vypadá fakt dobře!' },
      { id: 'c2', author: 'Niki', avatar: '/chefs/niki.png', text: 'Já zkusím zítra ráno' },
    ],
  },
  {
    id: '2',
    src: '/reels/2.mp4',
    type: 'video',
    author: { name: 'Páťa', handle: '@pata_ostrava', avatar: '/chefs/pata.png' },
    caption:
      'Carbonara bez smetany — tohle je the real deal. Žloutek + pecorino + guanciale. Žádný cheaty a žádná smetana. Tohle je jediná správná verze.',
    likes: 512,
    commentsList: [
      { id: 'c1', author: 'Stefy', avatar: '/chefs/stefy.png', text: 'Přesně takto se to dělá!' },
      { id: 'c2', author: 'Niki', avatar: '/chefs/niki.png', text: 'Konečně někdo říká pravdu o carbonaře' },
    ],
  },
  {
    id: '3',
    src: '/reels/3.jpg',
    type: 'image',
    author: { name: 'Niki', handle: '@niki_cooks', avatar: '/chefs/niki.png' },
    caption:
      'Nedělní oběd hotový. Svíčková z pomalého hrnce — maso se rozpadá samo a omáčka je hustá jak má být. Recept v profilu.',
    likes: 193,
    commentsList: [
      { id: 'c1', author: 'Páťa', avatar: '/chefs/pata.png', text: 'Dej recept!!' },
      { id: 'c2', author: 'Stefy', avatar: '/chefs/stefy.png', text: 'Perfektní barva omáčky' },
    ],
  },
  {
    id: '4',
    src: '/reels/4.jpg',
    type: 'image',
    author: { name: 'Stefy', handle: '@stefy_vari', avatar: '/chefs/stefy.png' },
    caption: 'Víkendové pečení — banánový chléb s čokoládou. Jen 4 ingredience a trouba to udělá za vás.',
    likes: 341,
    commentsList: [
      { id: 'c1', author: 'Niki', avatar: '/chefs/niki.png', text: 'Vypadá fantasticky!' },
      { id: 'c2', author: 'Páťa', avatar: '/chefs/pata.png', text: 'Musím zkusit tenhle víkend' },
    ],
  },
]

export default function ReelsFeed() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [commentOpen, setCommentOpen] = useState<string | null>(null)
  const [captionExpanded, setCaptionExpanded] = useState<Record<string, boolean>>({})
  const [commentText, setCommentText] = useState('')
  const [extraComments, setExtraComments] = useState<Record<string, Comment[]>>({})

  const activeReel = REELS.find((r) => r.id === commentOpen)

  function handleSubmitComment() {
    if (!commentText.trim() || !commentOpen) return
    setExtraComments((prev) => ({
      ...prev,
      [commentOpen]: [
        ...(prev[commentOpen] ?? []),
        {
          id: Date.now().toString(),
          author: 'Ty',
          avatar: '/chefs/stefy.png',
          text: commentText.trim(),
        },
      ],
    }))
    setCommentText('')
  }

  return (
    <div className="flex justify-center py-3 px-4">
      {/* Phone-like container */}
      <div
        ref={scrollRef}
        className="mx-auto rounded-2xl overflow-y-scroll snap-y snap-mandatory shadow-2xl bg-black"
        style={{
          height: 'calc(100dvh - 11rem)',
          aspectRatio: '9/16',
          maxWidth: '100%',
          scrollbarWidth: 'none',
        }}
      >
        {REELS.map((reel) => (
          <ReelItem
            key={reel.id}
            reel={reel}
            scrollRoot={scrollRef}
            liked={!!liked[reel.id]}
            captionExpanded={!!captionExpanded[reel.id]}
            onLike={() => setLiked((p) => ({ ...p, [reel.id]: !p[reel.id] }))}
            onComment={() => setCommentOpen(reel.id)}
            onShare={() => alert('Sdílení není implementováno.')}
            onExpandCaption={() =>
              setCaptionExpanded((p) => ({ ...p, [reel.id]: !p[reel.id] }))
            }
          />
        ))}
      </div>

      {/* Comments sheet */}
      {commentOpen && activeReel && (
        <>
          <div
            className="fixed inset-0 z-[80] bg-black/50"
            onClick={() => setCommentOpen(null)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[90] bg-[#1c1c1e] rounded-t-2xl max-h-[70dvh] flex flex-col animate-popup-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white font-bold text-base">Komentáře</span>
              <button
                onClick={() => setCommentOpen(null)}
                className="text-white/50 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-4">
              {[...activeReel.commentsList, ...(extraComments[commentOpen] ?? [])].map((c) => (
                <div key={c.id} className="flex gap-3 items-start">
                  <Image
                    src={c.avatar}
                    alt={c.author}
                    width={32}
                    height={32}
                    className="rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-white/70 text-xs font-bold mb-0.5">{c.author}</p>
                    <p className="text-white text-sm leading-snug">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 px-4 py-3 border-t border-white/10">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                placeholder="Přidat komentář…"
                className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-full px-4 py-2 text-sm outline-none"
              />
              <button
                onClick={handleSubmitComment}
                className="text-[#FEDC56] font-bold text-sm px-3 disabled:opacity-40"
                disabled={!commentText.trim()}
              >
                Odeslat
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Reel item ───────────────────────────────────────────────────────────────

type ReelItemProps = {
  reel: Reel
  scrollRoot: React.RefObject<HTMLDivElement | null>
  liked: boolean
  captionExpanded: boolean
  onLike: () => void
  onComment: () => void
  onShare: () => void
  onExpandCaption: () => void
}

function ReelItem({
  reel,
  scrollRoot,
  liked,
  captionExpanded,
  onLike,
  onComment,
  onShare,
  onExpandCaption,
}: ReelItemProps) {
  const itemRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Muted must be set via DOM ref — React's `muted` prop is broken
  // Also attempt immediate play for the first visible video
  useEffect(() => {
    if (reel.type !== 'video' || !videoRef.current) return
    videoRef.current.muted = true
    videoRef.current.play().catch(() => {})
  }, [reel.type])

  // Pause when scrolled out, resume when scrolled in
  useEffect(() => {
    if (reel.type !== 'video') return
    const video = videoRef.current
    const item = itemRef.current
    if (!video || !item) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        video.muted = true
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { root: scrollRoot.current, threshold: 0.5 },
    )
    observer.observe(item)
    return () => observer.disconnect()
  }, [reel.type, scrollRoot])

  const likeCount = reel.likes + (liked ? 1 : 0)
  const commentCount = reel.commentsList.length
  const captionLong = reel.caption.length > 80

  return (
    <div
      ref={itemRef}
      className="w-full flex-shrink-0 snap-start relative overflow-hidden"
      style={{ height: 'calc(100dvh - 11rem)' }}
    >
      {/* Media */}
      {reel.type === 'video' ? (
        <video
          ref={videoRef}
          src={reel.src}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={reel.src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

      {/* Right action buttons */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        <button onClick={onLike} className="flex flex-col items-center gap-1.5">
          <div
            className={`w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${liked ? 'scale-110' : ''}`}
          >
            <HeartIcon
              filled={liked}
              className={`w-5 h-5 transition-colors ${liked ? 'text-red-500' : 'text-white'}`}
            />
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow-md">{likeCount}</span>
        </button>

        <button onClick={onComment} className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
            <CommentIcon className="w-5 h-5" />
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow-md">{commentCount}</span>
        </button>

        <button onClick={onShare} className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
            <ShareIcon className="w-5 h-5" />
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow-md">Sdílet</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-20 left-3 right-14 z-10">
        <div className="flex items-center gap-2 mb-2">
          <Image
            src={reel.author.avatar}
            alt={reel.author.name}
            width={34}
            height={34}
            className="rounded-full border-2 border-white object-cover shrink-0"
          />
          <div>
            <p className="text-white font-bold text-sm leading-none">{reel.author.name}</p>
            <p className="text-white/65 text-xs mt-0.5">{reel.author.handle}</p>
          </div>
        </div>

        <p className={`text-white text-[13px] leading-snug drop-shadow-md ${captionExpanded ? '' : 'line-clamp-2'}`}>
          {reel.caption}
        </p>
        {captionLong && (
          <button onClick={onExpandCaption} className="text-white/60 text-xs mt-1 font-medium">
            {captionExpanded ? 'Zobrazit méně' : 'Zobrazit více'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  )
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}
