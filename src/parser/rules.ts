import build from './buildRules'

interface ProtoRule {
  [key: string]: ProtoRule | string | ((v: any) => [string, any])
}

const rules: ProtoRule = {
  channel: {
    title: {
      text: text => ['title', text],
    },
    'itunes:author': {
      text: 'creator',
    },
    item: {
      $ctx: 'episode',
      title: {
        text: 'title',
      },
      enclosure: {
        open: ({ url }) => ['file', url],
      },
    },
  },
}

export default build(rules)
