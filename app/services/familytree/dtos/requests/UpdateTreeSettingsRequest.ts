import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class UpdateTreeSettingsRequest implements IApiRequest {
  name?: string;
  description?: string;
  is_public_on_main_page: boolean;
  is_view_restricted: boolean;

  constructor(name: string | undefined, description: string | undefined, isPublicOnMainPage: boolean, isViewRestricted: boolean) {
    this.name = name;
    this.description = description;
    this.is_public_on_main_page = isPublicOnMainPage;
    this.is_view_restricted = isViewRestricted;
  }

  toPayload() {
    return {
      name: this.name,
      description: this.description,
      is_public_on_main_page: this.is_public_on_main_page,
      is_view_restricted: this.is_view_restricted,
    };
  }
}
