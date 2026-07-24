export default interface PublicPersonEventDTO {
  id?: string
  public_person_id?: string
  event_type_id?: string
  event_type_name?: string
  date_iso?: string
  date_bound?: string
  date_precision?: string
  date_unknown?: boolean
  source_event_id?: string
}
