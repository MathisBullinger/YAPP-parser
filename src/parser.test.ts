import parse from './parser'

test('parse', async () => {
  await parse({ url: 'https://softwareengineeringdaily.com/feed/podcast/' })
})
