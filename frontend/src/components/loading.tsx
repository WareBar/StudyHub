import React from "react";
import { BookOpen } from "lucide-react";

// ── Base wrapper ────────────────────────────────────────────────────────────
const Spinner = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center w-full h-full py-16 gap-4">
    {children}
  </div>
);

// ── LoadingOne: Staggered orange dots ───────────────────────────────────────
export const LoadingOne = ({ label = "Loading…" }: { label?: string }) => (
  <Spinner>
    <div className="flex items-center gap-2">
      {[0, 0.15, 0.3].map((delay, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-orange-500"
          style={{
            animation: "studyhub-bounce 1.2s ease-in-out infinite",
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
    {label && <p className="text-sm text-gray-400">{label}</p>}
  </Spinner>
);

// ── LoadingTwo: Branded ring spinner ────────────────────────────────────────
export const LoadingTwo = ({ label = "Loading…" }: { label?: string }) => (
  <Spinner>
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
      <div className="absolute inset-2 rounded-full bg-orange-50 flex items-center justify-center">
        <BookOpen className="h-3.5 w-3.5 text-orange-400" />
      </div>
    </div>
    {label && <p className="text-sm text-gray-400">{label}</p>}
  </Spinner>
);

// ── LoadingThree: Equalizer bars ────────────────────────────────────────────
export const LoadingThree = ({ label = "Loading…" }: { label?: string }) => (
  <Spinner>
    <div style={{ perspective: "300px" }}>
      <div className="relative w-[60px] h-[48px]">
        {/* Spine */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-1 h-full bg-orange-700 rounded-sm z-10" />

        {/* Static left page */}
        <div className="absolute top-[2px] left-1/2 h-[calc(100%-4px)] w-1/2 bg-orange-50 border border-orange-200 rounded-r-sm origin-left" />

        {/* Static right page */}
        <div className="absolute top-[2px] right-1/2 h-[calc(100%-4px)] w-1/2 bg-orange-50 border border-orange-200 rounded-l-sm origin-right" />

        {/* Flipping pages */}
        {[0, 0.6].map((delay, i) => (
          <div
            key={i}
            className="absolute top-[2px] left-1/2 h-[calc(100%-4px)] w-1/2 rounded-r-sm origin-left"
            style={{
              background: i === 0 ? "#FECBA1" : "#FED7AA",
              animation: "studyhub-flip 1.2s ease-in-out infinite",
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>
    </div>
    {label && <p className="text-sm text-gray-400">{label}</p>}

    <style>{`
      @keyframes studyhub-flip {
        0%   { transform: rotateY(0deg); }
        50%  { transform: rotateY(-180deg); }
        100% { transform: rotateY(-180deg); }
      }
    `}</style>
  </Spinner>
);
// ── LoadingFour: Pulsing card skeleton ──────────────────────────────────────
export const LoadingFour = ({ label = "Loading…" }: { label?: string }) => (
  <Spinner>
    <div className="w-56 space-y-3">
      {/* card mock */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-2 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 bg-gray-100 rounded animate-pulse" />
          <div className="h-2 bg-gray-100 rounded animate-pulse w-5/6" />
        </div>
        <div className="h-7 bg-orange-50 rounded-xl animate-pulse" />
      </div>
    </div>
    {label && <p className="text-sm text-gray-400">{label}</p>}
  </Spinner>
);

// ── LoadingFive: Orbiting dots around logo ──────────────────────────────────
export const LoadingFive = ({ label = "Loading…" }: { label?: string }) => (
  <Spinner>
    <div className="relative w-14 h-14">
      {/* center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
          <BookOpen className="h-4 w-4 text-white" />
        </div>
      </div>
      {/* orbiting dots */}
      {[0, 90, 180, 270].map((deg, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{ transform: `rotate(${deg}deg)`, animation: `studyhub-orbit 1.6s linear infinite`, animationDelay: `${i * 0.4}s` }}
        >
          <div className="w-2 h-2 bg-orange-300 rounded-full absolute -top-0.5 left-1/2 -translate-x-1/2" />
        </div>
      ))}
    </div>
    {label && <p className="text-sm text-gray-400">{label}</p>}
  </Spinner>
);

// ── Keyframes injected once ─────────────────────────────────────────────────
const styles = `
  @keyframes studyhub-bounce {
    0%, 100% { transform: translateY(0); opacity: 0.5; }
    50% { transform: translateY(-8px); opacity: 1; }
  }
  @keyframes studyhub-bar {
    from { transform: scaleY(0.4); opacity: 0.5; }
    to   { transform: scaleY(1);   opacity: 1;   }
  }
  @keyframes studyhub-orbit {
    from { transform: rotate(var(--start-deg, 0deg)); }
    to   { transform: rotate(calc(var(--start-deg, 0deg) + 360deg)); }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("studyhub-loading-styles")) {
  const tag = document.createElement("style");
  tag.id = "studyhub-loading-styles";
  tag.textContent = styles;
  document.head.appendChild(tag);
}

// ── Default export ──────────────────────────────────────────────────────────
const Loading = { LoadingOne, LoadingTwo, LoadingThree, LoadingFour, LoadingFive };
export default Loading;