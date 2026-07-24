import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import SearchUsersResponseFactory from "~/services/users/factories/SearchUsersResponseFactory";
import SearchUsersRequest from "~/services/users/dtos/requests/SearchUsersRequest";

// TODO: fix unsafe shit, use get body
export async function sendSearchPublicUsersRequest(name: string, limit: number = 10) {
  return sendAsyncDefaultFetchRequest(
    `users/search?username=${encodeURIComponent(name)}&limit=${limit}`,
    new SearchUsersRequest(name, limit),
    new SearchUsersResponseFactory(),
    'GET'
  );
}

