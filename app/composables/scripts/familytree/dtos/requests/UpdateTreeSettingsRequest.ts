import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class UpdateTreeSettingsRequest implements IApiRequest {
  is_public_on_main_page: boolean;
  is_view_restricted: boolean;

  constructor(isPublicOnMainPage: boolean, isViewRestricted: boolean) {
    this.is_public_on_main_page = isPublicOnMainPage;
    this.is_view_restricted = isViewRestricted;
  }

  toPayload() {
    return {
      is_public_on_main_page: this.is_public_on_main_page,
      is_view_restricted: this.is_view_restricted,
    };
  }
}
