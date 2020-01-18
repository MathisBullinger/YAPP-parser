import build from './buildRules'

type Assign = (v: any) => [string, any] | [string, any, number]
interface ProtoRule {
  [key: string]: ProtoRule | string | Assign
}

const text = (handler: string | Assign): { text: Assign } => ({
  text: typeof handler !== 'string' ? handler : (v: string) => [handler, v],
})
const attr = (
  target: string,
  attr: string,
  priority?: number
): { open: Assign } => ({
  open: (attrs: any) =>
    attr in attrs ? [target, attrs[attr], priority ?? 0] : null,
})

const rules: ProtoRule = {
  channel: {
    title: text('title'),
    'itunes:author': text('creator'),
    item: {
      $ctx: 'episode',
      title: text('title'),
      enclosure: attr('file', 'url'),
    },
  },
}

export default build(rules)
