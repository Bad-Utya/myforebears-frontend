import type PersonDTO from "~/services/familytree/dtos/inner/PersonDTO";
import type TreeDTO from "~/services/familytree/dtos/inner/TreeDTO";

export type CreateTreeResponse = {
  tree?: TreeDTO;
  root_person?: PersonDTO;
};
