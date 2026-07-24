import type IResponseFactory from "~/services/api/interfaces/IResponseFactory";
import DataDTO from "~/services/api/dtos/DataDTO";

export default class DataResponseFactory<TFetchResponse> implements IResponseFactory<DataDTO<TFetchResponse>, TFetchResponse> {
  getNoConnectionErrorDTO(): DataDTO<TFetchResponse> {
    return new DataDTO<TFetchResponse>(false, undefined, 'error.no_connection');
  }

  createDTO(fetchResponse: TFetchResponse): DataDTO<TFetchResponse> {
    return new DataDTO<TFetchResponse>(true, fetchResponse);
  }
}
