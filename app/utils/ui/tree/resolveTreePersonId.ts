import type TreeDTO from '~/services/familytree/dtos/inner/TreeDTO'
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'

export function getTreePersonId(person: PersonDTO) {
  return person.id ?? person.person_id ?? ''
}

export default function resolveTreeRootPersonId(tree: TreeDTO | undefined, persons: PersonDTO[]) {
  const rootPersonId = tree?.root_person_id

  if (rootPersonId && persons.some(person => getTreePersonId(person) === rootPersonId)) {
    return rootPersonId
  }

  return persons
    .map(getTreePersonId)
    .find(Boolean)
}
