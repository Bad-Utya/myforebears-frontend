import DataResponseFactory from "~/services/api/factories/DataResponseFactory";
import type {GetTreeResponse} from "~/services/familytree/dtos/responses/GetTreeResponse";
import type {ListTreesResponse} from "~/services/familytree/dtos/responses/ListTreesResponse";

export default class GetTreeResponseFactory extends DataResponseFactory<ListTreesResponse> {}
