export type TreeCanvasViewportApi = {
  viewportRef: Ref<HTMLElement | null>
  translateX: Ref<number>
  translateY: Ref<number>
  scale: Ref<number>
  sceneStyle: ComputedRef<Record<string, string>>
  isDragging: Ref<boolean>
  fitToView: () => void
  zoomIn: () => void
  zoomOut: () => void
  setScale: (nextScale: number, anchorRatioX?: number, anchorRatioY?: number) => void
  startDragging: (event: PointerEvent) => void
  handlePointerMove: (event: PointerEvent) => void
  stopDragging: () => void
  handleWheel: (event: WheelEvent) => void
}

const MIN_SCALE = 0.3
const MAX_SCALE = 1.6
const SCALE_STEP = 0.1

export function useTreeCanvasViewport(width: Ref<number>, height: Ref<number>, nodesLength: Ref<number>) {
  const viewportRef = ref<HTMLElement | null>(null)
  const translateX = ref(0)
  const translateY = ref(0)
  const scale = ref(1)
  const isDragging = ref(false)
  const dragStartX = ref(0)
  const dragStartY = ref(0)
  const dragOriginX = ref(0)
  const dragOriginY = ref(0)
  let resizeObserver: ResizeObserver | undefined

  const sceneStyle = computed(() => ({
    width: `${width.value}px`,
    height: `${height.value}px`,
    transform: `translate3d(${translateX.value}px, ${translateY.value}px, 0) scale(${scale.value})`
  }))

  function fitToView() {
    const viewport = viewportRef.value

    if (!viewport || nodesLength.value === 0) {
      return
    }

    const viewportWidth = viewport.clientWidth
    const viewportHeight = viewport.clientHeight
    const horizontalPadding = 96
    const verticalPadding = 96
    const availableWidth = Math.max(240, viewportWidth - horizontalPadding * 2)
    const availableHeight = Math.max(240, viewportHeight - verticalPadding * 2)
    const nextScale = Math.min(1, availableWidth / width.value, availableHeight / height.value)

    scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale))
    translateX.value = (viewportWidth - width.value * scale.value) / 2
    translateY.value = (viewportHeight - height.value * scale.value) / 2
  }

  function setScale(nextScale: number, anchorRatioX = 0.5, anchorRatioY = 0.5) {
    const viewport = viewportRef.value

    if (!viewport) {
      return
    }

    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale))
    const anchorX = viewport.clientWidth * anchorRatioX
    const anchorY = viewport.clientHeight * anchorRatioY
    const sceneCenterX = (anchorX - translateX.value) / scale.value
    const sceneCenterY = (anchorY - translateY.value) / scale.value

    translateX.value = anchorX - sceneCenterX * clampedScale
    translateY.value = anchorY - sceneCenterY * clampedScale
    scale.value = clampedScale
  }

  function zoomIn() {
    setScale(scale.value + SCALE_STEP)
  }

  function zoomOut() {
    setScale(scale.value - SCALE_STEP)
  }

  function startDragging(event: PointerEvent) {
    const target = event.target as HTMLElement | null

    if (target?.closest('[data-tree-node="true"]')) {
      return
    }

    isDragging.value = true
    dragStartX.value = event.clientX
    dragStartY.value = event.clientY
    dragOriginX.value = translateX.value
    dragOriginY.value = translateY.value
  }

  function handlePointerMove(event: PointerEvent) {
    if (!isDragging.value) {
      return
    }

    translateX.value = dragOriginX.value + event.clientX - dragStartX.value
    translateY.value = dragOriginY.value + event.clientY - dragStartY.value
  }

  function stopDragging() {
    isDragging.value = false
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault()

    const viewport = viewportRef.value
    const bounds = viewport?.getBoundingClientRect()

    if (!bounds) {
      return
    }

    const anchorRatioX = (event.clientX - bounds.left) / bounds.width
    const anchorRatioY = (event.clientY - bounds.top) / bounds.height
    const direction = event.deltaY > 0 ? -1 : 1

    setScale(
      scale.value + direction * SCALE_STEP,
      Math.max(0, Math.min(1, anchorRatioX)),
      Math.max(0, Math.min(1, anchorRatioY))
    )
  }

  onMounted(() => {
    const viewport = viewportRef.value

    if (!viewport) {
      return
    }

    resizeObserver = new ResizeObserver(() => fitToView())
    resizeObserver.observe(viewport)

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', stopDragging)
    window.removeEventListener('pointercancel', stopDragging)
  })

  watch([width, height, nodesLength], () => {
    nextTick(() => fitToView())
  }, { immediate: true })

  return {
    viewportRef,
    translateX,
    translateY,
    scale,
    sceneStyle,
    isDragging,
    fitToView,
    zoomIn,
    zoomOut,
    setScale,
    startDragging,
    handlePointerMove,
    stopDragging,
    handleWheel
  }
}

