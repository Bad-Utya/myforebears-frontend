import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class UpdatePreferencesRequest implements IApiRequest {
  theme?: string;
  language?: string;

  constructor(language?: string, theme?: string) {
    this.language = language;
    this.theme = theme;
  }

  toPayload() {
      return {language: this.language, theme: this.theme}
    }
}
