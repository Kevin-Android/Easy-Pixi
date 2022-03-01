import * as PIXI from 'pixi.js'
import { EventSystem } from '@pixi/events';


delete PIXI.Renderer.__plugins.interaction;

const PixiApp = PIXI.Application;
const Container = PIXI.Container;
const Texture = PIXI.Texture;
const Graphics = PIXI.Graphics;
const Sprite = PIXI.Sprite;
const Loader = PIXI.Loader;
const defaultOptions = {
    width: 800,
    height: 800,
    backgroundColor: 0x393e4a,
    backgroundAlpha: 1, // default: 1 透明度
    antialias: true,    // default: false 反锯齿
    resolution: 1       // default: 1 分辨率 
}
const scaleBy = 1.1;

let app;
let eventApp;
let appLoader;
let imageResources;
let image;
let eventAppSprite;
let lable = new Array();
let coordinate = new Array();
let rectCoordinate = new Array();
let eventCursor = 0;
let eventDiff;
let eventDragging;



function init(dom, options = defaultOptions) {
    app = new PixiApp(options);
    options.backgroundAlpha = 0;
    eventApp = new PixiApp(options);
    app.stage.name = "renderStage"
    eventApp.stage.name = "eventStage"
    dom.append(app.view);
    dom.append(eventApp.view);
    app.resizeTo = dom;
    eventApp.resizeTo = dom;
    window.onresize = () => {
        return (() => {
            app.resize();
            eventApp.resize();
        })()
    }
    appLoader = Loader.shared;
    // 设置请求资源的参数，防止缓存的出现
    appLoader.defaultQueryString = 'v=' + Math.random();
    app.view.style.position = "absolute";
    app.view.style.top = "0";
    app.view.style.right = "0";
    app.view.style.bottom = "0";
    app.view.style.left = "0";
    app.view.style.cursor = "default";
    app.view.style.userSelect = "none";
    eventApp.view.style.position = "absolute";
    eventApp.view.style.top = "0";
    eventApp.view.style.right = "0";
    eventApp.view.style.bottom = "0";
    eventApp.view.style.left = "0";
    eventApp.view.style.userSelect = "none";
    eventApp.renderer.addSystem(EventSystem, "events")
    console.log("初始化成功");
}

//  必须释放内存
function destroy() {
    app.destroy(true)
}

function addImageList(aar, callback) {
    console.log("添加", aar)
    try {
        appLoader.add(aar)
        // 开始加载
        appLoader.onProgress.add(res => {
            console.log("开始加载一个资源")

            if (callback) {
                callback({
                    code: 1,
                    msg: "开始加载一个资源"
                })
            }
        });
        // 加载出错
        appLoader.onError.add(res => {
            console.log("加载出错")
            if (callback) {
                callback({
                    code: 2,
                    msg: "加载出错",
                    error: res
                })
            }
        });
        // 加载完成
        appLoader.onLoad.add(res => {
            if (callback) {
                callback({
                    code: 3,
                    msg: "加载完成一个资源"
                })
            }
        });
        // 完成所有加载
        appLoader.onComplete.add(res => {
            if (callback) {
                callback({
                    code: 4,
                    msg: "完成所有资源加载"
                })
            }
        });
        // 输出纹理
        appLoader.load((loader, resources) => {
            imageResources = resources;
            if (callback) {
                callback({
                    code: 5,
                    msg: "初始化成功"
                })
            }
        });
    } catch (error) {
        console.log("添加异常", error)
        if (callback) {
            callback({
                code: 2,
                msg: "加载出错",
                error: error
            })
        }
    }

}


function getImageResources() {
    return imageResources;
}

function getPixiApp() {
    return pixiApp;
}


function getImage() {
    return image;
}

function setImage(loaderResource) {
    console.log(loaderResource);
    app.stage.removeChildren();
    eventApp.stage.removeChildren();
    image = new Sprite(loaderResource.texture);
    app.stage.addChild(image);
    eventAppSprite = new Sprite(loaderResource.texture);
    eventAppSprite.alpha = 0;
    eventAppSprite.interactive = true;
    eventAppSprite.buttonMode = true;
    eventAppSprite.addEventListener('wheel', onDragWheel)
    eventApp.stage.addChild(eventAppSprite);
    eventApp.renderer.view.addEventListener('pointerdown', onDragStart);
    eventApp.renderer.view.addEventListener('pointermove', onDragMove);
    eventApp.renderer.view.addEventListener('pointerout', onDragEnd);
    eventApp.renderer.view.addEventListener('pointerup', onDragEnd);
    eventApp.renderer.view.addEventListener('pointerupoutside', onDragEnd);
}

