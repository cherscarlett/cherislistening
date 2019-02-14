<template>
  <div aria-hidden="true">
    <svg class="album" viewBox="0 0 24.5 24.5" xmlns="http://www.w3.org/2000/svg" role="img">
      <defs>
        <pattern id="image" x="0%" y="0%" height="100%" width="100%" patternUnits="userSpaceOnUse">
          <image x="0%" y="0%" width="100%" height="100%" v-bind="{'xlink:href': image }"></image>
        </pattern>
      </defs>
      <rect height="25.5" width="25.5" class="image" x="0" y="0"></rect>
    </svg>
    <svg class="progress" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#333642"></stop>
          <stop offset="25%" stop-color="rgba(0, 112, 255, 0.8)"></stop>
          <stop offset="90%" stop-color="rgba(118, 120, 224, 0.5)"></stop>
          <stop offset="100%" stop-color="rgba(255, 255, 255, .5)"></stop>
        </linearGradient>
      </defs>
      <rect
        class="bar"
        :stroke-dasharray="`${progressPercent} 100`"
        fill="none"
        x="0"
        y="0"
        height="25"
        width="25"
      ></rect>
    </svg>
  </div>
</template>

<script>
export default {
  props: ['progressPercent', 'image']
}
</script>

<style scoped>
div {
  filter: grayscale(0);
  transform: rotate(-2deg) scale(0.9);
}
.is-paused {
  filter: grayscale(80%);
  transition: all 600ms ease-out;
}
svg {
  height: 100%;
  width: 100%;
}
svg.album {
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.3));
}
svg.progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.2))
    drop-shadow(0 0 2px var(--colorBrightBlue))
    drop-shadow(0 0 3px var(--colorBrightBlue))
    drop-shadow(0 0 5px var(--colorBrightBlue)) opacity(65%) contrast(150%);
}
.bar {
  stroke: url(#gradient);
  stroke-width: 0.03em;
  transform: rotate(0deg);
  transform-origin: center;
  animation: fill 2s reverse;
}
.image {
  fill: url(#image);
}
@keyframes fill {
  to {
    stroke-dasharray: 0 100;
  }
}
</style>
