import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import ListRandomPublicUsersRequest from "~/services/users/dtos/requests/ListRandomPublicUsersRequest";
import ListRandomPublicUsersResponseFactory from "~/services/users/factories/ListRandomPublicUsersResponseFactory";

//TODO: get requests logic needs to be updated
export async function sendListRandomPublicUsersConverted(request: ListRandomPublicUsersRequest) {
  return sendAsyncDefaultFetchRequest(`users/public/random?limit=${request.limit}`, request, new ListRandomPublicUsersResponseFactory(), 'GET');
}

export default async function sendListRandomPublicUsersRequest(limit: number) {
  return sendListRandomPublicUsersConverted(new ListRandomPublicUsersRequest(limit));
}
