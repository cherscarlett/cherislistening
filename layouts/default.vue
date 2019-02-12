<template>
  <div :class="$nuxt.$route.name === 'auth' ? 'auth base' : 'base'">
    <Header/>
    <section class="content">
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

:root {
  --colorGray: #333642;
  --colorBlue: rgba(118, 120, 224, 0.5);
  --colorBrightBlue: rgb(0, 112, 255);
}
html {
  background: #000000;
}
body {
  padding: 0;
  margin: 0;
  color: white;
  font-family: 'Bungee Hairline', monospace;
}
.base {
  background-size: cover;
  background-image: linear-gradient(to top, var(--colorGray), #000000);
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  overflow-x: hidden;
}
a {
  color: white;
  text-decoration: none;
  display: inline-block;
  position: relative;
}
a:after,
a:before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 1em;
  z-index: -1;
  mix-blend-mode: color-burn;
}
a:after {
  bottom: 2px;
  background: var(--colorBlue);
  z-index: -1;
  transform: rotate(-3deg);
}
a:before {
  background: rgba(118, 120, 224, 0.4);
  transform: rotate(2deg);
}
.auth header,
.auth footer {
  filter: blur(20px);
}

.content {
  transform: translateY(10em);
}
@media (max-width: 900px) {
  h1 {
    font-size: 12em !important;
  }
}
@media (max-width: 800px) {
  h1 {
    font-size: 10em !important;
  }
}
@media (max-width: 600px) {
  h1 {
    font-size: 8em !important;
  }

  .content {
    transform: translateY(7em);
  }
}
@media (max-width: 500px) {
  h1 {
    font-size: 5em !important;
  }
  h2 {
    font-size: 2em !important;
  }

  .content {
    transform: translateY(3em);
  }
}
</style>
