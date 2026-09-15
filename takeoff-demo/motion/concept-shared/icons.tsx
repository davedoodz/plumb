import React from "react";

// Minimal lucide-style line icons, composed locally to match the case
// study's existing icon system (stroke 2, round caps, 24x24 viewbox).
const base = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function HomeIcon(props: { size?: number; style?: React.CSSProperties }) {
  const { size = 24, style } = props;
  return (
    <svg width={size} height={size} style={style} {...base}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5.5h4V20h3.5a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function TradeIcon(props: { size?: number; style?: React.CSSProperties }) {
  const { size = 24, style } = props;
  return (
    <svg width={size} height={size} style={style} {...base}>
      <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4L21 6l-3-3-3.3 3.3Z" />
    </svg>
  );
}

export function SupplierIcon(props: { size?: number; style?: React.CSSProperties }) {
  const { size = 24, style } = props;
  return (
    <svg width={size} height={size} style={style} {...base}>
      <path d="M3 16.5V9l6-3 6 3v7.5" />
      <path d="M9 6v14M15 12l4-2 2 1v6.5a1 1 0 0 1-1 1h-5" />
      <path d="M3 20h18" />
    </svg>
  );
}

export function CheckIcon(props: { size?: number; style?: React.CSSProperties; progress?: number }) {
  const { size = 24, style, progress = 1 } = props;
  const length = 20;
  return (
    <svg width={size} height={size} style={style} {...base}>
      <circle cx="12" cy="12" r="9.4" strokeOpacity={0.35} />
      <path
        d="M7 12.5 10.3 16 17 8.5"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
      />
    </svg>
  );
}

export function PackageIcon(props: { size?: number; style?: React.CSSProperties }) {
  const { size = 24, style } = props;
  return (
    <svg width={size} height={size} style={style} {...base}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}
