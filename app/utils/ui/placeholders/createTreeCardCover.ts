export type TreeCardCover = {
  style: {
    background: string
  }
}

function hashSeed(seed: string) {
  let hash = 2166136261

  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x7feb352d)
  hash ^= hash >>> 15
  hash = Math.imul(hash, 0x846ca68b)
  hash ^= hash >>> 16

  return hash >>> 0
}

function parseNumericSeed(seed: string) {
  if (!/^\d+$/.test(seed)) {
    return null
  }

  let x = Number.parseInt(seed, 10) >>> 0

  x ^= x >>> 16
  x = Math.imul(x, 0x7feb352d)
  x ^= x >>> 15
  x = Math.imul(x, 0x846ca68b)
  x ^= x >>> 16

  return x >>> 0
}

function createSeedValue(seed: string) {
  const numericSeed = parseNumericSeed(seed)

  if (numericSeed != null) {
    return numericSeed
  }

  return hashSeed(seed)
}

function createPalette(seedValue: number) {
  const baseHue = (47 * seedValue * seedValue + 131 * seedValue + 23) % 360
  const accentHue = (baseHue + 32 + (seedValue % 71)) % 360
  const contrastHue = (baseHue + 150 + (seedValue % 43)) % 360

  return {
    base: `hsl(${baseHue} 52% 28%)`,
    accent: `hsl(${accentHue} 68% 62%)`,
    contrast: `hsl(${contrastHue} 58% 78%)`,
    shadow: `hsl(${baseHue} 36% 18%)`
  }
}

function scalePattern(value: number, scale: number) {
  return Math.trunc(value * scale)
}

function createHorizontalStripes(colors: ReturnType<typeof createPalette>, seedValue: number, scale: number) {
  let stripeSize = 18 + (seedValue % 10)
  stripeSize = scalePattern(stripeSize, scale)

  return `repeating-linear-gradient(0deg, ${colors.base} 0 ${stripeSize}px, ${colors.accent} ${stripeSize}px ${stripeSize * 2}px, ${colors.shadow} ${stripeSize * 2}px ${stripeSize * 3}px)`
}

function createVerticalStripes(colors: ReturnType<typeof createPalette>, seedValue: number, scale: number) {
  let stripeSize = 16 + (seedValue % 12)
  stripeSize = scalePattern(stripeSize, scale)

  return `repeating-linear-gradient(90deg, ${colors.base} 0 ${stripeSize}px, ${colors.contrast} ${stripeSize}px ${stripeSize * 2}px, ${colors.shadow} ${stripeSize * 2}px ${stripeSize * 3}px)`
}

function createDiagonalStripes(colors: ReturnType<typeof createPalette>, seedValue: number, scale: number) {
  let stripeSize = 14 + (seedValue % 8)
  stripeSize = scalePattern(stripeSize, scale)

  return `repeating-linear-gradient(135deg, ${colors.base} 0 ${stripeSize}px, ${colors.accent} ${stripeSize}px ${stripeSize * 2}px, ${colors.contrast} ${stripeSize * 2}px ${stripeSize * 3}px, ${colors.shadow} ${stripeSize * 3}px ${stripeSize * 4}px)`
}

function createDots(colors: ReturnType<typeof createPalette>, seedValue: number, scale: number) {
  let dotSize = 8 + (seedValue % 8)
  let gap = dotSize * 2 + 10 + (seedValue % 6)
  let offset = Math.round(gap / 2)

  dotSize = scalePattern(dotSize, scale)
  gap = scalePattern(gap, scale)
  offset = scalePattern(offset, scale)

  return [
    `radial-gradient(circle, ${colors.accent} 0 ${dotSize / 2}px, transparent ${dotSize / 2 + 1}px) 0 0 / ${gap}px ${gap}px`,
    `radial-gradient(circle, ${colors.contrast} 0 ${Math.max(3, dotSize / 3)}px, transparent ${Math.max(4, dotSize / 3 + 1)}px) ${offset}px ${offset}px / ${gap}px ${gap}px`,
    colors.base
  ].join(', ')
}

function createPatternBackground(seedValue: number, colors: ReturnType<typeof createPalette>, scale: number) {
  switch ((seedValue) % 4) {
    case 0:
      return createHorizontalStripes(colors, seedValue, scale)
    case 1:
      return createVerticalStripes(colors, seedValue, scale)
    case 2:
      return createDiagonalStripes(colors, seedValue, scale)
    default:
      return createDots(colors, seedValue, scale)
  }
}

export default function createTreeCardCover(seed?: string | null, scale?: number | null): TreeCardCover {
  const normalizedSeed = String(seed ?? 'Tree').trim() || 'Tree'
  const seedValue = createSeedValue(normalizedSeed)
  const colors = createPalette(seedValue)
  const background = createPatternBackground(seedValue, colors, scale ?? 1)

  return {
    style: {
      background
    }
  }
}
