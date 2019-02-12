<template>
  <div :class="$nuxt.$route.name === 'auth' ? 'auth base' : 'base'">
    <Header/>
    <section>
      <nuxt/>
    </section>
    <Footer/>
  </div>
</template>

<script>
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'

export default {
  components: { Header, Footer }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Bungee+Hairline|Oswald');
html {
  background: #000000;
  background: linear-gradient(to top, #333642, #000000);
  height: 100%;
}
body {
  padding: 0;
  margin: 0;
  color: white;
  font-family: 'Bungee Hairline', monospace;
}
.base {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
a {
  color: white;
  text-decoration: none;
  display: inline-block;
  position: relative;
}
a:after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  height: 1em;
  background: rgba(118, 120, 224, 0.5);
  z-index: -1;
  transform: rotate(-3deg);
  mix-blend-mode: color-burn;
}
a:before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1em;
  background: rgba(118, 120, 224, 0.4);
  z-index: -1;
  transform: rotate(2deg);
}
.auth header,
.auth footer {
  filter: blur(20px);
}
</style>
