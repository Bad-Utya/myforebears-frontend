import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import ListRandomPublicUsersRequest from "~/composables/scripts/users/dtos/requests/ListRandomPublicUsersRequest";
import ListRandomPublicUsersResponseFactory from "~/composables/scripts/users/factories/ListRandomPublicUsersResponseFactory";

export async function sendListRandomPublicUsersConverted(request: ListRandomPublicUsersRequest) {
  return sendAsyncDefaultFetchRequest(`users/public/random?limit=${request.limit}`, request, new ListRandomPublicUsersResponseFactory(), 'GET');
}

export default async function sendListRandomPublicUsersRequest(limit: number) {
  return sendListRandomPublicUsersConverted(new ListRandomPublicUsersRequest(limit));
}
