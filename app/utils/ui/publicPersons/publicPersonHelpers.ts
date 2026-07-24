import type PublicPersonDTO from '~/services/publicPersons/dtos/inner/PublicPersonDTO'

export type NormalizedPublicPersonGender = 'MALE' | 'FEMALE' | null

export function normalizePublicPersonGender(gender?: unknown): NormalizedPublicPersonGender {
  if (typeof gender !== 'string') {
    return null
  }

  if (gender.includes('MALE')) {
    return 'MALE'
  }

  if (gender.includes('FEMALE')) {
    return 'FEMALE'
  }

  return null
}

export function getPublicPersonFullName(person: PublicPersonDTO) {
  const parts = [
    person.first_name,
    person.patronymic,
    person.last_name
  ].filter(Boolean)

  return parts.length ? parts.join(' ') : 'Unknown person'
}

export function getPublicPersonBirthYear(person: PublicPersonDTO) {
  const birthEvent = Array.isArray(person.events)
    ? person.events.find(event => event.date_iso && event.event_type_name?.toLowerCase().includes('birth'))
    ?? person.events.find(event => event.date_iso)
    : undefined

  return birthEvent?.date_iso?.slice(0, 4)
}

export function getPublicPersonTagsText(person: PublicPersonDTO) {
  const tags = Array.isArray(person.tags)
    ? person.tags
        .map(tag => tag.name?.trim() || tag.code?.trim())
        .filter(Boolean)
    : []

  return tags.length ? tags.join(' • ') : undefined
}

export function getPublicPersonBiographyExcerpt(person: PublicPersonDTO, maxLength: number = 140) {
  const biography = person.biography?.trim()

  if (!biography) {
    return undefined
  }

  if (biography.length <= maxLength) {
    return biography
  }

  return `${biography.slice(0, maxLength).trim()}...`
}

export function getPublicPersonSearchHaystack(person: PublicPersonDTO) {
  return [
    person.first_name,
    person.patronymic,
    person.last_name
  ].filter(Boolean).join(' ').toLowerCase()
}
