export default interface EventDTO {
  id?: string;
  event_id?: string;
  tree_id?: string;
  event_type_id?: string;
  date_iso?: string;
  date_precision?: string;
  date_unknown?: boolean;
  date_bound?: string;
  primary_person_ids?: string[];
  additional_person_ids?: string[];
}
