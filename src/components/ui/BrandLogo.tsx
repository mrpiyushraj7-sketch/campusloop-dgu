interface BrandLogoProps {
  light?: boolean;
  compact?: boolean;
}

export function BrandLogo({ light = false, compact = false }: BrandLogoProps) {
  return (
    <div className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          light
            ? 'bg-white/15 text-white ring-1 ring-white/25'
            : 'bg-[#673AB7] text-white shadow-sm shadow-[#673AB7]/25'
        }`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M15.5 7.5A5 5 0 1 0 15.5 16.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle
            cx="15.5"
            cy="12"
            r="3.2"
            stroke="currentColor"
            strokeWidth="2.2"
          />
        </svg>
      </div>
      {!compact && (
        <span
          className={`font-display text-lg font-bold tracking-tight ${
            light ? 'text-white' : 'text-[#252033]'
          }`}
        >
          Campus<span className={light ? 'text-[#E3D5FF]' : 'text-[#673AB7]'}>Loop</span>
        </span>
      )}
    </div>
  );
}
