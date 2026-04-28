export default interface PhotoDTO {
  id?: string;
  photo_id?: string;
  owner_user_id?: number;
  tree_id?: string;
  event_id?: string;
  person_id?: string;
  is_user_avatar?: boolean;
  is_person_avatar?: boolean;
  file_name?: string;
  mime_type?: string;
  size_bytes?: number;
  created_at_unix?: number;
  url?: string;
}