//  鼠标滚轮监听图像缩放
function onDragWheel(event) {
    if (getImage() === undefined) {
        console.log("你的图像为：", getImage(), "！！！请设置图片😓");
        return;
    }
    //  获取到当前缩放比例
    var oldScale = getImage().scale.x;
    //  获取到当前鼠标坐标
    var pointer = event.global;
    //  获取鼠标与图片上次缩放比例的坐标差
    var mousePointTo = {
        x: (pointer.x - getImage().x) / oldScale,
        y: (pointer.y - getImage().y) / oldScale,
    };
    //  放大还是缩小
    let direction = event.deltaY > 0 ? 1 : -1;
    // 当我们放大触控板时，e.evt.ctrlKey 为真，在这种情况下，让我们改变方向
    if (event.ctrlKey) {
        direction = -direction;
    }
    //  如果放大当前比例*缩放比例反之/缩放比例
    var newScale =
        direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (newScale < 0.5 || newScale > 30) {
        return;
    }
    //  设置新的scale
    eventAppSprite.scale.x = newScale;
    eventAppSprite.scale.y = newScale;
    getImage().scale.x = newScale;
    getImage().scale.y = newScale;
    //  获得图像新坐标当前鼠标坐标减去本次缩放的距离
    var newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
    };
    eventAppSprite.position.x = newPos.x;
    eventAppSprite.position.y = newPos.y;
    eventAppSprite.getBounds().copyTo(image)
    // lable.forEach((val, index) => {
    //     switch (coordinate[index].type) {
    //         case "point":
    //             val.position.x = (coordinate[index].offset.x * newScale + newPos.x);
    //             val.position.y = (coordinate[index].offset.y * newScale + newPos.y);
    //             break
    //         case "rect":
    //             val.position.x = coordinate[index].offset.x * newScale + newPos.x;
    //             val.position.y = coordinate[index].offset.y * newScale + newPos.y;
    //             break
    //         default:
    //             break
    //     }
    // })
    // console.log(rectContainerArray)

    test2(newScale, newPos);
    // rectContainerArray.forEach((data, index) => {
    //     let offset = rectCoordinate[index];
    //     data.children.forEach((val, position, arr) => {
    //         switch (val.name) {
    //             case "point_a":
    //                 val.x = offset.point_a_offset.x * newScale + newPos.x;
    //                 val.y = offset.point_a_offset.y * newScale + newPos.y;
    //                 break;
    //             case "point_b":
    //                 val.x = offset.point_b_offset.x * newScale + newPos.x;
    //                 val.y = offset.point_b_offset.y * newScale + newPos.y;
    //                 break;
    //             case "point_c":
    //                 val.x = offset.point_c_offset.x * newScale + newPos.x;
    //                 val.y = offset.point_c_offset.y * newScale + newPos.y;
    //                 break;
    //             case "point_d":
    //                 val.x = offset.point_d_offset.x * newScale + newPos.x;
    //                 val.y = offset.point_d_offset.y * newScale + newPos.y;
    //                 break;
    //             case "line_a":
    //                 val.lineStyle(1, 0x66CCFF, 1);
    //                 val.lineTo(arr[1].x - arr[0].x, 0)
    //                 val.x = offset.point_a_offset.x * newScale + newPos.x;
    //                 val.y = offset.point_a_offset.y * newScale + newPos.y;
    //                 break;
    //             case "line_b":
    //                 val.clear();
    //                 val.lineStyle(1, 0x66CCFF, 1);
    //                 val.lineTo(0, arr[2].y - arr[1].y)
    //                 val.x = offset.point_b_offset.x * newScale + newPos.x;
    //                 val.y = offset.point_b_offset.y * newScale + newPos.y;
    //                 break;
    //             case "line_c":
    //                 val.clear();
    //                 val.lineStyle(1, 0x66CCFF, 1);
    //                 val.lineTo(arr[3].x - arr[2].x, 0)
    //                 val.x = offset.point_c_offset.x * newScale + newPos.x;
    //                 val.y = offset.point_c_offset.y * newScale + newPos.y;
    //                 break;
    //             case "line_d":
    //                 val.clear();
    //                 val.lineStyle(1, 0x66CCFF, 1);
    //                 val.lineTo(0, arr[0].y - arr[3].y)
    //                 val.x = offset.point_c_offset.x * newScale + newPos.x;
    //                 val.y = offset.point_c_offset.y * newScale + newPos.y;
    //                 break;
    //         }

    //     })
    // })



}
let rectContainer
let rectContainerArray = new Array()
//  开始拖拽
function onDragStart(event) {
    switch (eventCursor) {
        case 1:
            let rectPosition = getLocalPosition(event, this)

            if (rectPosition.x < eventAppSprite.getBounds().x || rectPosition.x > (eventAppSprite.getBounds().x + eventAppSprite.getBounds().width)) {
                console.log("不在图像内")
                return;
            }
            if (rectPosition.y < eventAppSprite.getBounds().y || rectPosition.y > (eventAppSprite.getBounds().y + eventAppSprite.getBounds().height)) {
                console.log("不在图像内")
                return;
            }

            if (rectContainer !== undefined && !rectContainer.isEasyDraw) {
                rectContainer.isEasyDraw = true;
                rectContainer = undefined;
                return;
            }

            rectContainer = new Container()

            rectContainer.name = "矩形" + Math.random()

            rectContainer.isEasyDraw = false;

            app.stage.addChild(rectContainer)

            let point_a = new Graphics();
            point_a.beginFill(0x66CCFF); // 蓝
            point_a.drawCircle(0, 0, 4);
            point_a.endFill();
            point_a.x = rectPosition.x;
            point_a.y = rectPosition.y;
            point_a.name = "point_a"
            point_a.alpha = 0.5;


            let point_b = new Graphics();
            point_b.beginFill(0x3dcc2a); //   绿 
            point_b.drawCircle(0, 0, 4);
            point_b.endFill();
            point_b.x = rectPosition.x;
            point_b.y = rectPosition.y;
            point_b.name = "point_b"
            point_b.alpha = 0.5;

            let point_c = new Graphics();
            point_c.beginFill(0xddda27); //  黄
            point_c.drawCircle(0, 0, 4);
            point_c.endFill();
            point_c.x = rectPosition.x;
            point_c.y = rectPosition.y;
            point_c.name = "point_c"
            point_c.alpha = 0.5;



            let point_d = new Graphics();
            point_d.beginFill(0xdd27a6);  //  粉
            point_d.drawCircle(0, 0, 4);
            point_d.endFill();
            point_d.x = rectPosition.x;
            point_d.y = rectPosition.y;
            point_d.name = "point_d"
            point_d.alpha = 0.5;

            let line_a = new Graphics();
            line_a.name = "line_a"
            line_a.lineStyle(1, 0x66CCFF, 1);
            line_a.moveTo(0, 0)
            line_a.lineTo(0, 0)
            line_a.x = point_a.x;
            line_a.y = point_a.y;

            let line_b = new Graphics();
            line_b.name = "line_b"
            line_b.lineStyle(1, 0x66CCFF, 1);
            line_b.moveTo(0, 0)
            line_b.lineTo(0, 0)
            line_b.x = point_b.x;
            line_b.y = point_b.y;

            let line_c = new Graphics();
            line_c.name = "line_c"
            line_c.lineStyle(1, 0x66CCFF, 1);
            line_c.moveTo(0, 0)
            line_c.lineTo(0, 0)
            line_c.x = point_c.x;
            line_c.y = point_c.y;

            let line_d = new Graphics();
            line_d.name = "line_d"
            line_d.lineStyle(1, 0x66CCFF, 1);
            line_d.moveTo(0, 0)
            line_d.lineTo(0, 0)
            line_d.x = point_d.x;
            line_d.y = point_d.y;

            rectContainer.addChild(point_a)
            rectContainer.addChild(point_b)
            rectContainer.addChild(point_c)
            rectContainer.addChild(point_d)
            rectContainer.addChild(line_a)
            rectContainer.addChild(line_b)
            rectContainer.addChild(line_c)
            rectContainer.addChild(line_d)


            rectCoordinate.push({
                name: rectContainer.name,
                point_a_offset: getRealOffSet(point_a),
                point_b_offset: getRealOffSet(point_b),
                point_c_offset: getRealOffSet(point_c),
                point_d_offset: getRealOffSet(point_d),
                // line_a_offset: getRealOffSet(line_a),
                // line_b_offset: getRealOffSet(line_b),
                // line_c_offset: getRealOffSet(line_c),
                // line_d_offset: getRealOffSet(line_d),
            })
            rectContainerArray.push(rectContainer);
            break;
        case 2:
            break;
        default:
            let pointerPosition = getLocalPosition(event, this)
            if (pointerPosition.x < eventAppSprite.getBounds().x || pointerPosition.x > (eventAppSprite.getBounds().x + eventAppSprite.getBounds().width)) {
                console.log("不在图像内")
                return;
            }
            if (pointerPosition.y < eventAppSprite.getBounds().y || pointerPosition.y > (eventAppSprite.getBounds().y + eventAppSprite.getBounds().height)) {
                console.log("不在图像内")
                return;
            }
            if (image) {
                eventDragging = true
                eventDiff = { x: pointerPosition.x - eventAppSprite.x, y: pointerPosition.y - eventAppSprite.y }
            }
            break;
    }

}

