import type UserInfoDTO from "~/services/users/dtos/inner/UserInfoDTO";

export type ListRandomPublicUsersResponse = {
  users?: UserInfoDTO[];
};
