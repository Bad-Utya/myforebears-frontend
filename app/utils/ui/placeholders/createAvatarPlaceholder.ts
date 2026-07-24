export type AvatarPlaceholder = {
  label: string
  style: {
    backgroundColor: string
    color: string
  }
}

function hashSeed(seed: string) {
  let hash = 0

  for (const character of seed) {
    hash = ((hash << 5) - hash) + character.charCodeAt(0)
    hash |= 0
  }

  return Math.abs(hash)
}

function getInitials(seed?: string | null) {
  const normalizedSeed = seed?.trim() ?? ''

  if (!normalizedSeed) {
    return '??'
  }

  return normalizedSeed.slice(0, 2).toUpperCase()
}

function parseNumericSeed(seed?: string | number | null) {
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    return Math.abs(Math.trunc(seed))
  }

  if (typeof seed !== 'string') {
    return null
  }

  const trimmedSeed = seed.trim()

  if (!/^\d+$/.test(trimmedSeed)) {
    return null
  }

  return Number.parseInt(trimmedSeed, 10)
}

function createPaletteFromId(seed: string) {
  const numericSeed = parseNumericSeed(seed)

  if (numericSeed == null) {
    const fallbackHash = hashSeed(seed)

    return {
      hue: fallbackHash % 360,
      saturation: 60,
      lightness: 44
    }
  }

  const hue = (53 * numericSeed * numericSeed + 97 * numericSeed + 193) % 360
  const saturation = 56 + ((19 * numericSeed * numericSeed + 17 * numericSeed + 11) % 18)
  const lightness = 38 + ((11 * numericSeed * numericSeed + 29 * numericSeed + 7) % 16)

  return {
    hue,
    saturation,
    lightness
  }
}

export default function createAvatarPlaceholder(label?: string | null, seed?: number | string | null): AvatarPlaceholder {
  const normalizedLabel = label?.trim()
  const normalizedSeed = String(seed ?? normalizedLabel ?? 'user').trim() || 'user'
  const palette = createPaletteFromId(normalizedSeed)

  return {
    label: getInitials(normalizedLabel),
    style: {
      backgroundColor: `hsl(${palette.hue} ${palette.saturation}% ${palette.lightness}%)`,
      color: '#ffffff'
    }
  }
}
