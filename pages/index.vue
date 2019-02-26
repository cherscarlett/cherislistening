<template>
  <section>
    <NowPlaying v-if="showTrack" :nowPlaying="track" :isPlaying="isPlaying"/>
    <p v-if="!isConnected">
      😭 {{ $nuxt.layout && $nuxt.layout.authorName }} hasn't connected yet. 😭
      <a
        href="http://twitter.com/codehitchhiker"
      >Nudge her</a>
    </p>
  </section>
</template>

<script>
import NowPlaying from '~/components/NowPlaying.vue'

export default {
  components: { NowPlaying },
  computed: {
    showTrack() {
      return this.isConnected && this.track
    },
    nowPlaying() {
      if (Boolean(Object.keys(this.$store.state.nowPlaying).length !== 0)) {
        this.$store.dispatch('updateConnection', true)
        return this.$store.state.nowPlaying
      }
      return this.$store.state.recentlyPlayed
    },
    track() {
      return this.nowPlaying
    },
    isPlaying() {
      return this.$store.state.isPlaying
    },
    isConnected() {
      return this.$store.state.isConnected
    }
  }
}
</script>

<style scoped>
section {
  min-width: 300px;
  transform: translateY(-50%);
  max-width: 750px;
  margin: auto;
  padding: 1em;
}

@media (max-width: 600px) {
  section {
    transform: translateY(-10%) translateX(-2vw);
    width: 65vw;
    min-width: 200px;
  }
}
</style>
