import type TagDTO from '~/services/tags/dtos/inner/TagDTO'
import type PublicPersonEventDTO from '~/services/publicPersons/dtos/inner/PublicPersonEventDTO'

export default interface PublicPersonDTO {
  id?: string
  avatar_photo_id?: string
  biography?: string
  created_at_unix?: number
  updated_at_unix?: number
  first_name?: string
  last_name?: string
  patronymic?: string
  gender?: string
  owner_user_id?: number
  similarity_score?: number
  events?: PublicPersonEventDTO[]
  tags?: TagDTO[]
}
