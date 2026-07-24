import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class UpdateEventRequest implements IApiRequest {
  tree_id: string;
  event_type_id: string;
  date_iso: string;
  date_precision: string;
  date_unknown: boolean;
  date_bound: string;
  primary_person_ids: string[];
  additional_person_ids: string[];

  constructor(
    treeId: string,
    eventTypeId: string,
    dateIso: string,
    datePrecision: string,
    dateUnknown: boolean,
    dateBound: string,
    primaryPersonIds: string[],
    additionalPersonIds: string[]
  ) {
    this.tree_id = treeId;
    this.event_type_id = eventTypeId;
    this.date_iso = dateIso;
    this.date_precision = datePrecision;
    this.date_unknown = dateUnknown;
    this.date_bound = dateBound;
    this.primary_person_ids = primaryPersonIds;
    this.additional_person_ids = additionalPersonIds;
  }

  toPayload() {
    return {
      tree_id: this.tree_id,
      event_type_id: this.event_type_id,
      date_iso: this.date_iso,
      date_precision: this.date_precision,
      date_unknown: this.date_unknown,
      date_bound: this.date_bound,
      primary_person_ids: this.primary_person_ids,
      additional_person_ids: this.additional_person_ids,
    };
  }
}
