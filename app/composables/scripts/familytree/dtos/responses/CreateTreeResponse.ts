import type PersonDTO from "~/composables/scripts/familytree/dtos/inner/PersonDTO";
import type TreeDTO from "~/composables/scripts/familytree/dtos/inner/TreeDTO";

export type CreateTreeResponse = {
  tree?: TreeDTO;
  root_person?: PersonDTO;
};
