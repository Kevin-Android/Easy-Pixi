import * as PIXI from 'pixi.js'

const PixiApp = PIXI.Application;
const Texture = PIXI.Texture;
const Graphics = PIXI.Graphics;
const Sprite = PIXI.Sprite;
const Loader = PIXI.Loader;
const defaultOptions = {
    width: 800,
    height: 800,
    backgroundColor: 0x393e4a,
    backgroundAlpha: 1, // default: false 透明度
    antialias: true,    // default: false 反锯齿
    resolution: 1       // default: 1 分辨率 
}
const scaleBy = 1.1;

let app;
let eventApp;
let appLoader;
let imageResources;
let image;
let pointer = {
    x: 0,
    y: 0,
}
let lable = new Array();
let coordinate = new Array();
let cursor = 0;
let stageBoundary = { top: 0, right: 0, bottom: 0, left: 0 };
let eventDiff;
let eventDragging;
let eventData;



function init(dom, options = defaultOptions) {
    app = new PixiApp(options);
    options.backgroundAlpha = 0;
    eventApp = new PixiApp(options);
    dom.append(app.view);
    dom.append(eventApp.view);
    app.resizeTo = dom;
    eventApp.resizeTo = dom;
    stageBoundary.right = app.renderer.width;
    stageBoundary.bottom = app.renderer.height;
    window.onresize = () => {
        return (() => {
            app.resize();
            eventApp.resize();
            stageBoundary.right = app.renderer.width;
            stageBoundary.bottom = app.renderer.height;
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
    console.log("初始化成功", app.view.style);
    console.log("初始化成功", eventApp.view.style);


}

function onStageDragMove(e) {
    console.log("全局", e)
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
    image = new Sprite(loaderResource.texture);
    app.stage.addChild(image);
    //  启用交互性！
    image.interactive = true;
    //  鼠标变手型
    image.buttonMode = true;
    //  给图片添加事件
    image
        .on('pointerdown', onDragStart)
        .on('pointermove', onDragMove)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)

}
//  更新鼠标坐标
function setPointer(val) {
    pointer = val
}

function getPointer() {
    return pointer;
}

function setOnMouseWheel(event) {
    if (getImage() === undefined) {
        console.log("你的图像为：", getImage(), "！！！请设置图片😓");
        return;
    }
    //  获取到当前缩放比例
    var oldScale = getImage().scale.x;
    //  获取到当前鼠标坐标
    var pointer = getPointer();
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
    getImage().scale.x = newScale;
    getImage().scale.y = newScale;
    //  获得图像新坐标当前鼠标坐标减去本次缩放的距离
    var newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
    };


    getImage().position.x = newPos.x;
    getImage().position.y = newPos.y;

    lable.forEach((val, index, arr) => {
        switch (coordinate[index].type) {
            case "point":
                // console.log("点", direction > 0 ? "放大" : "缩小", "改变坐标", val.x, val.y, val, coordinate[index]);
                val.position.x = (coordinate[index].offset.x * newScale + newPos.x);
                val.position.y = (coordinate[index].offset.y * newScale + newPos.y);
                //val.position.x = (coordinate[index].offset.x * newScale + newPos.x) + coordinate[index].width * newScale;
                //val.position.y = (coordinate[index].offset.y * newScale + newPos.y) + coordinate[index].height * newScale;
                // val.width = coordinate[index].width * newScale;
                // val.height = coordinate[index].height * newScale;
                console.log("图像缩放比例", newScale)
                console.log("点的原始x坐标", coordinate[index].offset.x)
                console.log("图像缩放后的x", newPos.x)
                console.log("结果", (coordinate[index].offset.x * newScale + newPos.x))
                console.log(getImage())
                break
            case "rect":
                val.position.x = coordinate[index].offset.x * newScale + newPos.x;
                val.position.y = coordinate[index].offset.y * newScale + newPos.y;
                // val.width = coordinate[index].width * newScale;
                // val.height = coordinate[index].height * newScale;
                break
            default:
                break
        }
    })


}



//开始拖拽
function onDragStart(event) {
    eventDragging = true
    eventData = event.data
    // 鼠标点击位置和图形位置的偏移量，用于移动计算
    eventDiff = { x: event.data.global.x - this.x, y: event.data.global.y - this.y }
    var pointerPosition = event.data.getLocalPosition(app.stage);
    console.log(pointerPosition);
    lable.forEach((val, index) => {
        console.log(coordinate[index])
        console.log(val)

    })
}

//拖拽移动中
function onDragMove(e) {
    if (eventDragging) {
        var pointerPosition = e.data.getLocalPosition(app.stage);
        const newPosition = eventData.getLocalPosition(this.parent)
        if (pointerPosition.x <= 1 || pointerPosition.x >= stageBoundary.right) {
            console.log("停止", pointerPosition, stageBoundary)
            onDragEnd()
            return;
        }
        if (pointerPosition.y <= 1 || pointerPosition.y >= stageBoundary.bottom) {
            console.log("停止", pointerPosition, stageBoundary)
            onDragEnd()
            return;
        }
        this.x = newPosition.x - eventDiff.x;
        this.y = newPosition.y - eventDiff.y;
        lable.forEach((val, index) => {
            let valX = this.x + coordinate[index].x * this.scale.x;
            let valY = this.y + coordinate[index].y * this.scale.y;
            val.position.x = valX
            val.position.y = valY
        })

    }
}
//拖拽完成，松开鼠标或抬起手指
function onDragEnd() {
    if (eventDragging) {
        eventDragging = false
        eventData = null
    }
}

let point;

function addPoint(x, y, radius) {
    point = new Graphics();
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


function cursorEvent(x, y) {
    switch (cursor) {
        case 0:
            break;
        case 1:
            addPoint(x, y, 2)
            break;
        default:
            break;
    }
}

function setCursor(tag) {
    cursor = tag;
}


let plugin = {
    init: init,
    getPixiApp: getPixiApp,
    getImageResources: getImageResources,
    addImageList: addImageList,
    setImage: setImage,
    getImage: getImage,
    setOnMouseWheel: setOnMouseWheel,
    setPointer: setPointer,
    getPointer: getPointer,
    addPoint: addPoint,
    addRect: addRect,
    setCursor: setCursor,
    end: () => { }
}

export default plugin