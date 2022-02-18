<template>
  <div class="pixi-stage" ref="PixiStage"></div>
</template>

<script>
import plugin from "./plugin.js";

export default {
  name: "Stage",
  data() {
    return {
      target: 0,
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
  },
};
</script>

<style>
.pixi-stage {
  min-height: 100%;
  width: 100%;
  height: 100%;
}
</style>