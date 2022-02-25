<template>
  <div
    class="pixi-stage"
    ref="PixiStage"
    @mousemove="mouseMove"
    @mousewheel="mouseWheel"
  ></div>
</template>

<script>
import plugin from "./plugin.js";

export default {
  name: "Stage",
  data() {
    return {
      target: 0,
      scaleBy: 1.1,
    };
  },
  mounted() {
    let _this = this;
    this.$nextTick(() => {
      plugin.init(_this.$refs.PixiStage);
    });
  },
  methods: {
    getStage() {
      return plugin.getPixiApp();
    },
    addImage(url) {
      plugin.addImage(url);
    },
    setOnClick(dom, listener) {
      plugin.setOnClick(dom, listener);
    },
    setCursor(tag) {
      plugin.setCursor(tag);
    },
    mouseMove(event) {
      plugin.setPointer({
        x: event.offsetX,
        y: event.offsetY,
      });
    },
    mouseWheel(event) {
      plugin.setOnMouseWheel(event);
    },
  },
};
</script>

<style>
.pixi-stage {
  min-height: 100%;
  width: 100%;
  height: 100%;
  position: relative;
}
</style>