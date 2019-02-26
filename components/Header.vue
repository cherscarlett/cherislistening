<template>
  <header>
    <h1>
      {{$nuxt.layout && $nuxt.layout.authorName}} {{ $nuxt.layout && $nuxt.layout.titleShort }}
      <nuxt-link to="/auth" name="auth" aria-label="Login" :aria-current="isAuth"/>
    </h1>
  </header>
</template>

<script>
export default {
  props: ['isAuth']
}
</script>

<style scoped>
h1 {
  line-height: 0.65em;
  font-family: 'Oswald', monospace;
  letter-spacing: 1px;
  font-size: 15em;
  transform: rotate(-3deg) translateY(-50%);
  -webkit-box-reflect: below 0px
    linear-gradient(transparent, rgba(255, 255, 255, 0.3));
}
h1 a {
  display: inline-block;
  height: 21px;
  width: 21px;
  background-image: url(~assets/spotify.svg);
  background-size: cover;
  filter: brightness(300%) opacity(30%);
  position: absolute;
  bottom: 0;
}
h1 a:hover {
  filter: brightness(300%) opacity(60%);
}
h1 a:after,
h1 a:before {
  content: none;
}
header {
  filter: blur(0);
  transition: all 600ms ease-out;
}
p {
  width: 40%;
  margin: auto;
  min-width: 320px;
}
</style>
