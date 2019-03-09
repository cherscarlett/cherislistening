<template>
  <transition name="fade">
    <section>
      <aside>
        <img v-if="image" :src="image" alt="Album Artwork">
        <Progress :class="className" :progressPercent="progress" :image="image"/>
      </aside>
      <div class="metadata">
        <h2 aria-live="polite">{{name}}</h2>
        <p aria-live="polite">{{artistsList}}</p>
        <p :class="statusClass">
          <span>{{$nuxt.layout && $nuxt.layout.authorName}} {{ status }}.</span>
          <a v-if="href" :href="href">Listen?</a>
        </p>
      </div>
    </section>
  </transition>
</template>

<script>
import Progress from './Progress.vue'

export default {
  components: { Progress },
  props: ['isPlaying', 'nowPlaying'],
  data() {
    return { staleTimer: '', trackTimer: '' }
  },
  computed: {
    className() {
      return this.isPlaying ? '' : 'is-paused'
    },
    statusClass() {
      return this.isPlaying ? 'is-playing status' : 'status'
    },
    image() {
      const { album, image } = this.nowPlaying
      if (Boolean(album)) {
        const { url } = album.images[0]
        return url
      }
      return Boolean(image)
        ? image
        : 'https://developer.spotify.com/assets/branding-guidelines/icon2@2x.png'
    },
    progress() {
      return this.$store.state.trackProgress
    },
    artistsList() {
      const { artists } = this.nowPlaying
      return artists ? artists.map(artist => artist.name).join(', ') : null
    },
    href() {
      const { external_urls } = this.nowPlaying
      return external_urls ? external_urls.spotify : null
    },
    name() {
      return this.nowPlaying.name
    },
    status() {
      return this.isPlaying
        ? `is playing this track with ${Math.round(
            this.$store.state.trackProgress
          )}% complete`
        : 'has paused this track'
    }
  },
  created() {
    this.getNowPlaying()
    this.staleTimer = setInterval(() => {
      this.getNowPlaying()
    }, 10000)
  },
  methods: {
    updateProgress(progress = 0, duration = 0) {
      this.$store.dispatch('updateProgress', { progress, duration })
    },
    async getNowPlaying() {
      const { progress_ms, is_playing, item } = await this.$axios.$get(
        `/api/spotify/now-playing/`
      )
      if (Boolean(item)) {
        const progress = progress_ms
        const duration = item.duration_ms
        this.$store.dispatch('updateStatus', is_playing)
        clearInterval(this.trackTimer)
        if (is_playing) {
          this.timeTrack(Date.now(), duration, progress)
        } else {
          this.updateProgress(progress, duration)
        }
        const { id } = this.nowPlaying
        if (item.id !== id) {
          this.$store.dispatch('updateTrack', item)
        }
      }
    },
    timeTrack(now, duration, progress) {
      const remainder = duration - progress
      const until = now + remainder
      this.trackTimer = setInterval(() => {
        const newNow = Date.now()
        if (newNow < until + 2500) {
          const newRemainder = until - newNow
          const newProgressMs = duration - newRemainder
          this.updateProgress(newProgressMs, duration)
        } else {
          this.updateProgress(1, 1)
          clearInterval(this.trackTimer)
          this.getNowPlaying()
        }
      }, 100)
    }
  },
  beforeDestroy() {
    clearInterval(this.staleTimer)
    clearInterval(this.trackTimer)
  }
}
</script>

<style scoped>
section {
  position: relative;
  display: grid;
  grid-template-columns: 42% 58%;
  align-items: center;
}
aside {
  position: relative;
  min-width: 50px;
}

img {
  opacity: 0;
  position: absolute;
  height: 0;
  width: 0;
}

section:after,
section:before {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 0;
}

section:after {
  transform: rotate(1deg);
  background: rgba(255, 255, 255, 0.1);
}

section:before {
  transform: rotate(3deg);
  background: rgba(255, 255, 255, 0.03);
}
.metadata {
  padding-left: 1.4em;
  position: relative;
  z-index: 2;
}
h2 {
  font-family: 'Oswald', monospace;
  margin: 0;
  font-size: 3em;
}
p {
  margin: 0;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
}

.fade-enter-active {
  transition: opacity 600ms ease-out;
}
.fade-leave-active {
  opacity: 0;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.status span {
  opacity: 0.7;
  font-size: 0.8em;
  padding: 1em 0;
  display: block;
  white-space: nowrap;
}
.is-playing span {
  opacity: 0;
  transition: opacity 600ms ease-out;
}

@media (max-width: 600px) {
  section {
    grid-template-rows: 42% 58%;
    grid-template-columns: 100%;
  }
  aside {
    max-width: 160px;
    margin: 0 auto;
  }
  .metadata {
    text-align: center;
    padding: 0;
  }
}
</style>