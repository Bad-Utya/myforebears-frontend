import type CustomEntityDTO from '~/services/customTrees/dtos/inner/CustomEntityDTO'
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import { getTreePersonId } from '~/utils/ui/tree/resolveTreePersonId'

export type EventParticipant = {
  id: string
  name: string
}

export function familyPersonToEventParticipant(person: PersonDTO): EventParticipant | null {
  const id = getTreePersonId(person)

  if (!id) return null

  return {
    id,
    name: [person.first_name, person.last_name].filter(Boolean).join(' ') || 'Unnamed person'
  }
}

export function customEntityToEventParticipant(entity: CustomEntityDTO): EventParticipant | null {
  if (!entity.id) return null

  return {
    id: entity.id,
    name: entity.name?.trim() || 'Unnamed entity'
  }
}
