export type TreeCanvasViewportApi = {
  viewportRef: Ref<HTMLElement | null>
  translateX: Ref<number>
  translateY: Ref<number>
  scale: Ref<number>
  sceneStyle: ComputedRef<Record<string, string>>
  gridStyle: ComputedRef<Record<string, string>>
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
const GRID_BASE_SIZE = 32
const GRID_PARALLAX_FACTOR = 0.35

export function useTreeCanvasViewport(width: Ref<number>, height: Ref<number>, nodesLength: Ref<number>) {
  const viewportRef = ref<HTMLElement | null>(null)
  const translateX = ref(0)
  const translateY = ref(0)
  const scale = ref(1)
  const isDragging = ref(false)
  const gridTranslateX = ref(0)
  const gridTranslateY = ref(0)
  const dragStartX = ref(0)
  const dragStartY = ref(0)
  const dragOriginX = ref(0)
  const dragOriginY = ref(0)
  const gridDragOriginX = ref(0)
  const gridDragOriginY = ref(0)
  let resizeObserver: ResizeObserver | undefined

  const sceneStyle = computed(() => ({
    width: `${width.value}px`,
    height: `${height.value}px`,
    transform: `translate3d(${translateX.value}px, ${translateY.value}px, 0) scale(${scale.value})`
  }))

  const gridStyle = computed(() => ({
    backgroundPosition: `${gridTranslateX.value}px ${gridTranslateY.value}px`,
    backgroundSize: `${GRID_BASE_SIZE * scale.value}px ${GRID_BASE_SIZE * scale.value}px`
  }))

  function scaleGridAround(nextScale: number, anchorX: number, anchorY: number) {
    const scaleRatio = nextScale / scale.value

    gridTranslateX.value = anchorX - (anchorX - gridTranslateX.value) * scaleRatio
    gridTranslateY.value = anchorY - (anchorY - gridTranslateY.value) * scaleRatio
  }

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
    const nextScale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, 1, availableWidth / width.value, availableHeight / height.value)
    )

    scaleGridAround(nextScale, viewportWidth / 2, viewportHeight / 2)
    scale.value = nextScale
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

    scaleGridAround(clampedScale, anchorX, anchorY)
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
    gridDragOriginX.value = gridTranslateX.value
    gridDragOriginY.value = gridTranslateY.value
  }

  function handlePointerMove(event: PointerEvent) {
    if (!isDragging.value) {
      return
    }

    const deltaX = event.clientX - dragStartX.value
    const deltaY = event.clientY - dragStartY.value

    translateX.value = dragOriginX.value + deltaX
    translateY.value = dragOriginY.value + deltaY
    gridTranslateX.value = gridDragOriginX.value + deltaX * GRID_PARALLAX_FACTOR
    gridTranslateY.value = gridDragOriginY.value + deltaY * GRID_PARALLAX_FACTOR
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
    gridStyle,
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
