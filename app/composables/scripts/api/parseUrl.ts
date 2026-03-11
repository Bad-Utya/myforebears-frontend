export default function getApiUrl(path: string): string {
  const config = useAppConfig();
  return `${config.api.url}/${path}`
}
