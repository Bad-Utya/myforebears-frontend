import type PublicPersonDTO from '~/services/publicPersons/dtos/inner/PublicPersonDTO'
import {
  getPublicPersonBiographyExcerpt,
  getPublicPersonBirthYear,
  getPublicPersonFullName,
  getPublicPersonTagsText
} from '~/utils/ui/publicPersons/publicPersonHelpers'

export type PublicPersonCardItem = {
  id: string
  person: PublicPersonDTO
  fullName: string
  birthYear?: string
  gender?: string
  biography?: string
  tagsText?: string
  avatarUrl: string | null
}

export function getPublicPersonCardId(person: PublicPersonDTO, index: number) {
  return String(person.id ?? index + 1)
}

export default function mapPublicPersonToCardItem(person: PublicPersonDTO, index: number): PublicPersonCardItem {
  return {
    id: getPublicPersonCardId(person, index),
    person,
    fullName: getPublicPersonFullName(person),
    birthYear: getPublicPersonBirthYear(person),
    gender: person.gender,
    biography: getPublicPersonBiographyExcerpt(person),
    tagsText: getPublicPersonTagsText(person),
    avatarUrl: null
  }
}
