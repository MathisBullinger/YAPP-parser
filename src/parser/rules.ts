const textRule = (text: (v: string) => void) => ({ text })

export default (podcast: Partial<Podcast>): Rule => {
  let curEpisode: Partial<Episode>
  return {
    channel: {
      title: textRule(v => (podcast.title = v)),
      author: textRule(v => (podcast.creator = v)),
      item: {
        open: () => {
          curEpisode = {}
        },
        close: () => {
          if (!('episodes' in podcast)) podcast.episodes = []
          podcast.episodes.push(curEpisode as Episode)
          curEpisode = null
        },
        title: textRule(v => (curEpisode.title = v)),
      },
    },
  }
}
