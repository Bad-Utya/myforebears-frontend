import type UserInfoDTO from "~/services/users/dtos/inner/UserInfoDTO";

export type SearchUsersResponse = {
  users?: UserInfoDTO[];
};
