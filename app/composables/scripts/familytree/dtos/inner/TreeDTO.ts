export default interface TreeDTO {
  id?: string
  tree_id?: string
  creator_id?: number | string
  root_person_id?: string
  name?: string
  title?: string
  is_public_on_main_page?: boolean
  is_view_restricted?: boolean
}