function getRealOffSet(graphics) {
    if (eventAppSprite) {
        let eventBounds = eventAppSprite.getBounds()
        return {
            x: (graphics.x - eventBounds.x) / eventAppSprite.scale.x,
            y: (graphics.y - eventBounds.y) / eventAppSprite.scale.y,
        }
    } else {
        return {
            x: 0,
            y: 0
        }
    }

}


//拖拽移动中
function onDragMove(event) {
    console.log(eventCursor)
    switch (eventCursor) {
        case 1:
            if (rectContainer != null && rectContainer.children.length === 8 && !rectContainer.isEasyDraw) {
                const newPosition = getLocalPosition(event, this);
                rectContainer.children.forEach((val, index, arr) => {
                    switch (val.name) {
                        case "point_c":
                            // c 点
                            arr[index].x = newPosition.x;
                            arr[index].y = newPosition.y;
                            arr[index].endFill()

                            // b 点
                            arr[1].x = newPosition.x;
                            arr[1].y = arr[0].y;
                            arr[1].endFill()

                            // d 点
                            arr[3].x = arr[0].x;
                            arr[3].y = newPosition.y;
                            arr[3].endFill()

                            // a 线
                            arr[4].clear();
                            arr[4].lineStyle(1, 0x66CCFF, 1);
                            arr[4].lineTo(newPosition.x - arr[0].x, 0)
                            arr[4].endFill()

                            // b 线
                            arr[5].clear();
                            arr[5].lineStyle(1, 0x66CCFF, 1);
                            arr[5].lineTo(0, newPosition.y - arr[0].y)
                            arr[5].x = arr[1].x;
                            arr[5].y = arr[1].y;
                            arr[5].endFill()

                            // c 线
                            arr[6].clear();
                            arr[6].lineStyle(1, 0x66CCFF, 1);
                            arr[6].lineTo(arr[4].x - newPosition.x, 0)
                            arr[6].x = arr[2].x;
                            arr[6].y = arr[2].y;
                            arr[6].endFill()


                            // d 线
                            arr[7].clear();
                            arr[7].lineStyle(1, 0x66CCFF, 1);
                            arr[7].lineTo(0, arr[0].y - newPosition.y)
                            arr[7].x = arr[3].x;
                            arr[7].y = arr[3].y;
                            arr[7].endFill()


                            rectCoordinate.forEach((val) => {
                                //  是当前正在绘制的矩形才改变原始坐标
                                if (val.name === rectContainer.name) {
                                    val.point_a_offset = getRealOffSet(arr[0]);
                                    val.point_b_offset = getRealOffSet(arr[1]);
                                    val.point_c_offset = getRealOffSet(arr[2]);
                                    val.point_d_offset = getRealOffSet(arr[3]);
                                }
                            })
                            break;
                    }
                })
            }
            break;
        case 2:
            break;
        default:
            if (eventDragging) {
                const newPosition = getLocalPosition(event, this);
                eventAppSprite.x = newPosition.x - eventDiff.x;
                eventAppSprite.y = newPosition.y - eventDiff.y;
                eventAppSprite.getBounds().copyTo(image)
                // let stageChildren = app.stage.children;
                // stageChildren.forEach((val,index,arr) => {

                // })
                test();
                //  rectContainerArray 存自定义矩形的数组
                // rectContainerArray.forEach((data, index) => {
                //     console.log(data.name)
                //     //  相对于图像的坐标
                //     let offset = rectCoordinate[index];
                //     console.log(offset)
                //     //  循环更新坐标点
                //     data.children.forEach((val, position, arr) => {
                //         switch (val.name) {
                //             case "point_a":
                //                 // data.getChildAt(position).clear();
                //                 // data.getChildAt(position).beginFill(0x66CCFF); // 蓝
                //                 // data.getChildAt(position).drawCircle(0, 0, 4);
                //                 // data.getChildAt(position).endFill();
                //                 data.getChildAt(position).x = eventAppSprite.x + offset.point_a_offset.x * eventAppSprite.scale.x;
                //                 data.getChildAt(position).y = eventAppSprite.y + offset.point_a_offset.y * eventAppSprite.scale.y;
                //                 // data.getChildAt(position).endFill()
                //                 break;
                //             case "point_b":
                //                 // data.getChildAt(position).clear();
                //                 // data.getChildAt(position).beginFill(0x66CCFF); // 蓝
                //                 // data.getChildAt(position).drawCircle(0, 0, 4);
                //                 // data.getChildAt(position).endFill();
                //                 data.getChildAt(position).x = eventAppSprite.x + offset.point_b_offset.x * eventAppSprite.scale.x;
                //                 data.getChildAt(position).y = eventAppSprite.y + offset.point_b_offset.y * eventAppSprite.scale.y;
                //                 // data.getChildAt(position).endFill()
                //                 break;
                //             case "point_c":
                //                 // data.getChildAt(position).clear();
                //                 // data.getChildAt(position).beginFill(0x66CCFF); // 蓝
                //                 // data.getChildAt(position).drawCircle(0, 0, 4);
                //                 // data.getChildAt(position).endFill();
                //                 data.getChildAt(position).x = eventAppSprite.x + offset.point_c_offset.x * eventAppSprite.scale.x;
                //                 data.getChildAt(position).y = eventAppSprite.y + offset.point_c_offset.y * eventAppSprite.scale.y;
                //                 // data.getChildAt(position).endFill()
                //                 break;
                //             case "point_d":
                //                 // data.getChildAt(position).clear();
                //                 // data.getChildAt(position).beginFill(0x66CCFF); // 蓝
                //                 // data.getChildAt(position).drawCircle(0, 0, 4);
                //                 // data.getChildAt(position).endFill();
                //                 data.getChildAt(position).x = eventAppSprite.x + offset.point_d_offset.x * eventAppSprite.scale.x;
                //                 data.getChildAt(position).y = eventAppSprite.y + offset.point_d_offset.y * eventAppSprite.scale.y;
                //                 // data.getChildAt(position).endFill()
                //                 break;
                //             case "line_a":
                //                 // data.getChildAt(position).clear();
                //                 // data.getChildAt(position).lineStyle(1, 0x66CCFF, 1);
                //                 // data.getChildAt(position).lineTo(arr[1].x - arr[0].x, 0)
                //                 data.getChildAt(position).x = eventAppSprite.x + offset.line_a_offset.x * eventAppSprite.scale.x;
                //                 data.getChildAt(position).y = eventAppSprite.y + offset.line_a_offset.y * eventAppSprite.scale.y;
                //                 break;
                //             case "line_b":
                //                 // data.getChildAt(position).clear();
                //                 // data.getChildAt(position).lineStyle(1, 0x66CCFF, 1);
                //                 // data.getChildAt(position).lineTo(0, arr[2].y - arr[1].y)
                //                 data.getChildAt(position).x = eventAppSprite.x + offset.line_b_offset.x * eventAppSprite.scale.x;
                //                 data.getChildAt(position).y = eventAppSprite.y + offset.line_b_offset.y * eventAppSprite.scale.y;
                //                 break;
                //             case "line_c":
                //                 // data.getChildAt(position).clear();
                //                 // data.getChildAt(position).lineStyle(1, 0x66CCFF, 1);
                //                 // data.getChildAt(position).lineTo(arr[3].x - arr[2].x, 0)
                //                 data.getChildAt(position).x = eventAppSprite.x + offset.line_c_offset.x * eventAppSprite.scale.x;
                //                 data.getChildAt(position).y = eventAppSprite.y + offset.line_c_offset.y * eventAppSprite.scale.y;
                //                 // data.getChildAt(position).endFill()
                //                 break;
                //             case "line_d":
                //                 // data.getChildAt(position).clear();
                //                 // data.getChildAt(position).lineStyle(1, 0x66CCFF, 1);
                //                 // data.getChildAt(position).lineTo(0, arr[0].y - arr[3].y)
                //                 data.getChildAt(position).x = eventAppSprite.x + offset.line_d_offset.x * eventAppSprite.scale.x;
                //                 data.getChildAt(position).y = eventAppSprite.y + offset.line_d_offset.y * eventAppSprite.scale.y;
                //                 // data.getChildAt(position).endFill()
                //                 break;
                //         }

                //     })
                // })

                //  rectContainerArray 存自定义矩形的数组
                // rectContainerArray.forEach((data, index) => {
                //     console.log(data.name)
                //     //  相对于图像的坐标
                //     let offset = rectCoordinate[index];
                //     //  循环更新坐标点
                //     data.children.forEach((val, position, arr) => {
                //         switch (val.name) {
                //             case "point_a":
                //                 data.getChildAt(position).clear();
                //                 arr[position].beginFill(0x66CCFF); // 蓝
                //                 arr[position].drawCircle(0, 0, 4);
                //                 arr[position].endFill();
                //                 arr[position].x = eventAppSprite.x + offset.point_a_offset.x * eventAppSprite.scale.x;
                //                 arr[position].y = eventAppSprite.y + offset.point_a_offset.y * eventAppSprite.scale.y;
                //                 arr[position].endFill()
                //                 break;
                //             case "point_b":
                //                 arr[position].clear();
                //                 arr[position].beginFill(0x66CCFF); // 蓝
                //                 arr[position].drawCircle(0, 0, 4);
                //                 arr[position].endFill();
                //                 arr[position].x = eventAppSprite.x + offset.point_b_offset.x * eventAppSprite.scale.x;
                //                 arr[position].y = eventAppSprite.y + offset.point_b_offset.y * eventAppSprite.scale.y;
                //                 arr[position].endFill()
                //                 break;
                //             case "point_c":
                //                 arr[position].clear();
                //                 arr[position].beginFill(0x66CCFF); // 蓝
                //                 arr[position].drawCircle(0, 0, 4);
                //                 arr[position].endFill();
                //                 arr[position].x = eventAppSprite.x + offset.point_c_offset.x * eventAppSprite.scale.x;
                //                 arr[position].y = eventAppSprite.y + offset.point_c_offset.y * eventAppSprite.scale.y;
                //                 arr[position].endFill()
                //                 break;
                //             case "point_d":
                //                 arr[position].clear();
                //                 arr[position].beginFill(0x66CCFF); // 蓝
                //                 arr[position].drawCircle(0, 0, 4);
                //                 arr[position].endFill();
                //                 arr[position].x = eventAppSprite.x + offset.point_d_offset.x * eventAppSprite.scale.x;
                //                 arr[position].y = eventAppSprite.y + offset.point_d_offset.y * eventAppSprite.scale.y;
                //                 arr[position].endFill()
                //                 break;
                //             case "line_a":
                //                 arr[position].clear();
                //                 arr[position].lineStyle(1, 0x66CCFF, 1);
                //                 arr[position].lineTo(arr[1].x - arr[0].x, 0)
                //                 arr[position].x = eventAppSprite.x + offset.line_a_offset.x * eventAppSprite.scale.x;
                //                 arr[position].y = eventAppSprite.y + offset.line_a_offset.y * eventAppSprite.scale.y;
                //                 break;
                //             case "line_b":
                //                 arr[position].clear();
                //                 arr[position].lineStyle(1, 0x66CCFF, 1);
                //                 arr[position].lineTo(0, arr[2].y - arr[1].y)
                //                 arr[position].x = eventAppSprite.x + offset.line_b_offset.x * eventAppSprite.scale.x;
                //                 arr[position].y = eventAppSprite.y + offset.line_b_offset.y * eventAppSprite.scale.y;
                //                 break;
                //             case "line_c":
                //                 arr[position].clear();
                //                 arr[position].lineStyle(1, 0x66CCFF, 1);
                //                 arr[position].lineTo(arr[3].x - arr[2].x, 0)
                //                 arr[position].x = eventAppSprite.x + offset.line_c_offset.x * eventAppSprite.scale.x;
                //                 arr[position].y = eventAppSprite.y + offset.line_c_offset.y * eventAppSprite.scale.y;
                //                 arr[position].endFill()
                //                 break;
                //             case "line_d":
                //                 arr[position].clear();
                //                 arr[position].lineStyle(1, 0x66CCFF, 1);
                //                 arr[position].lineTo(0, arr[0].y - arr[3].y)
                //                 arr[position].x = eventAppSprite.x + offset.line_d_offset.x * eventAppSprite.scale.x;
                //                 arr[position].y = eventAppSprite.y + offset.line_d_offset.y * eventAppSprite.scale.y;
                //                 arr[position].endFill()
                //                 break;
                //         }

                //     })
                // })
            }
            break;
    }

}


