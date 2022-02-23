<template>
  <div class="about">
    <el-dialog
      title="选择图片"
      :visible.sync="centerDialogVisible"
      width="80%"
      center
    >
      <div class="dialog-list-div">
        <el-carousel
          ref="carousel"
          trigger="click"
          height="400px"
          :autoplay="false"
        >
          <el-carousel-item
            v-for="(item, index) in getImageList()"
            :key="index"
            :name="item.name"
          >
            <el-image style="width: 100%" fit="fit" :src="item.url"></el-image>
          </el-carousel-item>
        </el-carousel>
      </div>
      <span slot="footer">
        <el-button
          @click="
            {
              centerDialogVisible = false;
            }
          "
          >取 消</el-button
        >
        <el-button type="primary" @click="setImageClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-row>
      <el-col :span="4">
        <div class="grid-content grid-content-left">
          <el-button
            type="primary"
            class="but-style but-style-margin"
            @click="onImageLoaderClick"
            >加载图片</el-button
          >
          <el-button
            type="primary"
            class="but-style but-style-margin"
            @click="onImageDialogVisibleClick"
            >选择图片</el-button
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
import plugin from "../components/pixi/plugin";
export default {
  data() {
    return {
      centerDialogVisible: false,
      imageUrl: "",
      imageList: new Array(
        {
          name: "刘德华1",
          url: "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fp9.itc.cn%2Fimages01%2F20210729%2Ff7f052b56e6440949fddea2e2d6c9e8e.png&refer=http%3A%2F%2Fp9.itc.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1648025322&t=20ca6e36f0a9fcf7e37659bd1deddf08",
          crossOrigin: true,
          loadType: 2,
        },
        {
          name: "刘德华2",
          url: "https://pic2.zhimg.com/80/v2-ddda486494089462d83de99130cb285b_720w.jpg",
          crossOrigin: true,
          loadType: 2,
        },
        {
          name: "刘德华3",
          url: "https://pic2.zhimg.com/80/v2-37ebf150786fdf9fbf3f1ec0b3b59850_720w.jpg",
          crossOrigin: true,
          loadType: 2,
        },
        {
          name: "刘德华4",
          url: "https://img0.baidu.com/it/u=1937820384,2158373543&fm=253&fmt=auto&app=138&f=JPEG?w=334&h=500",
          crossOrigin: true,
          loadType: 2,
        }
      ),
    };
  },
  mounted() {},
  methods: {
    carouselChange(img) {
      console.log(img);
    },
    setImageClick() {
      console.log(plugin.getImageResources());
      plugin.setImage(
        plugin.getImageResources()[
          this.$refs.carousel.items[this.$refs.carousel.activeIndex].$options
            .propsData.name
        ]
      );
      this.centerDialogVisible = false;
    },
    onImageLoaderClick() {
      plugin.addImageList(this.imageList);
    },
    onImageDialogVisibleClick() {
      this.centerDialogVisible = true;
    },
    setPixiCursor(tag) {
      this.$refs.pixiStage.setCursor(tag);
    },
    getImageList() {
      return plugin.getImageResources();
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
.dialog-list-div {
  height: 400px;
  width: 100%;
}
</style>
