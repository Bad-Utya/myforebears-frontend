import type CustomCoordinateEdgeDTO from '~/services/customTrees/dtos/inner/CustomCoordinateEdgeDTO'
import type CustomCoordinateNodeDTO from '~/services/customTrees/dtos/inner/CustomCoordinateNodeDTO'

export type GetCustomTreeCoordinatesResponse = {
  width?: number
  height?: number
  nodes?: CustomCoordinateNodeDTO[]
  edges?: CustomCoordinateEdgeDTO[]
}
