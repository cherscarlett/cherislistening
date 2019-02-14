<template>
  <div :class="rootClass">
    <Header :isAuth="isAuth"/>
    <section class="content">
      <nuxt/>
    </section>
    <Footer/>
    <nuxt-link v-if="isAuth" class="area-close" aria-hidden="true" to="/" name="index"></nuxt-link>
  </div>
</template>

<script>
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'

export default {
  components: { Header, Footer },
  titleShort: 'is Listening',
  authorName: 'Cher',
  computed: {
    isAuth() {
      return this.$route.name === 'auth'
    },
    ariaCurrent() {
      return this.isAuth ? 'page' : false
    },
    rootClass() {
      return this.isAuth ? 'auth base' : 'base'
    }
  },
  head() {
    return {
      title: `${this.$options.authorName} ${
        this.$options.titleShort
      } ·X· A Musical App`,
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css?family=Bungee+Hairline|Oswald'
        }
      ]
    }
  }
}
</script>

<style>
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
a:not(.area-close):after,
a:not(.area-close):before {
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
  height: 0;
}
.auth .content {
  transform: translateY(0) !important;
}
.nuxt-progress {
  opacity: 0.3;
  height: 2px;
  bottom: 0;
  top: auto;
}

a.area-close {
  display: block;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  z-index: 0;
  cursor: default;
}

@media (max-width: 1400px) {
  .content {
    transform: translateY(14em);
  }
}

@media (max-width: 1200px) {
  .content {
    transform: translateY(7em);
  }
}

@media (max-width: 900px) {
  h1 {
    font-size: 12em !important;
  }
  .content {
    transform: translateY(12em);
  }
}
@media (max-width: 800px) {
  h1 {
    font-size: 10em !important;
  }
  .content {
    transform: translateY(15em);
  }
}
@media (max-width: 600px) {
  h1 {
    font-size: 8em !important;
  }
  h2 {
    font-size: 2em !important;
    line-height: 1.2em;
  }

  .content {
    transform: translateY(7em);
  }
}
@media (max-width: 500px) {
  h1 {
    font-size: 5em !important;
  }

  .content {
    transform: translateY(3em);
  }
}
</style>
