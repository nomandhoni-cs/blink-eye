// Geometry for the screen-sized timers, shared with the onboarding previews.

/** Dial tick opacity for time still to go vs. time already spent. */
export const DIAL_OPACITY = { remaining: 0.92, elapsed: 0.2 };

/** Ruler mark opacity beside the vertical bar. */
export const BAR_OPACITY = { major: 0.9, minor: 0.5, elapsed: 0.18 };

type Tick = { x1: number; y1: number; x2: number; y2: number };

/**
 * Lays ticks evenly along a rounded rectangle inset from the screen edge,
 * starting at 12 o'clock and running clockwise. Each tick points at the
 * screen center, like a watch dial stretched to the display.
 */
export function layoutDial(width: number, height: number) {
  const vmin = Math.min(width, height);
  const inset = vmin * 0.032;
  const strokeWidth = Math.max(2.5, vmin * 0.0048);
  // Round caps add half a stroke at each end; keep the visible length steady.
  const length = vmin * 0.023 - strokeWidth;
  const spacing = vmin * 0.03;

  const x0 = inset;
  const y0 = inset;
  const x1 = width - inset;
  const y1 = height - inset;
  const w = x1 - x0;
  const h = y1 - y0;
  const r = Math.min(vmin * 0.075, w / 2, h / 2);
  const cx = width / 2;
  const cy = height / 2;
  const quarterArc = (Math.PI * r) / 2;

  // Clockwise from top center; arcs are [center, start angle].
  const segments: (
    | { kind: "line"; len: number; from: [number, number]; dir: [number, number] }
    | { kind: "arc"; len: number; center: [number, number]; start: number }
  )[] = [
    { kind: "line", len: w / 2 - r, from: [cx, y0], dir: [1, 0] },
    { kind: "arc", len: quarterArc, center: [x1 - r, y0 + r], start: -Math.PI / 2 },
    { kind: "line", len: h - 2 * r, from: [x1, y0 + r], dir: [0, 1] },
    { kind: "arc", len: quarterArc, center: [x1 - r, y1 - r], start: 0 },
    { kind: "line", len: w - 2 * r, from: [x1 - r, y1], dir: [-1, 0] },
    { kind: "arc", len: quarterArc, center: [x0 + r, y1 - r], start: Math.PI / 2 },
    { kind: "line", len: h - 2 * r, from: [x0, y1 - r], dir: [0, -1] },
    { kind: "arc", len: quarterArc, center: [x0 + r, y0 + r], start: Math.PI },
    { kind: "line", len: w / 2 - r, from: [x0 + r, y0], dir: [1, 0] },
  ];
  const perimeter = segments.reduce((sum, seg) => sum + seg.len, 0);

  const pointAt = (distance: number): [number, number] => {
    let s = distance;
    for (const seg of segments) {
      if (s <= seg.len || seg === segments[segments.length - 1]) {
        if (seg.kind === "line") {
          return [seg.from[0] + seg.dir[0] * s, seg.from[1] + seg.dir[1] * s];
        }
        const angle = seg.start + s / r;
        return [seg.center[0] + r * Math.cos(angle), seg.center[1] + r * Math.sin(angle)];
      }
      s -= seg.len;
    }
    return [cx, y0];
  };

  // A multiple of four puts ticks exactly at 12, 3, 6 and 9 o'clock.
  const count = Math.max(8, Math.round(perimeter / spacing / 4) * 4);
  const ticks: Tick[] = [];
  for (let i = 0; i < count; i++) {
    const [x, y] = pointAt((i * perimeter) / count);
    const dx = cx - x;
    const dy = cy - y;
    const d = Math.hypot(dx, dy) || 1;
    ticks.push({ x1: x, y1: y, x2: x + (dx / d) * length, y2: y + (dy / d) * length });
  }

  return { ticks, strokeWidth };
}

/** Every fifth ruler tick is a long one, like minute marks on a watch. */
const MAJOR_EVERY = 5;

export function layoutBar(height: number, vmin: number) {
  const inset = vmin * 0.045;
  const barWidth = Math.max(8, vmin * 0.011);
  const gap = barWidth * 1.6;
  const majorLength = vmin * 0.022;
  const minorLength = vmin * 0.011;
  const trackHeight = Math.max(0, height - inset * 2);
  const count =
    Math.max(1, Math.round(trackHeight / (vmin * 0.022) / MAJOR_EVERY)) *
    MAJOR_EVERY;
  const width = barWidth + (gap + majorLength) * 2;
  const mid = width / 2;

  const ticks = Array.from({ length: count + 1 }, (_, i) => {
    const major = i % MAJOR_EVERY === 0;
    const len = major ? majorLength : minorLength;
    const from = barWidth / 2 + gap;
    return {
      y: (i * trackHeight) / count,
      major,
      left: [mid - from, mid - from - len] as const,
      right: [mid + from, mid + from + len] as const,
    };
  });

  return { barWidth, trackHeight, width, ticks };
}
