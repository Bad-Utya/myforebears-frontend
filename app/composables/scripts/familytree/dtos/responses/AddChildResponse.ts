import type PersonDTO from "~/composables/scripts/familytree/dtos/inner/PersonDTO";

export type AddChildResponse = {
  child?: PersonDTO;
  auto_created_parent?: PersonDTO;
};
