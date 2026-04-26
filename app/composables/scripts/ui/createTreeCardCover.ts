export type TreeCardCover = {
  style: {
    background: string;
  };
};

function hashSeed(seed: string) {
  let hash = 0;

  for (const character of seed) {
    hash = ((hash << 5) - hash) + character.charCodeAt(0);
    hash |= 0;
  }

  return Math.abs(hash);
}

export default function createTreeCardCover(seed?: string | null): TreeCardCover {
  const normalizedSeed = String(seed ?? 'Tree').trim() || 'Tree';
  const hash = hashSeed(normalizedSeed);
  const hue = hash % 360;
  const secondaryHue = (hue + 42) % 360;
  const accentHue = (hue + 110) % 360;

  return {
    style: {
      background: `
        radial-gradient(circle at 20% 20%, hsl(${accentHue} 78% 70% / 0.35), transparent 28%),
        radial-gradient(circle at 82% 14%, hsl(${secondaryHue} 74% 68% / 0.3), transparent 24%),
        linear-gradient(155deg, hsl(${hue} 46% 34%), hsl(${secondaryHue} 44% 22%) 55%, hsl(${accentHue} 38% 16%))
      `.replace(/\s+/g, ' ').trim(),
    }
  };
}
