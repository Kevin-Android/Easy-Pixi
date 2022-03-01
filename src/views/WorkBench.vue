<template>
  <div
    class="work-div"
    v-loading.fullscreen.lock="fullscreenLoading"
    :element-loading-text="loadingText"
    element-loading-background="rgba(21, 22, 23, 1)"
    element-loading-spinner="el-icon-loading"
  >
    <div class="grid-left">
      <div class="left-div left-div-1">
        <div
          class="left-bar-but"
          v-bind:class="{ 'bar-but-on': eventCursor === 1 }"
          @click="eventCursorClick(1)"
        >
          <img
            class="left-bar-but-img"
            src="@/assets/svg/cv-rect.svg"
            alt=""
            srcset=""
          />
        </div>
        <div
          class="left-bar-but"
          v-bind:class="{ 'bar-but-on': eventCursor === 3 }"
          @click="eventCursorClick(3)"
        >
          <img
            class="left-bar-but-img"
            src="@/assets/svg/cv-polygon.svg"
            alt=""
            srcset=""
          />
        </div>
      </div>
      <div class="left-div left-div-2">
        <div class="left-bar-but">
          <img
            class="left-bar-but-img"
            src="@/assets/svg/cv-line.svg"
            alt=""
            srcset=""
          />
        </div>
        <div class="left-bar-but">
          <img
            class="left-bar-but-img"
            src="@/assets/svg/cv-choose.svg"
            alt=""
            srcset=""
          />
        </div>
        <div
          class="left-bar-but"
          v-bind:class="{ 'bar-but-on': eventCursor === 0 }"
          @click="eventCursorClick(0)"
        >
          <img
            class="left-bar-but-img"
            src="@/assets/svg/cv-move.svg"
            alt=""
            srcset=""
          />
        </div>
        <div class="left-bar-but">
          <img
            class="left-bar-but-img"
            src="@/assets/svg/cv-zoom.svg"
            alt=""
            srcset=""
          />
        </div>
        <div class="left-bar-but">
          <img
            class="left-bar-but-img"
            src="@/assets/svg/cv-enlarge.svg"
            alt=""
            srcset=""
          />
        </div>
        <div class="left-bar-but">
          <img
            class="left-bar-but-img"
            src="@/assets/svg/cv-screen.svg"
            alt=""
            srcset=""
          />
        </div>
        <div class="left-bar-but">
          <img
            class="left-bar-but-img"
            src="@/assets/svg/cv-tag.svg"
            alt=""
            srcset=""
          />
        </div>
        <div class="left-bar-but">
          <img
            class="left-bar-but-img"
            src="@/assets/svg/cv-color.svg"
            alt=""
            srcset=""
          />
        </div>
      </div>
    </div>
    <div class="grid-content">
      <div class="content-bar">
        <div class="next-div">
          <div class="next-but">
            <p>上一个</p>
          </div>
          <div class="next-line"></div>
          <div class="next-but" @click="nextImageClick">
            <p>下一个</p>
          </div>
        </div>
      </div>
      <div class="content-div">
        <div class="content-app">
          <Stage ref="pixiStage"></Stage>
        </div>
      </div>
    </div>
    <div class="grid-right">
      <div class="right-top"></div>
      <div class="right-div"></div>
    </div>
  </div>
</template>
<script>
import plugin from "../components/pixi/plugin";
export default {
  data() {
    return {
      fullscreenLoading: false,
      loadingText: "拼命加载中",
      eventCursor: 0,
      imageIndex: 0,
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
  mounted() {
    this.fullscreenLoading = true;
    setTimeout(() => {
      plugin.addImageList(this.imageList, (val) => {
        this.loadingText = val.msg;
        if (val.code === 5) {
          this.fullscreenLoading = false;
          this.$message({
            message: "加载成功",
            type: "success",
          });
          let imageResources =
            plugin.getImageResources()[this.imageList[this.imageIndex].name];
          plugin.setImage(imageResources);
        } else if (val.code === 2) {
          this.fullscreenLoading = false;
          this.$message.error(val.error);
        }
      });
    }, 1000);
  },
  methods: {
    nextImageClick() {
      this.imageIndex += 1;
      let imageResources =
        plugin.getImageResources()[this.imageList[this.imageIndex].name];
      plugin.setImage(imageResources);
    },
    addPoint() {
      plugin.addPoint(50, 50, 2);
    },
    // addRect() {
    //   this.eventCursor = 1;
    //   plugin.setCursor(this.eventCursor);
    // },
    eventCursorClick(i) {
      this.eventCursor = i;
      plugin.setCursor(this.eventCursor);
      if (i === 3) {
        plugin.test();
      }
    },
  },
};
</script>
<style scoped>
.work-div {
  width: 100vw;
  height: 100vh;
  background-color: #151617;
  overflow: hidden;
  display: flex;
}
.grid-left {
  height: 100%;
  width: 70px;
  min-width: 70px;
}
.grid-content {
  height: 100%;
  width: calc(100vw - 297px);
  min-width: 1142px;
}
.grid-right {
  height: 100%;
  width: 227px;
  min-width: 227px;
}

.left-div {
  width: 47px;
  min-width: 47px;
  background: #2c343a;
  box-shadow: 0px 2px 1px 0px #212128;
  border-radius: 4px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
.left-div-1 {
  height: 100px;
  margin-top: 200px;
}
.left-div-2 {
  height: 375px;
  margin-top: 20px;
  padding-bottom: 10px;
}
.content-bar {
  width: 100%;
  height: 44px;
  margin: 10px 0;
}
.content-div {
  width: calc(100% - 20px);
  height: calc(100vh - 102px);
  background: #393e4a;
  border-radius: 10px;
  padding: 10px;
}
.content-app {
  width: 100%;
  height: 100%;
  border: 1px solid #a6b9c8;
}
.right-top {
  width: 215px;
  height: 138px;
  background: #393e4a;
  float: right;
}
.right-div {
  margin-top: 10px;
  width: 215px;
  height: calc(100vh - 138px - 28px);
  background: #393e4a;
  float: right;
}
.next-div {
  width: 99px;
  height: 100%;
  background: #2c343a;
  border-radius: 4px;
  display: flex;
  align-items: center;
}
.next-but {
  width: 49px;
  height: 100%;
  cursor: pointer;
  color: white;
  font-size: 12px;
  line-height: 100%;
}
.next-line {
  width: 1px;
  height: 10px;
  background: #ffffff;
}
.el-icon-right {
  width: 30px;
  height: 30px;
}
.left-addrect {
  cursor: pointer;
  color: white;
  font-size: 12px;
  line-height: 100%;
}
.left-bar-but {
  width: 33px;
  height: 33px;
  margin: 8px 8px 0 8px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.left-bar-but:hover {
  cursor: pointer;
  background: #fc4c02;
}
.left-bar-but-img {
  width: 19px;
  height: 19px;
}
.bar-but-on {
  background: #ddda27;
  background: #3dcc2a;
  background: #ddda27;

  background: #fc4c02;
}
</style>