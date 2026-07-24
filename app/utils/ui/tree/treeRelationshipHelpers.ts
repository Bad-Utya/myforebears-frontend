import type RelationshipDTO from '~/services/familytree/dtos/inner/RelationshipDTO'

export function isPartnerRelationshipType(type?: string) {
  return typeof type === 'string' && type.includes('PARTNER')
}

export function isParentChildRelationshipType(type?: string) {
  return type === 'RELATIONSHIP_PARENT_CHILD'
}

export function getRelationshipPairKey(leftId: string, rightId: string) {
  return [leftId, rightId].sort().join(':')
}

export function findPartnerRelationship(
  relationships: RelationshipDTO[],
  nodeId: string
) {
  return relationships.find((relationship) => {
    return isPartnerRelationshipType(relationship.type)
      && (relationship.person_id_from === nodeId || relationship.person_id_to === nodeId)
  })
}

