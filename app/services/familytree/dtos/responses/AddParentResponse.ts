import type PersonDTO from "~/services/familytree/dtos/inner/PersonDTO";

export type AddParentResponse = {
  parent?: PersonDTO;
  auto_created_second_parent?: PersonDTO;
};
