import { set, filterKeys } from '../utils/object'

const rules = {
  channel: {
    title: 'title',
    'itunes:author': 'creator',
    item: {
      ctx: 'episode',
      title: 'title',
    },
  },
}

const build = (rules: object) => (podcast: Partial<Podcast>) => {
  let ctx = [podcast]
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

  const transform = (rule: object) =>
    Object.fromEntries(
      Object.entries(rule).map(([k, v]) => [
        k,
        typeof v === 'string'
          ? (text => (k === 'text' ? text : { text }))((text: string) =>
              set(ctx[ctx.length - 1], text, ...v.split('.'))
            )
          : typeof v === 'function'
          ? v
          : 'ctx' in v
          ? transform({
              ...ctxHandler[v.ctx],
              ...filterKeys(v, k => k !== 'ctx'),
            })
          : transform(v),
      ])
    )
  return transform(rules)
}

export default build(rules)
