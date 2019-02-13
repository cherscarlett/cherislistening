<template>
  <section>
    <NowPlaying :nowPlaying="track" :isPlaying="isPlaying"/>
  </section>
</template>

<script>
import NowPlaying from '~/components/NowPlaying.vue'

export default {
  components: { NowPlaying },
  computed: {
    nowPlaying() {
      if (Boolean(this.$store.state.nowPlaying))
        return this.$store.state.nowPlaying
      return this.$store.state.recentlyPlayed
    },
    track() {
      return this.nowPlaying
    },
    isPlaying() {
      return this.$store.state.isPlaying
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
