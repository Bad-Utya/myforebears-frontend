import type CustomEdgeDTO from '~/services/customTrees/dtos/inner/CustomEdgeDTO'
import type CustomEntityDTO from '~/services/customTrees/dtos/inner/CustomEntityDTO'
import type CustomTreeDTO from '~/services/customTrees/dtos/inner/CustomTreeDTO'

export type GetCustomTreeContentResponse = {
  tree?: CustomTreeDTO
  entities?: CustomEntityDTO[]
  edges?: CustomEdgeDTO[]
}
