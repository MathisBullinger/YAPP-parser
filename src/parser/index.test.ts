import parse from '.'

const feed = {
  reply: 'https://feeds.megaphone.fm/replyall',
  hello: 'http://www.hellointernet.fm/podcast?format=rss',
  se: 'https://softwareengineeringdaily.com/feed/podcast/',
  serial: 'http://feeds.serialpodcast.org/serialpodcast',
  aws: 'https://feeds.transistor.fm/aws-morning-brief',
}

test('parse', async () => {
  await parse({
    url: feed.aws,
    debug: true,
  })
})
