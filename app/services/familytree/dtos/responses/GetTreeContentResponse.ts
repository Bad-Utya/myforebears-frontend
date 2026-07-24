import type PersonDTO from "~/services/familytree/dtos/inner/PersonDTO";
import type RelationshipDTO from "~/services/familytree/dtos/inner/RelationshipDTO";

export type GetTreeContentResponse = {
  persons?: PersonDTO[];
  relationships?: RelationshipDTO[];
};
