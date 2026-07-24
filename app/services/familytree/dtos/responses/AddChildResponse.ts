import type PersonDTO from "~/services/familytree/dtos/inner/PersonDTO";

export type AddChildResponse = {
  child?: PersonDTO;
  auto_created_parent?: PersonDTO;
};
