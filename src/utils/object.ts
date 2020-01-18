export const select = (obj: Object, ...path: string[]) => {
  if (path.length === 0 || !obj) return obj
  return select(obj[path[0]], ...path.slice(1))
}

export const set = (obj: object, value: any, ...path: string[]) => {
  if (typeof obj !== 'object')
    throw Error(`can't assign field to primitive: ${JSON.stringify(obj)}`)
  if (path.length === 1) return (obj[path[0]] = value)
  if (!(path[0] in obj)) obj[path[0]] = {}
  set(obj[path[0]], value, ...path.slice(1))
}

export const filterKeys = (obj: object, func: (k: string) => boolean) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => func(k)))

export const mapKeys = (obj: object, func: (k: string) => string) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [func(k), v]))
