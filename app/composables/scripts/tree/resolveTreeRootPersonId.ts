import type TreeDTO from '~/composables/scripts/familytree/dtos/inner/TreeDTO'
import type PersonDTO from '~/composables/scripts/familytree/dtos/inner/PersonDTO'

export function getTreePersonId(person: PersonDTO) {
  return person.id ?? person.person_id ?? ''
}

export default function resolveTreeRootPersonId(tree: TreeDTO | undefined, persons: PersonDTO[]) {
  const rootPersonId = tree?.root_person_id

  if (rootPersonId) {
    return rootPersonId
  }

  return persons
    .map(getTreePersonId)
    .find(Boolean)
}
