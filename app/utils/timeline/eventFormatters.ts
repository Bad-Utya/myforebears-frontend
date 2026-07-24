import type EventDTO from '~/services/events/dtos/inner/EventDTO'

export function normalizeEventDatePrecision(value?: string) {
  if (value === 'MONTH' || value === 'EVENT_DATE_PRECISION_MONTH') return 'MONTH'
  if (value === 'YEAR' || value === 'EVENT_DATE_PRECISION_YEAR') return 'YEAR'
  return 'DAY'
}

export function normalizeEventDateBound(value?: string) {
  if (value === 'NOT_BEFORE' || value === 'EVENT_DATE_BOUND_NOT_BEFORE') return 'NOT_BEFORE'
  if (value === 'NOT_AFTER' || value === 'EVENT_DATE_BOUND_NOT_AFTER') return 'NOT_AFTER'
  return 'EXACT'
}

export function isApproximateEvent(event: EventDTO) {
  return Boolean(
    event.date_unknown ||
    normalizeEventDatePrecision(event.date_precision) !== 'DAY' ||
    normalizeEventDateBound(event.date_bound) !== 'EXACT'
  )
}

export function formatTimelineDate(event: EventDTO) {
  if (event.date_unknown) return 'Date unknown'
  const parts = [event.date_iso || 'Undated']
  const precision = normalizeEventDatePrecision(event.date_precision)
  const bound = normalizeEventDateBound(event.date_bound)
  if (precision === 'YEAR') parts.push('year precision')
  else if (precision === 'MONTH') parts.push('month precision')
  if (bound === 'NOT_BEFORE') parts.push('not before')
  else if (bound === 'NOT_AFTER') parts.push('not after')
  return parts.join(' • ')
}
