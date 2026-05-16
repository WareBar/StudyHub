export const CallConnecting = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 border-2 border-black rounded-md">

      <div className="relative w-24 h-24 flex items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-60" />
        <span className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping opacity-40 delay-300" />
        <div className="relative w-24 h-24 rounded-full bg-primary border-2 border-amber-500 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
            stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.18 1.22 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-medium text-amber-300 animate-pulse">Connecting</p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-amber-800">Joining session room...</p>
    </div>
  )
}