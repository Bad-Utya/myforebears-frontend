import type TagDTO from '~/services/tags/dtos/inner/TagDTO'

export default interface CustomTreeDTO {
  id?: string
  creator_id?: number
  created_at_unix?: number
  name?: string
  description?: string
  relation_up?: string
  relation_down?: string
  root_entity_id?: string
  is_public_on_main_page?: boolean
  is_view_restricted?: boolean
  similarity_score?: number
  tags?: TagDTO[]
}
