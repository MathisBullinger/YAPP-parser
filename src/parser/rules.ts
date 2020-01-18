import build from './buildRules'

type Assign = (
  v: any,
  cdata?: boolean
) => [string, any] | [string, any, Priority]
interface ProtoRule {
  [key: string]: ProtoRule | string | Assign
}

interface Options {
  priority?: number | 'append'
}
const text = (
  handler: string | Assign,
  { priority }: Options = {}
): { text: Assign } => ({
  text:
    typeof handler !== 'string'
      ? handler
      : (v: string) => [handler, v, priority ?? 0],
})
const attr = (
  target: string,
  attr: string,
  { priority }: Options = {}
): { open: Assign } => ({
  open: (attrs: any) =>
    attr in attrs ? [target, attrs[attr], priority ?? 0] : null,
})

const recursiveRule = (k: string, v: object, lvl = 5) => {
  if (lvl === 1) return { [k]: v }
  return { [k]: { ...v, ...recursiveRule(k, v, lvl - 1) } }
}

const rules: ProtoRule = {
  channel: {
    title: text('title'),
    'itunes:author': text('creator'),
    link: text('website'),
    language: text('language'),
    'itunes:subtitle': text('description.short'),
    description: text('description.long'),
    'itunes:owner': {
      'itunes:name': text('publisher.name'),
      'itunes:email': text('publisher.email'),
    },
    ...recursiveRule(
      'itunes:category',
      attr('categories', 'text', { priority: 'append' })
    ),
    lastBuildDate: text('lastBuild'),
    'itunes:image': attr('image', 'href'),
    image: {
      url: text('image'),
    },
    item: {
      $ctx: 'episode',
      title: text('title', { priority: 2 }),
      'itunes:title': text('title', { priority: 1 }),
      enclosure: attr('file', 'url'),
      'media:content': attr('file', 'url'),
      pubDate: text('date'),
      description: text('description.short', { priority: 2 }),
      'itunes:summary': text('description.short', { priority: 1 }),
      'itunes:subtitle': text('description.short', { priority: 0 }),
      'content:encoded': text('description.long'),
      'itunes:image': attr('image', 'href'),
      'itunes:season': text('season'),
      'itunes:episode': text('episode'),
      'itunes:episodeType': text('type'),
      'itunes:duration': text('duration'),
    },
  },
}

export default build(rules)
