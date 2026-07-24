export default interface IResponseFactory<TReturnDto, TFetchResponse> {
  getNoConnectionErrorDTO(): TReturnDto;
  createDTO(fetchResponse: TFetchResponse): TReturnDto;
}
