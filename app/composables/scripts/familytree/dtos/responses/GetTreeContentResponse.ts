import type PersonDTO from "~/composables/scripts/familytree/dtos/inner/PersonDTO";
import type RelationshipDTO from "~/composables/scripts/familytree/dtos/inner/RelationshipDTO";

export type GetTreeContentResponse = {
  persons?: PersonDTO[];
  relationships?: RelationshipDTO[];
};
