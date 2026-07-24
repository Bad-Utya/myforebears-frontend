import sendGetPublicPersonPhotoRequest from '~/services/publicPersons/getPublicPersonPhoto'
import type PublicPersonDTO from '~/services/publicPersons/dtos/inner/PublicPersonDTO'
import mapPublicPersonToCardItem, { type PublicPersonCardItem } from '~/utils/ui/publicPersons/mapPublicPersonToCardItem'

export async function mapPublicPersonToCardItemWithAvatar(person: PublicPersonDTO, index: number): Promise<PublicPersonCardItem> {
  const item = mapPublicPersonToCardItem(person, index)

  if (!person.id || !person.avatar_photo_id) {
    return item
  }

  try {
    const avatarBlob = await sendGetPublicPersonPhotoRequest(person.id, person.avatar_photo_id)
    item.avatarUrl = URL.createObjectURL(avatarBlob)
  } catch {
    item.avatarUrl = null
  }

  return item
}

export async function loadPublicPersonCardItems(persons: PublicPersonDTO[]): Promise<PublicPersonCardItem[]> {
  return await Promise.all(persons.map((person, index) => mapPublicPersonToCardItemWithAvatar(person, index)))
}

export function revokePublicPersonCardItems(items: PublicPersonCardItem[]) {
  for (const item of items) {
    if (item.avatarUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(item.avatarUrl)
    }
  }
}
