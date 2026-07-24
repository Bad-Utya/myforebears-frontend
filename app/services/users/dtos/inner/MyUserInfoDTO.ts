import type UserInfoDTO from "~/services/users/dtos/inner/UserInfoDTO";

export default interface MyUserInfoDTO extends UserInfoDTO {
  theme?: string;
  language?: string;
}
