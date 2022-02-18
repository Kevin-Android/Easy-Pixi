<template>
  <div class="about">
    <el-row>
      <el-col :span="4">
        <div class="grid-content grid-content-left">
          <el-input v-model="imageUrl" placeholder=""></el-input>
          <el-button
            type="primary"
            class="but-style but-style-margin"
            @click="addImageClick"
            >设置图片</el-button
          >
          <el-button
            type="primary"
            style="margin-top: 10px"
            @click="setPixiCursor(1)"
            class="but-style but-style-margin"
            >点</el-button
          >
          <el-button type="primary" class="but-style but-style-margin"
            >矩形</el-button
          >
          <el-button type="primary" class="but-style but-style-margin"
            >多边形</el-button
          >
        </div>
      </el-col>
      <el-col :span="16">
        <div class="grid-content">
          <Stage ref="pixiStage"></Stage>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="grid-content grid-content-right"></div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  data() {
    return {
      imageUrl: "",
    };
  },
  mounted() {},
  methods: {
    addImageClick() {
      this.$refs.pixiStage.addImage(this.imageUrl);
    },
    setPixiCursor(tag) {
      this.$refs.pixiStage.setCursor(tag);
    },
  },
};
</script>


<style>
.grid-content {
  width: 100%;
  min-height: 100px;
  height: calc(100vh - 100px);
}
.grid-content-left {
  border-radius: 4px;
  margin: 0 10px;
  width: calc(100% - 20px);
  height: calc(100vh - 120px);
  background-color: #cccccc;
  padding-top: 20px;
}
.grid-content-right {
  border-radius: 4px;
  margin: 0 10px;
  width: calc(100% - 20px);
  height: calc(100vh - 120px);
  background-color: #cccccc;
  padding-top: 20px;
}
.but-style {
  width: 120px;
}
.but-style-margin {
  margin: 10px 20px;
}
</style>
