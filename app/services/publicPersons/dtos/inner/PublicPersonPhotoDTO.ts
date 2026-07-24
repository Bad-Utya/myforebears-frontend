export default interface PublicPersonPhotoDTO {
  id?: string
  public_person_id?: string
  file_name?: string
  mime_type?: string
  size_bytes?: number
  created_at_unix?: number
  is_avatar?: boolean
}
