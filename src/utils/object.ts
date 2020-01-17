export const select = (obj: Object, ...path: string[]) => {
  if (path.length === 0 || !obj) return obj
  return select(obj[path[0]], ...path.slice(1))
}
