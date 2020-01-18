import { select, set, filterKeys } from '../utils/object'

export default (rules: object) => (podcast: Partial<Podcast>) => {
  let ctx = [podcast]
  const prioMap = new WeakMap([[ctx[ctx.length - 1], {}]])

  const ctxHandler = {
    episode: {
      open() {
        ctx.push({})
      },
      close() {
        const episode = ctx.pop() as Episode
        if (!('episodes' in podcast)) podcast.episodes = []
        podcast.episodes.push(episode)
      },
    },
  }

  const resolveDirectives = (rule: any) => {
    let directive = Object.keys(rule).find(k => k.startsWith('$'))
    while (directive) {
      switch (directive) {
        case '$ctx':
          rule = {
            ...ctxHandler[rule.$ctx],
            ...filterKeys(rule, k => k !== '$ctx'),
          }
          break
        default:
          throw Error(`unknown directive ${directive}`)
      }
      directive = Object.keys(rule).find(k => k.startsWith('$'))
    }
    return rule
  }

  const assign = (path: string, value: any, priority: Priority = 0) => {
    if (priority === 'append') {
      return set(
        ctx[ctx.length - 1],
        [...(select(ctx[ctx.length - 1], ...path.split('.')) || []), value],
        ...path.split('.')
      )
    }

    const prio = prioMap.get(ctx[ctx.length - 1]) || {}
    if ((prio[path] ?? -1) >= priority) return
    set(ctx[ctx.length - 1], value, ...path.split('.'))
    prioMap.set(ctx[ctx.length - 1], {
      ...prio,
      [path]: priority,
    })
  }

  const buildRule = (
    rule: (text: any) => [string, any] | [string, any, number]
  ) => (data: any) => {
    const res = rule(data)
    if (!Array.isArray(res)) return
    const [path, value, priority = 0] = res
    assign(path, value, data.isdefault === 'true' ? Infinity : priority)
  }

  const transform = (rule: object) =>
    Object.fromEntries(
      Object.entries(rule).map(([key, value]) => {
        if (key === 'text' || key === 'open') {
          value = buildRule(value)
        } else if (typeof value !== 'function')
          value = transform(resolveDirectives(value))
        return [key.toLowerCase(), value]
      })
    )
  return transform(rules)
}
