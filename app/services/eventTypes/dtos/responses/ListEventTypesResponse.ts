import type EventTypeDTO from "~/services/eventTypes/dtos/inner/EventTypeDTO";

export type ListEventTypesResponse = {
  event_types?: EventTypeDTO[];
};
