import type CustomEntityDTO from '~/services/customTrees/dtos/inner/CustomEntityDTO'
import type CustomTreeDTO from '~/services/customTrees/dtos/inner/CustomTreeDTO'

export type GetCustomTreeResponse = {
  tree?: CustomTreeDTO
  root_entity?: CustomEntityDTO
}
