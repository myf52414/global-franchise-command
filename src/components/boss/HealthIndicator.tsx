import { Tip } from "./Tooltip";

export type HealthBand = { key: "healthy" | "watch" | "at-risk"; label: string; color: string };

export function healthBand(score: number): HealthBand {
  if (score >= 80) return { key: "healthy", label: "Healthy", color: "var(--color-success)" };
  if (score >= 60) return { key: "watch", label: "Needs attention", color: "var(--color-warning)" };
  return { key: "at-risk", label: "At risk", color: "var(--destructive)" };
}

/**
 * Accessible health score indicator: colour is never the only signal — a
 * shape-coded dot, a numeric score, a text band and a tooltip all describe it.
 */
export function HealthIndicator({
  score,
  showLabel = false,
  size = "sm",
}: {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}) {
  const band = healthBand(score);
  const dot = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";
  return (
    <Tip label={`Health score ${score}/100 — ${band.label}`}>
      <span
        className="inline-flex items-center gap-1.5 tabular-nums"
        role="img"
        aria-label={`Health score ${score} out of 100, ${band.label}`}
        tabIndex={0}
      >
        <span
          className={`${dot} shrink-0 rounded-full ring-2`}
          style={{
            background: `color-mix(in oklab, ${band.color} 85%, transparent)`,
            // @ts-expect-error CSS custom property passthrough
            "--tw-ring-color": `color-mix(in oklab, ${band.color} 25%, transparent)`,
          }}
          aria-hidden="true"
        />
        <span className={size === "md" ? "text-[13px] font-medium text-foreground" : "text-foreground"}>{score}</span>
        {showLabel && <span className="text-[11.5px] text-muted-foreground">{band.label}</span>}
      </span>
    </Tip>
  );
}

/** Horizontal health bar for detail panels. */
export function HealthBar({ score }: { score: number }) {
  const band = healthBand(score);
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="uppercase tracking-wider text-muted-foreground">Health score</span>
        <span className="font-medium text-foreground tabular-nums">
          {score}/100 · {band.label}
        </span>
      </div>
      <div
        className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-2"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-label={`Health score ${score} out of 100, ${band.label}`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.max(2, Math.min(100, score))}%`, background: band.color }}
        />
      </div>
    </div>
  );
}
