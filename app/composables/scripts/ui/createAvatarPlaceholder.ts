export type AvatarPlaceholder = {
  label: string;
  style: {
    backgroundColor: string;
    color: string;
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

function getInitials(seed?: string | null) {
  const normalizedSeed = seed?.trim() ?? '';

  if (!normalizedSeed) {
    return '??';
  }

  return normalizedSeed.slice(0, 2).toUpperCase();
}

export default function createAvatarPlaceholder(label?: string | null, seed?: number | null): AvatarPlaceholder {
  const normalizedLabel = label?.trim();
  const normalizedSeed = String(seed ?? normalizedLabel).trim();
  const hue = hashSeed(normalizedSeed) % 360;

  return {
    label: getInitials(normalizedLabel),
    style: {
      backgroundColor: `hsl(${hue} 58% 46%)`,
      color: '#ffffff',
    }
  };
}
