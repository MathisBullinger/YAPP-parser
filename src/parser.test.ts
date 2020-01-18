import parse from './parser'

test('parse', async () => {
  await parse({
    url: 'http://www.hellointernet.fm/podcast?format=rss',
    debug: true,
  })
})
