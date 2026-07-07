/**
 * Color utility for generating brand shades from a base color
 * Supports HSL, HEX, OKLCH, and CSS variable colors
 */

// Parse OKLCH color string to components
export function parseOklch(oklch: string): { l: number; c: number; h: number } {
  const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) return { l: 0.5, c: 0.1, h: 0 };
  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
  };
}

// Convert OKLCH to linear sRGB
function oklchToLinear(l: number, c: number, h: number): [number, number, number] {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const gb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return [r, g, gb];
}

// Linear to sRGB gamma
function linearToSrgb(c: number): number {
  if (c >= 0.0031308) {
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  }
  return 12.92 * c;
}

// Clamp value between 0 and 1
function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max);
}

// Convert OKLCH to HEX
export function oklchToHex(l: number, c: number, h: number): string {
  const [rLin, gLin, bLin] = oklchToLinear(l, c, h);
  const r = Math.round(clamp(linearToSrgb(rLin)) * 255);
  const g = Math.round(clamp(linearToSrgb(gLin)) * 255);
  const b = Math.round(clamp(linearToSrgb(bLin)) * 255);

  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert OKLCH string to HEX
export function oklchStringToHex(oklch: string): string {
  const { l, c, h } = parseOklch(oklch);
  return oklchToHex(l, c, h);
}

// Convert HEX to HSL
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to HEX
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate brand shades from a base color
 * Creates 10 shades from lightest (index 0) to darkest (index 9)
 */
export function generateBrandShades(baseColor: string, count = 12): string[] {
  const hsl = hexToHsl(baseColor);
  const shades: string[] = [];

  // Dynamically generate shades from light to dark
  const startLightness = 55;
  const endLightness = 14;
  const step = (startLightness - endLightness) / (count - 1);

  for (let i = 0; i < count; i++) {
    const lightness = startLightness - step * i;
    // Slightly increase saturation for mid-tones
    const saturation = hsl.s + (i >= 2 && i <= count - 3 ? 5 : 0);
    shades.push(hslToHex(hsl.h, Math.min(saturation, 100), lightness));
  }

  return shades;
}

/**
 * Get CSS class for a color (for Tailwind)
 */
export function getColorClass(color: string): string {
  return `bg-[${color}]`;
}

/**
 * Default brand color (warm reddish-orange matching the primary)
 */
export const DEFAULT_BRAND_COLOR = "#E85D3A";
