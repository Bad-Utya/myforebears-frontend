import type PersonDTO from "~/services/familytree/dtos/inner/PersonDTO";

export type ListPersonsResponse = {
  persons?: PersonDTO[];
};
