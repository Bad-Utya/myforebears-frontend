import { ref, type Ref } from 'vue'

export function useTimelineCanvas(
  viewportRef: Ref<HTMLElement | null>,
  contentWidth: Ref<number>
) {
  const MOBILE_BREAKPOINT = 768
  const MIN_MOBILE_SCALE = 0.4
  const scale = ref(1)
  const translateX = ref(0)
  const isDragging = ref(false)

  const dragStart = { x: 0, tx: 0 }

  const clampTranslate = (val: number, currentScale: number) => {
    if (!viewportRef.value) return val
    const viewportWidth = viewportRef.value.clientWidth
    const scaledWidth = contentWidth.value * currentScale

    if (scaledWidth <= viewportWidth) {
      return viewportWidth < MOBILE_BREAKPOINT ? (viewportWidth - scaledWidth) / 2 : 0
    }

    const min = viewportWidth - scaledWidth
    return Math.min(0, Math.max(min, val))
  }

  const zoomIn = () => {
    const nextScale = Math.min(scale.value + 0.1, 2)
    translateX.value = clampTranslate(translateX.value, nextScale)
    scale.value = nextScale
  }

  const zoomOut = () => {
    const nextScale = Math.max(scale.value - 0.1, 0.4)
    translateX.value = clampTranslate(translateX.value, nextScale)
    scale.value = nextScale
  }

  const shift = (direction: number) => {
    translateX.value = clampTranslate(translateX.value + (direction * 300), scale.value)
  }

  const fitTimeline = (yearsCount: number) => {
    contentWidth.value = Math.max(1600, yearsCount * 120)

    if (!viewportRef.value) {
      scale.value = 1
      translateX.value = 0
      return
    }

    const viewportWidth = viewportRef.value.clientWidth
    const isMobileViewport = viewportWidth < MOBILE_BREAKPOINT

    if (isMobileViewport) {
      const fittedScale = Math.min(1, Math.max(MIN_MOBILE_SCALE, viewportWidth / contentWidth.value))
      scale.value = fittedScale
    } else {
      scale.value = 1
    }

    translateX.value = clampTranslate(0, scale.value)
  }

  const startDragging = (e: PointerEvent) => {
    if (e.button !== 0) return
    isDragging.value = true
    dragStart.x = e.clientX
    dragStart.tx = translateX.value

    const onMove = (moveEvent: PointerEvent) => {
      if (!isDragging.value) return
      const delta = moveEvent.clientX - dragStart.x
      translateX.value = clampTranslate(dragStart.tx + delta, scale.value)
    }

    const onUp = () => {
      isDragging.value = false
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return {
    scale,
    translateX,
    isDragging,
    zoomIn,
    zoomOut,
    shift,
    fitTimeline,
    startDragging
  }
}