function test2(newScale, newPos) {
    rectContainerArray.forEach((data, index) => {
        let offset = rectCoordinate[index];
        data.children.forEach((val, position, arr) => {
            switch (val.name) {
                case "point_a":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).beginFill(0x66CCFF); // 蓝
                    data.getChildAt(position).drawCircle(0, 0, 4);
                    data.getChildAt(position).endFill();
                    data.getChildAt(position).x = offset.point_a_offset.x * newScale + newPos.x;
                    data.getChildAt(position).y = offset.point_a_offset.y * newScale + newPos.y;
                    data.getChildAt(position).endFill();
                    break;
                case "point_b":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).beginFill(0x66CCFF); // 蓝
                    data.getChildAt(position).drawCircle(0, 0, 4);
                    data.getChildAt(position).endFill();
                    data.getChildAt(position).x = offset.point_b_offset.x * newScale + newPos.x;
                    data.getChildAt(position).y = offset.point_b_offset.y * newScale + newPos.y;
                    data.getChildAt(position).endFill()
                    break;
                case "point_c":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).beginFill(0x66CCFF); // 蓝
                    data.getChildAt(position).drawCircle(0, 0, 4);
                    data.getChildAt(position).endFill();
                    data.getChildAt(position).x = offset.point_c_offset.x * newScale + newPos.x;
                    data.getChildAt(position).y = offset.point_c_offset.y * newScale + newPos.y;
                    data.getChildAt(position).endFill()
                    break;
                case "point_d":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).beginFill(0x66CCFF); // 蓝
                    data.getChildAt(position).drawCircle(0, 0, 4);
                    data.getChildAt(position).endFill();
                    data.getChildAt(position).x = offset.point_d_offset.x * newScale + newPos.x;
                    data.getChildAt(position).y = offset.point_d_offset.y * newScale + newPos.y;
                    data.getChildAt(position).endFill()
                    break;
                case "line_a":

                    data.getChildAt(position).clear();
                    data.getChildAt(position).lineStyle(1, 0x66CCFF, 1);
                    data.getChildAt(position).lineTo(arr[1].x - arr[0].x, 0)
                    data.getChildAt(position).x = offset.point_a_offset.x * newScale + newPos.x;
                    data.getChildAt(position).y = offset.point_a_offset.y * newScale + newPos.y;
                    data.getChildAt(position).endFill()

                    break;
                case "line_b":

                    data.getChildAt(position).clear();
                    data.getChildAt(position).lineStyle(1, 0x66CCFF, 1);
                    data.getChildAt(position).lineTo(0, arr[2].y - arr[1].y)
                    data.getChildAt(position).x = offset.point_b_offset.x * newScale + newPos.x;
                    data.getChildAt(position).y = offset.point_b_offset.y * newScale + newPos.y;
                    data.getChildAt(position).endFill()

                    break;
                case "line_c":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).lineStyle(1, 0x66CCFF, 1);
                    data.getChildAt(position).lineTo(arr[3].x - arr[2].x, 0)
                    data.getChildAt(position).x = offset.point_c_offset.x * newScale + newPos.x;
                    data.getChildAt(position).y = offset.point_c_offset.y * newScale + newPos.y;
                    data.getChildAt(position).endFill()
                    break;
                case "line_d":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).lineStyle(1, 0x66CCFF, 1);
                    data.getChildAt(position).lineTo(0, arr[0].y - arr[3].y)
                    data.getChildAt(position).x = offset.point_d_offset.x * newScale + newPos.x;
                    data.getChildAt(position).y = offset.point_d_offset.y * newScale + newPos.y;
                    data.getChildAt(position).endFill()
                    break;
            }

        })
    })
}


