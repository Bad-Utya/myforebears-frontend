import {getAccessToken} from "~/utils/scripts/cookies/getAccessToken";

export default function getAuthorizationHeaders() {
  const accessToken = getAccessToken().value;

  if (!accessToken) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}
