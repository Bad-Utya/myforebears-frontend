import type PersonDTO from "~/composables/scripts/familytree/dtos/inner/PersonDTO";

export type AddParentResponse = {
  parent?: PersonDTO;
  auto_created_second_parent?: PersonDTO;
};
