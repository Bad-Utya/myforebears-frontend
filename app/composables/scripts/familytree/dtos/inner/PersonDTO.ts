export default interface PersonDTO {
  id?: string
  person_id?: string
  tree_id?: string
  first_name?: string
  last_name?: string
  patronymic?: string
  gender?: string
  avatar_photo_id?: string
  birth_event?: {
    date_iso?: string
  }
}
