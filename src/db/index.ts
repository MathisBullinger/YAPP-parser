import AWS from 'aws-sdk'

try {
  if (!process.env.IS_OFFLINE) {
    AWS.config.update({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.PARSER_AWS_KEY_ID,
        secretAccessKey: process.env.PARSER_AWS_KEY_SECRET,
      },
    })
  }
} catch (err) {
  console.error('error while updating aws config')
  throw err
}

export const client = new AWS.DynamoDB.DocumentClient({
  ...(process.env.IS_OFFLINE && { endpoint: 'http://localhost:8000' }),
})

export async function addPodcast(podcast: Podcast, id: String) {
  if (!id)
    return console.error(`can't add podcast to DB without id (${podcast.feed})`)

  const meta = {
    podId: id,
    SK: 'meta',
    name: podcast.name,
    creator: podcast.creator,
    feed: podcast.feed,
    website: podcast.website,
    last_build: podcast.lastBuild,
    language: podcast.language,
    description_short: podcast.description?.short,
    description_long: podcast.description?.long,
    publisher_name: podcast.publisher?.name,
    publisher_email: podcast.publisher?.email,
    categories: podcast.categories ?? [],
    img: podcast.image,
    websub_hub: podcast.websub?.hub,
    websub_url: podcast.websub?.url,
  }

  const episodes = (podcast.episodes ?? []).map(episode => ({
    ...Object.fromEntries(
      [
        'title',
        'file',
        'date',
        'season',
        'episode',
        'type',
        'duration',
      ].flatMap(k => (k in episode ? [[k, episode[k]]] : []))
    ),
    description_short: episode.description?.short,
    description_long: episode.description?.long,
    img: episode.image === podcast.image ? undefined : episode.image,
    podId: id,
    SK: episode.id,
  }))

  const items = [meta, ...episodes]
    .map(Object.entries)
    .map(entries => entries.filter(([, v]) => v))
    .map(Object.fromEntries)

  const putRequests = items.map(Item => ({ PutRequest: { Item } }))

  const MAX_NUM_ITEMS = 25
  const batches = new Array(Math.ceil(putRequests.length / MAX_NUM_ITEMS))
    .fill([])
    .map((_, i) =>
      putRequests.slice(i * MAX_NUM_ITEMS, (i + 1) * MAX_NUM_ITEMS)
    )
    .filter(arr => arr.length > 0)

  for (const batch of batches) {
    await client
      .batchWrite({ RequestItems: { podcasts: batch } }, (err, data) => {
        if (err) console.error(err)
        else console.log(`added podcast ${id}`, data)
      })
      .promise()
  }
}
