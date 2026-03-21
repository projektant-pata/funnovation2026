'use client'

type Props = {
  isLoggedIn: boolean
  children: React.ReactNode
}

export default function LoginGate({ isLoggedIn, children }: Props) {
  return (
    <>
      {children}
      {!isLoggedIn && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4 pointer-events-auto">
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="text-white font-bold text-xl text-center drop-shadow-lg">
            Pouze pro přihlášené
          </p>
        </div>
      )}
    </>
  )
}
