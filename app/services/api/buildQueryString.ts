export type QueryParamValue
  = | string
    | number
    | boolean
    | null
    | undefined
    | Array<string | number | boolean>

export default function buildQueryString(params: Record<string, QueryParamValue>) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue
    }

    if (Array.isArray(value)) {
      if (!value.length) {
        continue
      }

      searchParams.set(key, value.join(','))
      continue
    }

    searchParams.set(key, String(value))
  }

  return searchParams.toString()
}