function test() {
    //  rectContainerArray 存自定义矩形的数组
    rectContainerArray.forEach((data, index) => {
        console.log(data.name)
        //  相对于图像的坐标
        let offset = rectCoordinate[index];
        console.log(rectCoordinate)

        //  循环更新坐标点
        data.children.forEach((val, position, arr) => {
            switch (val.name) {
                case "point_a":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).beginFill(0x66CCFF); // 蓝
                    data.getChildAt(position).drawCircle(0, 0, 4);
                    data.getChildAt(position).x = eventAppSprite.x + offset.point_a_offset.x * eventAppSprite.scale.x;
                    data.getChildAt(position).y = eventAppSprite.y + offset.point_a_offset.y * eventAppSprite.scale.y;
                    data.getChildAt(position).endFill()
                    break;
                case "point_b":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).beginFill(0x66CCFF); // 蓝
                    data.getChildAt(position).drawCircle(0, 0, 4);
                    data.getChildAt(position).x = eventAppSprite.x + offset.point_b_offset.x * eventAppSprite.scale.x;
                    data.getChildAt(position).y = eventAppSprite.y + offset.point_b_offset.y * eventAppSprite.scale.y;
                    data.getChildAt(position).endFill()
                    break;
                case "point_c":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).beginFill(0x66CCFF); // 蓝
                    data.getChildAt(position).drawCircle(0, 0, 4);
                    data.getChildAt(position).x = eventAppSprite.x + offset.point_c_offset.x * eventAppSprite.scale.x;
                    data.getChildAt(position).y = eventAppSprite.y + offset.point_c_offset.y * eventAppSprite.scale.y;
                    data.getChildAt(position).endFill()
                    break;
                case "point_d":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).beginFill(0x66CCFF); // 蓝
                    data.getChildAt(position).drawCircle(0, 0, 4);
                    data.getChildAt(position).x = eventAppSprite.x + offset.point_d_offset.x * eventAppSprite.scale.x;
                    data.getChildAt(position).y = eventAppSprite.y + offset.point_d_offset.y * eventAppSprite.scale.y;
                    data.getChildAt(position).endFill()
                    break;
                case "line_a":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).lineStyle(1, 0x66CCFF, 1);
                    data.getChildAt(position).lineTo(arr[1].x - arr[0].x, 0)
                    data.getChildAt(position).x = eventAppSprite.x + offset.point_a_offset.x * eventAppSprite.scale.x;
                    data.getChildAt(position).y = eventAppSprite.y + offset.point_a_offset.y * eventAppSprite.scale.y;
                    data.getChildAt(position).endFill()
                    break;
                case "line_b":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).lineStyle(1, 0x66CCFF, 1);
                    data.getChildAt(position).lineTo(0, arr[2].y - arr[1].y)
                    data.getChildAt(position).x = eventAppSprite.x + offset.point_b_offset.x * eventAppSprite.scale.x;
                    data.getChildAt(position).y = eventAppSprite.y + offset.point_b_offset.y * eventAppSprite.scale.y;
                    data.getChildAt(position).endFill()
                    break;
                case "line_c":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).lineStyle(1, 0x66CCFF, 1);
                    data.getChildAt(position).lineTo(arr[3].x - arr[2].x, 0)
                    data.getChildAt(position).x = eventAppSprite.x + offset.point_c_offset.x * eventAppSprite.scale.x;
                    data.getChildAt(position).y = eventAppSprite.y + offset.point_c_offset.y * eventAppSprite.scale.y;
                    data.getChildAt(position).endFill()
                    break;
                case "line_d":
                    data.getChildAt(position).clear();
                    data.getChildAt(position).lineStyle(1, 0x66CCFF, 1);
                    data.getChildAt(position).lineTo(0, arr[0].y - arr[3].y)
                    data.getChildAt(position).x = eventAppSprite.x + offset.point_d_offset.x * eventAppSprite.scale.x;
                    data.getChildAt(position).y = eventAppSprite.y + offset.point_d_offset.y * eventAppSprite.scale.y;
                    data.getChildAt(position).endFill()
                    break;
            }

        })
    })

}



