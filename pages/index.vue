<template>
  <section>
    <NowPlaying :isPlaying="isPlaying" :track="nowPlaying"/>
  </section>
</template>

<script>
import NowPlaying from '~/components/NowPlaying.vue'

export default {
  components: { NowPlaying },
  computed: {
    nowPlaying() {
      const { progress_ms, item, is_playing } = this.$store.state.nowPlaying
      this.playing = Boolean(is_playing)
      if (Boolean(item)) {
        this.progress_ms
        return item
      }
      return this.$store.state.recentlyPlayed
    },
    isPlaying() {
      return this.playing
    }
  }
}
</script>

<style scoped>
section {
  min-width: 320px;
  transform: translateY(-50%);
  max-width: 600px;
  margin: auto;
  padding: 1em;
}

@media (max-width: 600px) {
  section {
    transform: translateY(-10%);
  }
}
</style>
