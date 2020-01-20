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
  })),
})