//拖拽完成，松开鼠标或抬起手指
function onDragEnd() {
    switch (eventCursor) {
        case 1:
            break;
        case 2:
            break;
        default:
            if (eventDragging) {
                eventDragging = false
            }
            break;
    }

}


function addPoint(x, y, radius) {
    let point = new Graphics();
    point.beginFill(0x66CCFF);
    point.drawCircle(0, 0, radius);
    point.endFill();
    point.x = x;
    point.y = y;
    point.alpha = 0.5;
    pushChild("point", point)
}

function addRect() {
    let rect = new Graphics()
    // 矩形
    rect.lineStyle(1, 0xFF3300, 1);
    rect.beginFill(0x66CCFF);
    rect.drawRect(0, 0, 50, 50);
    rect.endFill();
    rect.x = 50;
    rect.y = 50;
    rect.alpha = 0.3;
    pushChild("rect", rect);
}

function pushChild(type, child) {
    app.stage.addChild(child)
    lable.push(child)
    console.log(child)
    switch (type) {
        case "point":
            coordinate.push({
                type: "point",
                x: child.position.x,
                y: child.position.y,
                offset: {
                    x: child.position.x - image.position.x,
                    y: child.position.y - image.position.y
                }
            })
            break
        case "rect":
            coordinate.push({
                type: "rect",
                x: child.position.x,
                y: child.position.y,
                width: child.width,
                height: child.height,
                offset: {
                    x: child.position.x - image.position.x,
                    y: child.position.y - image.position.y
                }
            })
            break
        default:

            break
    }

}




function setCursor(tag) {
    eventCursor = tag;
}


//获取鼠标指针在元素内的位置
//参数：e表示当前事件对象，o表示当前元素
//返回值：返回相对坐标对象
function getLocalPosition(e, o) {
    var e = e || window.event;
    return {
        x: e.offsetX || (e.layerX - o.offsetLeft),
        y: e.offsetY || (e.layerY - o.offsetTop)
    }
}

let plugin = {
    init: init,
    getPixiApp: getPixiApp,
    getImageResources: getImageResources,
    addImageList: addImageList,
    setImage: setImage,
    getImage: getImage,
    addPoint: addPoint,
    addRect: addRect,
    setCursor: setCursor,
    test: test,
    end: () => { }
}

export default plugin