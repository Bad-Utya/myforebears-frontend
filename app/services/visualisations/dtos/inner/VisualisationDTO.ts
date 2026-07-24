export interface VisualisationDTO {
  id: string
  tree_id: string
  root_person_id: string
  owner_user_id: number
  file_name: string
  mime_type: string
  size_bytes: number
  status: 'VISUALISATION_STATUS_READY' | 'VISUALISATION_STATUS_PENDING' | 'VISUALISATION_STATUS_ERROR'
  type: 'VISUALISATION_TYPE_FULL' | string
  included_person_ids: string[]
  created_at_unix: number
  updated_at_unix: number
  completed_at_unix: number
  error_message: string
}
