import uuidv5 from 'uuid/v5'

const format = {
  duration: (dur: number | string = 0): number => {
    if (typeof dur === 'number') return dur
    try {
      return dur
        .split(':')
        .reverse()
        .map(v => parseInt(v))
        .map((v, i) => v * 60 ** i)
        .reduce((a, b) => a + b)
    } catch (e) {
      return 0
    }
  },
}

export default ({ episodes, ...podcast }: Podcast): Podcast => ({
  ...podcast,
  episodes: episodes.map(episode => ({
    ...episode,
    duration: format.duration(episode.duration),
    id: `ep_${(new Date(episode.date ?? 0).getTime() / 1000).toFixed(
      0
    )}_${uuidv5(episode.file ?? '', uuidv5.URL)}`,
  })),
})
