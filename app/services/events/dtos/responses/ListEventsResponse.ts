import type EventDTO from "~/services/events/dtos/inner/EventDTO";

export type ListEventsResponse = {
  events?: EventDTO[];
};
