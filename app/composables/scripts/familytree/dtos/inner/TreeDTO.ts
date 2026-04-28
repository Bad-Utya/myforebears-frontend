export default interface TreeDTO {
  id?: string
  tree_id?: string
  creator_id?: number | string
  creator_nickname?: string
  creator_created_at_unix?: number
  created_at_unix?: number
  root_person_id?: string
  name?: string
  title?: string
  node_count?: number
  is_public_on_main_page?: boolean
  is_view_restricted?: boolean
}
