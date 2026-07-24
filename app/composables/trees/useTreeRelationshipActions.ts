import { computed } from 'vue'
import type { Ref } from 'vue'
import type RelationshipDTO from '~/services/familytree/dtos/inner/RelationshipDTO'
import {
  isPartnerRelationshipType,
  isParentChildRelationshipType,
  getRelationshipPairKey,
  findPartnerRelationship
} from '~/utils/ui/tree/treeRelationshipHelpers'
import type { TreeVisualNode } from "~/utils/ui/tree/coordinates/computeNodes";

export type NodeAction = {
  id: string
  nodeId: string
  action: 'parent' | 'partner' | 'child'
  label: string
  icon: string
  anchorClass: string
  x: number
  y: number
}

export type PartnerChildAction = {
  id: string
  nodeId: string
  relatedPersonIds: string[]
  x: number
  y: number
}

export function useTreeRelationshipActions(
  nodes: Ref<TreeVisualNode[]>,
  relationships: Ref<RelationshipDTO[]>,
  editable: Ref<boolean>
) {
  const { t } = useI18n() // Добавляем i18n
  const nodeMap = computed(() => new Map(nodes.value.map(node => [node.id, node])))

  function getPartnerId(nodeId: string) {
    const relationship = findPartnerRelationship(relationships.value, nodeId)
    if (!relationship) return undefined
    return relationship.person_id_from === nodeId ? relationship.person_id_to : relationship.person_id_from
  }

  function getAvailableParentRoles(nodeId: string): ('FATHER' | 'MOTHER')[] {
    const parentConnections = relationships.value.filter(rel =>
      isParentChildRelationshipType(rel.type) &&
      rel.person_id_to === nodeId
    )

    const hasFather = parentConnections.some(connection =>
      nodeMap.value.get(connection.person_id_from ?? '')?.person.gender === 'GENDER_MALE'
    )
    const hasMother = parentConnections.some(connection =>
      nodeMap.value.get(connection.person_id_from ?? '')?.person.gender === 'GENDER_FEMALE'
    )

    const roles: ('FATHER' | 'MOTHER')[] = []
    if (!hasFather) roles.push('FATHER')
    if (!hasMother) roles.push('MOTHER')
    return roles
  }

  /**
   * Возвращает локализованную метку роли пользователя
   */
  function getPersonRoleLabel(nodeId: string) {
    const hasChildren = relationships.value.some(rel =>
      isParentChildRelationshipType(rel.type) &&
      rel.person_id_from === nodeId
    )

    if (!hasChildren) return t('tree.roles.member')

    const gender = nodeMap.value.get(nodeId)?.person.gender
    if (gender === 'GENDER_MALE') return t('tree.roles.father')
    if (gender === 'GENDER_FEMALE') return t('tree.roles.mother')
    return t('tree.roles.parent')
  }

  const nodeActions = computed<NodeAction[]>(() => {
    if (!editable.value) return []

    return nodes.value.flatMap(node => {
      const actions: NodeAction[] = []
      const availableParentRoles = getAvailableParentRoles(node.id)
      const hasPartner = Boolean(getPartnerId(node.id))

      // Экшен добавления родителя
      if (availableParentRoles.length > 0) {
        actions.push({
          id: `${node.id}-parent`,
          nodeId: node.id,
          action: 'parent',
          label: t('tree.actions.parent'),
          icon: 'i-lucide-arrow-up-to-line',
          anchorClass: 'tree-canvas__node-action-anchor--bottom-left',
          x: node.x,
          y: node.y
        })
      }

      // Экшен добавления партнера
      actions.push({
        id: `${node.id}-partner`,
        nodeId: node.id,
        action: 'partner',
        label: t('tree.actions.partner'),
        icon: 'i-lucide-heart-plus',
        anchorClass: 'tree-canvas__node-action-anchor--bottom-right',
        x: node.x + node.width,
        y: node.y
      })

      // Экшен добавления ребенка (только если нет партнера,
      // иначе ребенок добавляется через partnerChildActions между узлами)
      if (!hasPartner) {
        actions.push({
          id: `${node.id}-child`,
          nodeId: node.id,
          action: 'child',
          label: t('tree.actions.child'),
          icon: 'i-lucide-baby',
          anchorClass: 'tree-canvas__node-action-anchor--top-left',
          x: node.x,
          y: node.y + node.height
        })
      }

      return actions
    })
  })

  const partnerChildActions = computed<PartnerChildAction[]>(() => {
    if (!editable.value) return []

    const seenPairs = new Set<string>()

    return relationships.value.flatMap(rel => {
      if (!isPartnerRelationshipType(rel.type)) return []

      const fromId = rel.person_id_from
      const toId = rel.person_id_to
      if (!fromId || !toId) return []

      const fromNode = nodeMap.value.get(fromId)
      const toNode = nodeMap.value.get(toId)
      if (!fromNode || !toNode) return []

      const pairKey = getRelationshipPairKey(fromNode.id, toNode.id)
      if (seenPairs.has(pairKey)) return []

      seenPairs.add(pairKey)

      const leftNode = fromNode.x <= toNode.x ? fromNode : toNode
      const rightNode = leftNode.id === fromNode.id ? toNode : fromNode

      const startX = leftNode.x + leftNode.width
      const startY = leftNode.y + leftNode.height / 2
      const endX = rightNode.x
      const endY = rightNode.y + rightNode.height / 2

      return [{
        id: `child-action-${pairKey}`,
        nodeId: leftNode.id,
        relatedPersonIds: [leftNode.id, rightNode.id],
        x: (startX + endX) / 2,
        y: (startY + endY) / 2 - 2
      }]
    })
  })

  return {
    nodeMap,
    getPartnerId,
    getAvailableParentRoles,
    getPersonRoleLabel,
    nodeActions,
    partnerChildActions
  }
}
