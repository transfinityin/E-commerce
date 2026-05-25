interface Props {
  className?: string;
  strokeWidth?: number;
}

/** Stylized glowing infinity glyph — single continuous gold stroke. */
export function InfinityMark({ className = "size-16", strokeWidth = 1.25 }: Props) {
  return (
    <svg
      viewBox="0 0 100 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="infGold" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--gold)" stopOpacity="0.7" />
          <stop offset="0.5" stopColor="var(--gold-soft)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <path
        d="M25 25 C25 10, 45 10, 50 25 C55 40, 75 40, 75 25 C75 10, 55 10, 50 25 C45 40, 25 40, 25 25 Z"
        stroke="url(#infGold)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
