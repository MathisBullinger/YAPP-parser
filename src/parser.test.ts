import parse from './parser'

const feed = {
  reply: 'https://feeds.megaphone.fm/replyall',
  hello: 'http://www.hellointernet.fm/podcast?format=rss',
}

test('parse', async () => {
  await parse({
    url: feed.reply,
    debug: true,
  })
})
